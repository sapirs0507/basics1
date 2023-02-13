import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import { environment } from "src/environments/environment.development";

const BlueLineQueryOutFields = ['pl_name', 'station_desc', 'pl_area_dunam']

const BlueLinesLayer = {
    title: 'blue lines',
    copyright: 'xplan',
    maxrecordcount: 1000,
    minScale: 50000,
    maxScale: 0,
    wkid: 2039,
    highlightOptions:{
      haloOpacity:0.9,
      fillOpacity:0.2,
      color:[255,255,0,1],
    },
    fullExtent: {
        SpatialReference: new SpatialReference({
            wkid: 2039
        }),
        xmin: 130160.27670000028,
        xmax: 284068.47009999957,
        ymin: 374060.0061000008,
        ymax: 804540.1301000006
    },
    units: 'esriMeters',
    maxImageHeight: 4096,
    maxImageWidth: 4096,
    url: "https://ags.iplan.gov.il/arcgisiplan/rest/services/PlanningPublic/Xplan/MapServer/1",
    imageLayerUrl: "https://ags.iplan.gov.il/arcgisiplan/rest/services/PlanningPublic/Xplan/MapServer",
    queryUrl: "https://ags.iplan.gov.il/arcgisiplan/rest/services/PlanningPublic/XplanNoKanam/MapServer/0",
    zoom: 7
}

const IsraelCoordinates = {
    latitude: 31.4117257,
    longitude: 35.0818155
}

const symbol = {
    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      color: [226, 119, 40],
      outline: { // autocasts as new SimpleLineSymbol()
        color: 'black',
        width: 2
      }
}

const lineSymbol = {
    type: "simple-line", // autocasts as SimpleLineSymbol()
    color: 'black',
    width: 3
  }; 

  const fillSymbol = {
    type: "simple-fill", // autocasts as new SimpleFillSymbol()
    color: [227, 139, 79, 0.8],
    outline: { // autocasts as new SimpleLineSymbol()
      color: [255, 255, 255],
      width: 1
    }
  };

  export const matSliderScaleValue = 5000000;
  export const matSliderZoomValue = 7;
  export const  minValue = 500;
  export const maxValue = 5000000;
  export const step = 1;

  export const GrahpicalChoicesControl = -1;

export {BlueLinesLayer,BlueLineQueryOutFields, IsraelCoordinates, symbol, lineSymbol, fillSymbol}