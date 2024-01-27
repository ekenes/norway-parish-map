import { defineCustomElements as defineCalciteElements } from "@esri/calcite-components/dist/loader";
defineCalciteElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.3.0/assets",
});

import {
  FeaturesWidget,
  LegendWidget,
  SearchWidget,
  defineCustomElements as defineMapElements,
} from "@arcgis/map-components/dist/loader";
defineMapElements();

import { on } from "@arcgis/core/core/reactiveUtils";
import uniqueValues from "@arcgis/core/smartMapping/statistics/uniqueValues";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

const mapElement = document.querySelector<HTMLArcgisMapElement>("arcgis-map");

const loadMap = async () => {
  const view = mapElement?.view;
  const map = view?.map;

  const countiesLayer = map?.layers.find((layer) => layer.title === "Counties (fylke)") as __esri.FeatureLayer;
  const parishLayer = map?.layers.find((layer) => layer.title === "Parishes (sokn)") as __esri.FeatureLayer;

  const featuresElement =
    document.querySelector<HTMLArcgisFeaturesElement>("arcgis-features");
  const searchElement =
    document.querySelector<HTMLArcgisSearchElement>("arcgis-search");
  const legendElement =
    document.querySelector<HTMLArcgisLegendElement>("arcgis-legend");

  const countyComboBoxElement = document.getElementById("county-combobox") as HTMLCalciteComboboxElement;
  const parishComboBoxElement = document.getElementById("parish-combobox") as HTMLCalciteComboboxElement;

  const { uniqueValueInfos } = await uniqueValues({
    layer: countiesLayer,
    field: "COUNTY"
  });

  uniqueValueInfos.forEach( uvi => {
    const name = uvi.value as string;

    const item = document.createElement("calcite-combobox-item");
    item.value = name;
    item.setAttribute("text-label", name);
    countyComboBoxElement.appendChild(item);

    const groupItem = document.createElement("calcite-combobox-item-group");
    groupItem.label = name;
    parishComboBoxElement.appendChild(groupItem);
  });

  searchElement!.view = view as SearchWidget["view"];
  featuresElement!.view = view as FeaturesWidget["view"];
  legendElement!.view = view as LegendWidget["view"];

  // Open the Features widget with features fetched from
  // the view click event location.

  on(
    () => view,
    "click",
    (event) => {
      event.stopPropagation();
      featuresElement!.open({
        location: event.mapPoint,
        fetchFeatures: true,
      });
    }
  );

  let activeWidget: string | null;

  const shellPanel = document.querySelector(`calcite-shell-panel`);

  const handleActionBarClick = ({ target }: any) => {
    if (activeWidget) {
      (document.querySelector(
        `[data-action-id=${activeWidget}]`
      ) as HTMLCalciteActionElement)!.active = false;
      (document.querySelector(
        `[data-panel-id=${activeWidget}]`
      ) as HTMLCalciteActionElement)!.hidden = true;
    }

    if (target.tagName !== "CALCITE-ACTION") {
      shellPanel!.collapsed = true;
      activeWidget = null;
      return;
    }
    shellPanel!.collapsed = false;

    const nextWidget = target.dataset.actionId;
    if (nextWidget !== activeWidget) {
      (document.querySelector(
        `[data-action-id=${nextWidget}]`
      ) as HTMLCalciteActionElement)!.active = true;
      (document.querySelector(
        `[data-panel-id=${nextWidget}]`
      ) as HTMLCalciteActionElement)!.hidden = false;
      activeWidget = nextWidget;
    } else {
      activeWidget = null;
      shellPanel!.collapsed = true;
    }
  };

  document
    .querySelector("calcite-action-bar")
    ?.addEventListener("click", handleActionBarClick);
};

if (mapElement!.ready) {
  loadMap();
} else {
  mapElement!.addEventListener("arcgisViewReadyChange", loadMap);
}
