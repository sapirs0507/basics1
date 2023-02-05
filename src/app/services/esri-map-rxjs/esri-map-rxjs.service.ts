import { OnInit, Injectable, OnDestroy, ElementRef } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { BlueLinesLayer, fillSymbol, IsraelCoordinates, lineSymbol, symbol } from 'src/app/config/esri-map.config';
import { graphicalChoices, onClickEventChoices } from 'src/app/enums/graphicalChoices.enum';

import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import esriConfig from "@arcgis/core/config";
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Point from '@arcgis/core/geometry/Point';
import Extent from '@arcgis/core/geometry/Extent';
import Graphic from '@arcgis/core/Graphic';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import MapImageLayer from "@arcgis/core/layers/MapImageLayer";
import Sublayer from "@arcgis/core/layers/support/Sublayer";
// import FeatureTable from "@arcgis/core/widgets/FeatureTable";
import * as query from "@arcgis/core/rest/query";
import Legend from "@arcgis/core/widgets/Legend";
import Expend from "@arcgis/core/widgets/Expand";




import Query from "@arcgis/core/rest/support/Query";


import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

import esri = __esri;
import { PeriodicElement } from 'src/app/interfaces/PeriodicElement.interface';


@Injectable({
  providedIn: 'root'
})
export class EsriMapRxjsService implements OnInit, OnDestroy {

  untilServiceFinished: Subject<void> = new Subject();
  mapUpdated: Subject<MapView> = new Subject<MapView>();
  container: Subject<ElementRef> = new Subject<ElementRef>();
  attribuesArray$: Subject<PeriodicElement[]> = new Subject<PeriodicElement[]>();
  private symbol: object = symbol
  private showLegend: boolean = true;
  private container_value?: ElementRef;
  private map?: Map;
  private mapView?: MapView;
  isMapViewInit: boolean = false;
  isMapInit: boolean = false;
  private clickEventChoice: number = onClickEventChoices.queryLayers;
  private graphicalChoice: number = -1;

  private linesArray!: esri.Point[]; // as one line, or each two points are a line
  private polygonArray!: esri.Point[];
  private attributesArray!: PeriodicElement[];

   saptialRef = new SpatialReference({
    wkid: 2039
  })

  constructor() {
    console.log("esri-map service component -> constructor")

    //subscription for the DOM element ref - is it already initialized or not
    this.container
      .pipe(takeUntil(this.untilServiceFinished))
      .subscribe();

    //subscription to map updates
    this.mapUpdated
      .pipe(takeUntil(this.untilServiceFinished))
      .subscribe((mapview) => {
        this.isMapViewInit = mapview.isFulfilled(); // was creating an instance of the class fulfilled (boolean)
      }
      );
  }
  

  ngOnInit(): void {
    console.log("esri-map service component -> ngOnInit");
  }

  ngOnDestroy(): void {
    console.log("esri-map service component -> ngOnDestroy")

    this.untilServiceFinished.complete(); // unsubscribe from all the observables
    this.mapView?.destroy(); // destory map
  }

  goto = (longitude: number, latitude: number) => {
    this.mapView?.goTo({
      center: [longitude, latitude]
    });
  }

  setMapViewZoom = (value: number) => {
    this.mapView?.set('zoom', value);
  }

  setMapViewScale = (value: number) => {
    this.mapView?.set('scale', value);
  }

  setGraphicalChoice(newGraphicalChoice: number) {
    // set graphicalChoice = {0: point, 1: line, 2: polygon}
    // click = {0: graphics, 1: query}
    this.graphicalChoice = newGraphicalChoice;
    this.clickEventChoice = this.graphicalChoice !== -1? 
                            onClickEventChoices.graphic: onClickEventChoices.queryLayers;
  }

  setClickEventChoice = (choice: number) => {
    this.clickEventChoice = choice;
  }

  setContainer = (elRef: ElementRef) => {
    // if elfRef is undefined setting it as the container 
    // is an error.
    if (elRef === undefined || elRef.nativeElement===null) return;

    // set the mapView container as the native element 
    this.mapView?.set("container", elRef.nativeElement);
    this.container_value = elRef;
    // emit the native element with the subject
    this.container.next(elRef);
  }

  initMap = async () => {
    //create the map, mapView and initialize them

    //set the arcgis_api
    esriConfig.apiKey = environment.arcgis_api;

    //map extent with the same saptial ref as the feature layer (to sync them)
    //as well as the same xmin, xmax, ymin, ymax as the feature layer 
    const extent = new Extent({
      spatialReference: this.saptialRef,
      xmin: BlueLinesLayer.fullExtent.xmin,
      xmax: BlueLinesLayer.fullExtent.xmax,
      ymin: BlueLinesLayer.fullExtent.ymin,
      ymax: BlueLinesLayer.fullExtent.ymax
    });


    this.map = new Map({
      //world map from arcgis js api (esri)
      basemap: "arcgis-imagery"
    })

    this.mapView = new MapView({
      //tell the mapView which map it should show on the screen
      map: this.map,
      //center the map to Israel coordinates
      center: new Point({
        //center point for israel
        latitude: IsraelCoordinates.latitude,
        longitude: IsraelCoordinates.longitude
      }),
      extent: extent,
      zoom: BlueLinesLayer.zoom,
      //set container if exsists
      container: this.container_value?.nativeElement,
      highlightOptions: {
        color: [255,255,0,1],
        haloOpacity: 0.9,
        fillOpacity: 0.2
      }
    });

      //map events and layers
      this.setMapViewEvents();
      

      //emit the finished map 
      this.mapUpdated.next(this.mapView);

      
  }

  setMapViewEvents = () => {
    //onClick event
    this.mapView?.when(()=>{
      //change location later
      this.polygonArray = new Array<esri.Point>();
      this.linesArray = new Array<esri.Point>();

      
      this.mapView?.on('click', (event: esri.ViewClickEvent) => {
       
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
      })

    })
   
  }

  private OnGraphicalChoiceEvent = (event: esri.ViewClickEvent) => {
    switch (this.graphicalChoice) {
      case graphicalChoices.points:
        this.addPointToMapView(event.mapPoint);
        break;
      case graphicalChoices.lines:
        this.linesArray.push(event.mapPoint);
        this.addLineToMapView()
        break;
      case graphicalChoices.polygon:
        this.addPolygon();
        break;
      default:
        
        break;
    }
  }

  addMapImageLayer = () => {
    const fextent = BlueLinesLayer.fullExtent;
    
   
    let layer = new MapImageLayer({
      copyright: "xplan",
      title: "blue lines layer",
      id: 'map_image_layer_blue_lines',
      url: BlueLinesLayer.imageLayerUrl,
      imageFormat: 'png',
      minScale: BlueLinesLayer.minScale,
      maxScale: BlueLinesLayer.maxScale,
      fullExtent: new Extent({
        spatialReference: new SpatialReference({
          wkid: BlueLinesLayer.wkid
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
          visible: true
        })
      ]
    });

    
    layer.load();

    layer.when(() =>{
      // layer instance created
          this.map?.add(layer);
    }).then(()=>{
      this.getLegend();
    })

    
  }

  addPointToMapView = (point: esri.Point) => {
    // take Point object from the event and add it to the graphics layer
    const graphicPoint: esri.Graphic = new Graphic({
      geometry: point,
      symbol: this.symbol //symbol from the config page
    })
    this.mapView?.graphics.add(graphicPoint);
  }

  addLineToMapView = () => {
    // take Point object array from the event and add it to the graphics layer

    var polyline = new Polyline({
      hasM: true,
      hasZ: false
    });

    // array of points
    polyline.addPath(this.linesArray ? this.linesArray : []);

    const graphicLines = new Graphic({
      geometry: polyline,
      symbol: lineSymbol //symbol from the config page
    });

    if (this.mapView && this.mapView.graphics?.length > 0) {
      this.mapView.graphics.map(graphic => {
        if (graphic.geometry.type === 'polyline') {
          graphic.destroy();
          return ""
        }
        return graphic;
      })
    }

    this.mapView?.graphics.add(graphicLines);

  }

  addPolygon = () => {
    // take Ring object and add an array of Points (starting point == finish point) 
    // and add it to the graphics layer

    this.polygonArray?.push(
      new Point({
        x: 31.411,
        y: 35.0818155
      }),
      new Point({
        x: 33.4117257,
        y: 34.0818155
      }),
      new Point({
        x: 29.4117257,
        y: 34.0818155
      }),
      new Point({
        x: 31.411,
        y: 35.0818155
      })
    )

    var poligon = new Polygon();

    //empty ring array
    poligon.addRing([]);

    //adding to the ring[0], point object with index 0
    this.polygonArray?.forEach(polygonPoint => {
      poligon.insertPoint(0, 0, polygonPoint)
    });

    var graphic = new Graphic({
      geometry: poligon,
      symbol: fillSymbol //symbol from the config page
    });
    this.mapView?.graphics.add(graphic);

  }

  clearMapOfGraphics = () => {
    //removes the points, lines and polygon from the map
    if (this.mapView && this.mapView?.graphics.length > 0) {
      this.mapView.graphics.removeAll()
    }
  }

  // Check if you can activate the functions: zoomIn and zoomOut before 
  // activating them
  zoomIn = () => {
    if (!this._canActivateMapFunctions)
      return;
    else if (this.mapView) {
      this.mapView.zoom++;
    }

  }
  zoomOut = () => {
    if (!this._canActivateMapFunctions)
      return;
    else if (this.mapView) {
      this.mapView.zoom--;
    }
  }

  filterLayerByExtent = (point: esri.Point) => {
    const currentExtent = this.mapView?.extent as Extent;
   

    const query = new Query({
      outFields: ['pl_name', 'pl_number', 'plan_area_name', 'station_desc', 'shape_area'],
      returnQueryGeometry: true,
      outSpatialReference: currentExtent.spatialReference,
      geometry: point,
      spatialRelationship: "intersects",
    });

    this.mapView?.layerViews.forEach(layerView=>{
      console.log(layerView.layer.type) 
    })


  }

  queryForPlansByClickOnPoint = (event: esri.ViewClickEvent) => {
    const currentExtent = this.mapView?.extent as Extent;
    const queryObject = new Query({
      outFields: ['pl_name', 'station_desc', 'pl_area_dunam'],
      returnQueryGeometry: true,
      outSpatialReference: currentExtent.spatialReference,
      geometry: event.mapPoint,
      spatialRelationship: "intersects",
    });
   
   
    query.executeQueryJSON(BlueLinesLayer.url, queryObject)
    .then((res: FeatureSet)=>{
      this.clearArray();
      let arr = res.features.filter((feature, index)=>index<3).map((feature=>feature.attributes));
      this.attributesArray = [...arr];
      this.attribuesArray$.next([...arr]);
    })
  }

  getAttributesArray = () => {
    if(this.attributesArray && this.attributesArray.length > 0)
      return this.attributesArray;
    else return new Array() as PeriodicElement[];
  }

  private clearArray = () => {
    if(!this.attributesArray)
      this.attributesArray = new Array();
    else{
    for (let i = 0; i < this.attributesArray.length; i++) {
      this.attributesArray.pop();
    }
  }
  }

  getLegend = () => {
    const myLayer = this.map?.findLayerById('map_image_layer_blue_lines');
    if(myLayer?.isFulfilled() && this.showLegend){
    const legend = new Expend({
      view: this.mapView,
      expanded: true,
      content: new Legend({
                  view: this.mapView,
                  layerInfos: [
                    {
                      layer: myLayer,
                      title: 'מקרא מפה'
                    }
                  ]
                })
    })
    
    this.mapView?.ui.add(legend, "bottom-right");
    this.showLegend = !this.showLegend;
  }
  }


  private _canActivateMapFunctions() {
    return this.isMapViewInit;
  }


}
