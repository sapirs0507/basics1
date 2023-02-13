import {
  BlueLineQueryOutFields,
  BlueLinesLayer,
  IsraelCoordinates,
  fillSymbol,
  lineSymbol,
  symbol,
} from '../config/esri-map.config';
import MapView from '@arcgis/core/views/MapView';
import esriConfig from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic';
import Polyline from '@arcgis/core/geometry/Polyline';
import { PeriodicElement } from '../interfaces/PeriodicElement.interface';
import { Subject, takeUntil } from 'rxjs';
import {
  graphicalChoices,
  onClickEventChoices,
} from '../enums/graphicalChoices.enum';
import Polygon from '@arcgis/core/geometry/Polygon';
import Point from '@arcgis/core/geometry/Point';
import Legend from '@arcgis/core/widgets/Legend';
import Expend from '@arcgis/core/widgets/Expand';
import { environment } from 'src/environments/environment.development';
import Extent from '@arcgis/core/geometry/Extent';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Query from '@arcgis/core/rest/support/Query';
import * as query from '@arcgis/core/rest/query';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import { ElementRef } from '@angular/core';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import Sublayer from '@arcgis/core/layers/support/Sublayer';
import Color from "@arcgis/core/Color";
import Map from '@arcgis/core/Map';
import Accessor from "@arcgis/core/core/Accessor";
import { subclass } from "@arcgis/core/core/accessorSupport/decorators";


export interface IEsriMapClass {
  clickEventChoice: number;
  showLegend: boolean;
  graphicalChoice: number;
  linesArray: __esri.Point[];
  polygonArray: __esri.Point[];
  attributesArray: PeriodicElement[];
  untilServiceFinished: Subject<void>;
}

@subclass("esri.MapView")
export class EsriMapClass extends MapView{
  private showLegend: boolean = true;
  private clickEventChoice: number = -1;
  private graphicalChoice: number = -1;
  private linesArray!: __esri.Point[];
  private polygonArray!: __esri.Point[];
  private attributesArray!: PeriodicElement[];
  private container_value!: ElementRef;
  
  attribuesArray$: Subject<PeriodicElement[]> = new Subject<PeriodicElement[]>();
 

  constructor(properties?: __esri.MapViewProperties) {
    super(properties);
    this.clickEventChoice = -1;
    this.graphicalChoice = -1;
    this.showLegend = true;
    this.attributesArray = Array<PeriodicElement>();
    this.attribuesArray$.next(this.attributesArray);
  }

  async initMap() {
    //map events and layers
    this.setMapViewEvents();
  }

  setMapViewEvents() {
    //onClick event
    this.when(() => {
      //change location later
      this.polygonArray = new Array<__esri.Point>();
      this.linesArray = new Array<__esri.Point>();

      this?.on('click', (event: __esri.ViewClickEvent) => {
        switch (this.clickEventChoice) {
          case onClickEventChoices.graphic:
            this.OnGraphicalChoiceEvent(event);
            break;
          case onClickEventChoices.queryLayers:
            this.queryForPlansByClickOnPoint(event);
            break;
          default:
            break;
        }
      });
    });
  }

  addMapImageLayer = () => {
    const fextent = BlueLinesLayer.fullExtent;

    let layer = new MapImageLayer({
      copyright: 'xplan',
      title: 'blue lines layer',
      id: 'map_image_layer_blue_lines',
      url: BlueLinesLayer.imageLayerUrl,
      imageFormat: 'png',
      minScale: BlueLinesLayer.minScale,
      maxScale: BlueLinesLayer.maxScale,
      fullExtent: new Extent({
        spatialReference: new SpatialReference({
          wkid: BlueLinesLayer.wkid,
        }),
        xmax: fextent.xmax,
        ymax: fextent.ymax,
        xmin: fextent.xmin,
        ymin: fextent.ymin,
      }),
      imageMaxHeight: BlueLinesLayer.maxImageHeight,
      imageMaxWidth: BlueLinesLayer.maxImageWidth,
      sublayers: [
        new Sublayer({
          id: 1,
          visible: true,
        }),
      ],
    });

    // load the resources referenced in this class
    layer.load();

    layer
      .when(() => {
        // layer instance created
        this.map?.add(layer);
      })
      .then(() => {
        // after the layer is added get the legend for the layer
        this.getLegend();
      });
  };

  CenterByLongtitudeAndLatitude(longitude: number, latitude: number): void {
    this.goTo({
      center: [longitude, latitude],
    });
  }

  // Check if you can activate the functions: zoomIn and zoomOut before
  // activating them
  zoomIn() {
    this.zoom++;
  }
  zoomOut() {
    this.zoom--;
  }

  setMapViewZoom(value: number) {
    this.set('zoom', value);
  }

  setMapViewScale(value: number) {
    this.set('scale', value);
  }

  setClickEventChoice(choice: number) {
    this.clickEventChoice = choice;
  }

  private addPointToPolygonArray(point: __esri.Point) {
    this.polygonArray?.push(point);
  }

  private addPointsToPolygonArray(points: __esri.Point[]) {
    points.forEach((point) => this.addPointToPolygonArray(point));
  }

  private deleteArrayItems(array: Array<any>) {
    array?.splice(0);
  }

  private OnGraphicalChoiceEvent(event: __esri.ViewClickEvent) {
    // choose which graphical choice you want to add to the graphic layer: point, line or polygon
    switch (this.graphicalChoice) {
      case graphicalChoices.points:
        this.addPointToMapView(event.mapPoint);
        break;
      case graphicalChoices.lines:
        this.handleLines(event);
        break;
      case graphicalChoices.polygon:
        this.addPolygon();
        break;
      default:
        break;
    }
  }

  addPointToMapView(point: __esri.Point) {
    // take Point object from the event and add it to the graphics layer
    const graphicPoint: __esri.Graphic = new Graphic({
      geometry: point,
      symbol: symbol, //symbol from the config page
    });
    this.graphics.add(graphicPoint);
  }

  handleLines(event: __esri.ViewClickEvent) {
    if (event.button === 2) {
      //right click finishes the n-th continuous line
      this.deleteArrayItems(this.linesArray);
      return;
    }
    this.linesArray.push(event.mapPoint);
    this.addLineToMapView();
  }

  addLineToMapView() {
    // take Point object array from the event and add it to the graphics layer
    if (!(this.linesArray && this.linesArray.length > 1)) return;

    var polyline = new Polyline({
      hasM: true,
      hasZ: false,
    });

    // array of points
    polyline.addPath(this.linesArray ? this.linesArray : []);

    const graphicLines = new Graphic({
      geometry: polyline,
      symbol: lineSymbol, //symbol from the config page
    });

    if (this.graphics?.length > 0) {
      this.graphics.map((graphic) => {
        if (graphic.geometry.type === 'polyline') {
          graphic.destroy();
          return '';
        }
        return graphic;
      });
    }

    this.graphics.add(graphicLines);
  }

  addPolygon() {
    // take Ring object and add an array of Points (starting point == finish point)
    // and add it to the graphics layer

    this.polygonArray?.push(
      new Point({
        x: 31.411,
        y: 35.0818155,
      }),
      new Point({
        x: 33.4117257,
        y: 34.0818155,
      }),
      new Point({
        x: 29.4117257,
        y: 34.0818155,
      }),
      new Point({
        x: 31.411,
        y: 35.0818155,
      })
    );

    var poligon = new Polygon();

    //empty ring array
    poligon.addRing([]);

    //adding to the ring[0], point object with index 0
    this.polygonArray?.forEach((polygonPoint) => {
      poligon.insertPoint(0, 0, polygonPoint);
    });

    var graphic = new Graphic({
      geometry: poligon,
      symbol: fillSymbol, //symbol from the config page
    });

    this.graphics.add(graphic);
  }

  setGraphicalChoice(newGraphicalChoice: number) {
    // set graphicalChoice = {0: point, 1: line, 2: polygon}
    // click = {0: graphics, 1: query}
    this.graphicalChoice = newGraphicalChoice;
    this.clickEventChoice =
      this.graphicalChoice !== -1
        ? onClickEventChoices.graphic
        : onClickEventChoices.queryLayers;
  }

  clearMapOfGraphics = () => {
    //removes the points, lines and polygon from the map
    if (this.graphics.length > 0) {
      this.graphics.removeAll();
    }
  };
  private clearArray() {
    if (!this.attributesArray) this.attributesArray = new Array();
    else {
      for (let i = 0; i < this.attributesArray.length; i++) {
        this.attributesArray.pop();
      }
    }
  }

  queryForPlansByClickOnPoint(event: __esri.ViewClickEvent) {
    const currentExtent = this.extent as Extent;
    const queryObject = new Query({
      outFields: BlueLineQueryOutFields,
      returnQueryGeometry: true,
      outSpatialReference: currentExtent.spatialReference,
      geometry: event.mapPoint,
      spatialRelationship: 'intersects',
    });

    query
      .executeQueryJSON(BlueLinesLayer.url, queryObject)
      .then((res: FeatureSet) => {
        this.clearArray();
        let arr = res.features
          .filter((feature, index) => index < 3)
          .map((feature) => feature.attributes);
        this.attributesArray = [...arr];
        this.attribuesArray$.next([...arr]);
      });
  }

  getAttributesArray = () => {
    if (this.attributesArray && this.attributesArray.length > 0)
      return this.attributesArray;
    else return new Array() as PeriodicElement[];
  };

  getLegend() {
    const myLayer = this.map?.findLayerById('map_image_layer_blue_lines');
    if (myLayer?.isFulfilled() && this.showLegend) {
      const legend = new Expend({
        view: this,
        expanded: true,
        content: new Legend({
          view: this,
          layerInfos: [
            {
              layer: myLayer,
              title: 'מקרא מפה',
            },
          ],
        }),
      });

      this.ui.add(legend, 'bottom-right');
      this.showLegend = !this.showLegend;
    }
  }
}
