import { defineCustomElements as defineCalciteElements } from "@esri/calcite-components/dist/loader";
defineCalciteElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.3.0/assets",
});

import { defineCustomElements as defineMapElements } from "@arcgis/map-components/dist/loader";
defineMapElements();

const mapElement = document.querySelector<HTMLArcgisMapElement>("arcgis-map");

const loadMap = async () => {
  const view = mapElement?.view;


  let activeWidget: string | null;

  const shellPanel = document.querySelector(
    `calcite-shell-panel`
  );

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
}

if (mapElement!.ready) {
  loadMap();
} else {
  mapElement!.addEventListener("arcgisViewReadyChange", loadMap);
}
