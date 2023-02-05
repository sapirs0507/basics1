// import { ViewChild } from '@angular/core';
// import { ElementRef } from '@angular/core';
// import { Component, OnDestroy, OnInit } from '@angular/core';

// // import { loadModules } from 'esri-loader';
// import esri = __esri;

// import Map from "@arcgis/core/Map";
// import MapView from "@arcgis/core/views/MapView";
// import esriConfig from "@arcgis/core/config";
// import SpatialReference from "@arcgis/core/geometry/SpatialReference";
// import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
// import Graphic from "@arcgis/core/Graphic";
// import Point from "@arcgis/core/geometry/Point";
// import PolyLine from "@arcgis/core/geometry/Polyline";
// import Polygon from "@arcgis/core/geometry/Polygon";

// import { environment } from 'src/environments/environment.development';
// import { IsraelCoordinates, BlueLinesLayer, symbol} from 'src/app/config/esri-map.config';
// import { EsriMapRxjsService } from 'src/app/services/esri-map-rxjs/esri-map-rxjs.service';
// import { Subscription } from 'rxjs';
// import { map } from 'rxjs';
// import { takeUntil } from 'rxjs';
// import { Subject } from 'rxjs';
// import { graphicalChoices } from 'src/app/enums/graphicalChoices.enum';





// @Component({
//   selector: 'app-ersi-map',
//   templateUrl: './ersi-map.component.html',
//   styleUrls: ['./ersi-map.component.scss']
// })
// export class ErsiMapComponent implements OnInit, OnDestroy{
//   // main map view
//   title = 'ArcGIS angular map';
//   @ViewChild('viewDiv', { static: true }) private mapViewEl!: ElementRef;
//   view: esri.MapView | undefined;
//   isInitialized: boolean = false;

//   hasContainer: Subscription | undefined;
//   MapViewSubscription: Subscription = new Subscription();
//   untilServiceFinished: Subject<void> = new Subject();



//   // pointsArray: esri.Point[] = new Array<Point>(); // not really needed
//   // linesArray: esri.Point[] = new Array<Point>(); // as one line, or each two points are a line
//   // polygonArray: esri.Point[] = new Array<Point>();

//   graphicalChoice: number = graphicalChoices.points;

//   saptialRef = new SpatialReference({
//     wkid: 2039
//   })

 
//   // initializeMap(): Promise<any>{
//   //   const container = this.mapViewEl.nativeElement;

//   //   // this.mapService.setContainer(this.mapViewEl)
    
//   //   esriConfig.apiKey = environment.arcgis_api;

//   //   const map = new Map({
//   //     basemap: "arcgis-imagery",
//   //    })

//   //   //  blue lines feature layer
//   //    const layer = new FeatureLayer({
//   //     title: BlueLinesLayer.title,
//   //     url: BlueLinesLayer.url,
//   //     copyright: BlueLinesLayer.copyright,
//   //     spatialReference: this.saptialRef,
//   //     minScale: BlueLinesLayer.minScale,
//   //     maxScale: BlueLinesLayer.maxScale,
//   //     fullExtent: BlueLinesLayer.fullExtent
//   //    });
     
     
//   //   layer.load().then(()=>{
//   //     console.log(layer)
//   //     if(layer.isTable){
//   //       map.tables.add(layer);
//   //     }
//   //     else {
//   //       map.add(layer);
//   //     }
//   //   })

//   //   const view = new MapView({
//   //     map: map,
//   //     container: container,
//   //     center: new Point({
//   //       latitude: IsraelCoordinates.latitude,
//   //       longitude: IsraelCoordinates.longitude
//   //     }),
//   //     extent:{
//   //      spatialReference: this.saptialRef,
//   //       xmin: BlueLinesLayer.fullExtent.xmin,
//   //       xmax: BlueLinesLayer.fullExtent.xmax,
//   //       ymin: BlueLinesLayer.fullExtent.ymin,
//   //       ymax: BlueLinesLayer.fullExtent.ymax
//   //     },
//   //     // extent: BlueLinesLayer.fullExtent,
//   //    zoom: BlueLinesLayer.zoom
//   //   });

  
//   //   this.view = view;
//   //   return this.view.when();
//   // }
  
  

//   constructor(
//     private mapService: EsriMapRxjsService
//   ) {
//     // This function load Dojo's  require the classes
//     // listed in the array modules
//     console.log("constractor");
    
//     this.hasContainer = this.mapService.container
//     .pipe(takeUntil(this.untilServiceFinished))
//     .subscribe((data)=>{
//       console.log("data", data)
//     })
   
//   }

//   ngOnInit(): void{
//     // this.initializeMap().then(()=>{
//     //   console.log("the map is ready");
//     //   this.isInitialized = true;
//     //   this.view?.on("click", (event: __esri.ViewClickEvent)=>{
//     //     this.addPoint(event.mapPoint)
//     //   })
//     // })
//     const createAndLoadMapUsingRXJS = async () => {
//       await this.mapService.setContainer(this.mapViewEl);
//       await this.mapService.initMap();
//       this.MapViewSubscription = this.mapService.mapUpdated
//       .pipe(takeUntil(this.untilServiceFinished))
//       .subscribe((mapView)=>{
//         if(mapView)
//           this.isInitialized = true;
//       })
//       // await this.mapService.initMap()
//       // .then(()=>{
//       //   this.isInitialized = true;
//       // })
//     }
//     createAndLoadMapUsingRXJS()
    
//   }

//   ngOnDestroy(): void {
//     this.untilServiceFinished.complete()
//     this.view?.destroy();
//     this.isInitialized = true;
//     this.hasContainer?.unsubscribe()
//   }

//   onZoomIn = () => {
//     console.log("zoom in");
//     // if(this.isInitialized && this.view) 
//     //   this.view.zoom++;
//     this.mapService.zoomIn();
//   }

//   onZoomOut = () => {
//     console.log("zoom out");
//     // if(this.isInitialized && this.view)
//     //   this.view.zoom--;
//     this.mapService.zoomOut();
//   }

//   // addPoint = (currentPoint: esri.Point) => {
//   //   // const saptialRef = new SpatialReference({
//   //   //   wkid: 2039
//   //   // })

//   //   switch (this.graphicalChoice) {
//   //     case graphicalChoices.points:
//   //       // this.pointsArray.push(currentPoint);      
//   //       // this.paintPoint(currentPoint);
//   //       break;
//   //     case graphicalChoices.lines:
//   //       // this.linesArray.push(currentPoint);
//   //       // if(this.linesArray.length > 1)
//   //         // this.paintLines();
//   //     break;
//   //     case graphicalChoices.polygon:
//   //       // this.polygonArray.push(currentPoint);
//   //       console.log("paint poligon")
//   //       // this.paintPolygon()
        
//   //       break;
    
//   //     default:
//   //       break;
//   //   }
    
//   // }


//   OnPaintPoint = () => {
//     this.graphicalChoice = graphicalChoices.points;
//     this.mapService.graphicalChoice = graphicalChoices.points;
//   }

//   OnPaintLines = () => {
//     this.graphicalChoice = graphicalChoices.lines;
//     this.mapService.graphicalChoice = graphicalChoices.lines;

//   }

//   OnPaintPolygon = () => {
//     this.graphicalChoice = graphicalChoices.polygon;
//     this.mapService.graphicalChoice = graphicalChoices.polygon;
//   }

//   // paintPoint = (point: esri.Point) => {
//   //   console.log("-------------------")

//   //   const currentSymbol = {
//   //     type: symbol.type,
//   //     color: symbol.color,
//   //     outline: symbol.outline
//   //   }

//   //   const graphicPoint: esri.Graphic = new Graphic({
//   //     geometry: point,
//   //     symbol: currentSymbol
//   //   });

//   //   this.view?.graphics.add(graphicPoint);
//   // }

//   // paintPoints = () => {
//   //     const currentSymbol = {
//   //       type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
//   //       color: [226, 119, 40],
//   //       outline: { // autocasts as new SimpleLineSymbol()
//   //         color: 'black',
//   //         width: 2
//   //       }
//   //     }

//   //     this.pointsArray.map((point: __esri.Point)=>{
//   //       const graphicPoint: __esri.Graphic = new Graphic({
//   //         geometry: point,
//   //         symbol: currentSymbol
//   //       });

//   //       if(this.isInitialized && point && graphicPoint){
//   //         this.view?.graphics.add(graphicPoint);
//   //       }
//   //     })
//   // }

//   // paintLines = () => {
//   //   const lineSymbol = {
//   //     type: "simple-line", // autocasts as SimpleLineSymbol()
//   //     color: 'black',
//   //     width: 3
//   //   }; 

//   //   var polyline = new PolyLine({
//   //     hasM: true,
//   //     hasZ: false,
//   //   });

//   //   polyline.addPath(this.linesArray);

//   //   const graphicLines = new Graphic({
//   //     geometry: polyline,
//   //     symbol: lineSymbol
//   //   });

//   //   this.view?.graphics.add(graphicLines);
//   // }

//   // paintLine = (pointA: esri.Point, pointB: esri.Point) => {
//   //   const lineSymbol = {
//   //     type: "simple-line", // autocasts as SimpleLineSymbol()
//   //     color: 'black',
//   //     width: 3
//   //   }; 

//   //   var polyline = new PolyLine({
//   //     hasM: true,
//   //     hasZ: false,
//   //   });

//   //   polyline.addPath([pointA, pointB]);

//   //   const graphicLines = new Graphic({
//   //     geometry: polyline,
//   //     symbol: lineSymbol
//   //   });

//   //   this.view?.graphics.add(graphicLines);
//   // }

//   // paintPolygon = () => {
    
//   //   // Create a symbol for rendering the graphic
//   //   var fillSymbol = {
//   //     type: "simple-fill", // autocasts as new SimpleFillSymbol()
//   //     color: [227, 139, 79, 0.8],
//   //     outline: { // autocasts as new SimpleLineSymbol()
//   //       color: [255, 255, 255],
//   //       width: 1
//   //     }
//   //   };

//   //   this.polygonArray.push(
//   //     new Point({
//   //       x: -64.78,
//   //       y:  32.3
//   //     }),
//   //     new Point({
//   //       x:-66.07,
//   //       y:  18.45
//   //     }),
//   //     new Point({
//   //       x: -80.21,
//   //       y:  25.78
//   //     }),
//   //     new Point({
//   //       x: -64.78,
//   //       y:  32.3
//   //     })
//   //   )

   
//   //   var poligon = new Polygon();
//   //   poligon.addRing([]);
//   //   this.polygonArray.forEach(polygonPoint => {
//   //     poligon.insertPoint(0, 0, polygonPoint)
//   //   });
    
//   //   var graphic = new Graphic({
//   //     geometry: poligon,
//   //     symbol: fillSymbol
//   //   });


//   //   this.view?.graphics.add(graphic);
//   // }

// }
