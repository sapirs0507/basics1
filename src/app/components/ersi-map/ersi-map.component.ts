import { AfterViewInit, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnDestroy, OnInit,  } from '@angular/core';

import { EsriMapRxjsService } from 'src/app/services/esri-map-rxjs/esri-map-rxjs.service';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { graphicalChoices } from 'src/app/enums/graphicalChoices.enum';
import { BlueLinesLayer, GrahpicalChoicesControl, IsraelCoordinates, matSliderScaleValue, matSliderZoomValue, maxValue, minValue, step } from 'src/app/config/esri-map.config';
import { FormGroup, FormControl } from '@angular/forms';
import { PeriodicElement } from 'src/app/interfaces/PeriodicElement.interface';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import { EsriMapClass } from 'src/app/classes/esri-map.class';
import Point from '@arcgis/core/geometry/Point';
import Extent from '@arcgis/core/geometry/Extent';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import { environment } from 'src/environments/environment.development';
// import MapView from '@arcgis/core/views/MapView';
import esriConfig from "@arcgis/core/config";


@Component({
  selector: 'app-ersi-map',
  templateUrl: './ersi-map.component.html',
  styleUrls: ['./ersi-map.component.scss']
})
export class ErsiMapComponent implements AfterViewInit, OnInit, OnDestroy{
  // main map view
  // the DOM element to bind the MapView to
  @ViewChild('viewDiv', { static: true }) private mapViewEl!: ElementRef;
  // @ViewChild('tableDiv', { static: true }) private tableDiv!: ElementRef;
  title = 'ArcGIS angular map';
  panelOpenState = true;
  viewmap!: EsriMapClass;
  map!: Map;
  GraphicalChoices = [
    {
      value: graphicalChoices.notGraphicalChoice,
      name: 'None'
    },
    {
      value: graphicalChoices.points,
      name: 'Points'
    },
    {
      value: graphicalChoices.lines,
      name: 'Lines'
    },
    {
      value: graphicalChoices.polygon,
      name: 'Polygon'
    }
  ]
  GrahpicalChoicesControl: number = GrahpicalChoicesControl;
  data?: PeriodicElement[];
  scale = new FormControl(1);
  zoom = new FormControl(2);
  matSliderScaleValue: number = matSliderScaleValue;
  matSliderZoomValue: number = matSliderZoomValue;

  minValue: number = minValue;
  maxValue: number = maxValue;
  step: number = step;

  focusPoint = new FormGroup({
    latitude:  new FormControl<number>(IsraelCoordinates.latitude),
    longitude: new FormControl<number>(IsraelCoordinates.longitude),
  });
  
  // is the map initialized?
  isInitialized: boolean = false; 

  // for the takeUntil, to unsubscribe from all the observables in the ngOnDestory 
  untilServiceFinished: Subject<void> = new Subject(); 

  constructor(
    // private mapService: EsriMapRxjsService
    ) {  
    // console.log("esri-map component -> constructor")

  }

  ngOnInit(): void {
      // console.log("esri-map component -> ngOnInit")
  }

  ngAfterViewInit(): void{
    // console.log("esri-map component -> ngAfterViewInit")
    
    const createAndLoadMapUsingRXJS = async () => {
      esriConfig.apiKey = environment.arcgis_api;

      const extent = new Extent({
        spatialReference: new SpatialReference({
          wkid: BlueLinesLayer.wkid
        }),
        xmin: BlueLinesLayer.fullExtent.xmin,
        xmax: BlueLinesLayer.fullExtent.xmax,
        ymin: BlueLinesLayer.fullExtent.ymin,
        ymax: BlueLinesLayer.fullExtent.ymax
      });

      this.viewmap = new EsriMapClass({
        map: {
          basemap: "arcgis-imagery"
        },
        zoom: BlueLinesLayer.zoom,
        center: [   //center point for israel
          IsraelCoordinates.latitude,
          IsraelCoordinates.longitude],
        extent: extent,
        container: this.mapViewEl.nativeElement,
        highlightOptions: BlueLinesLayer.highlightOptions
      });
      
      this.viewmap.initMap();
      this.viewmap?.when(()=>{
        this.viewmap?.attribuesArray$
        .pipe(takeUntil(this.untilServiceFinished))
        .subscribe((data: PeriodicElement[])=>{
          console.log(data)
          this.data = data;
        })
      })
    }
    // const createAndLoadMapUsingRXJS = async () => {
    //   // once the map updates, set isInitialized to true
    //   this.mapService.mapUpdated
    //   .pipe(takeUntil(this.untilServiceFinished))
    //   .subscribe((mapView)=>{
    //     if(mapView){
    //       this.isInitialized = true;
    //     }
    //   });

    //   this.mapService.attribuesArray$
    //   .pipe(takeUntil(this.untilServiceFinished))
    //   .subscribe((data: PeriodicElement[])=>{
    //     this.data = data;
    //   })

    


    //   // update the element ref inside the service and only then initialize the map and mapview
    //   // otherwise it won't have the mapView dom element reference
    //   this.mapService.setContainer(this.mapViewEl);
    //   // initialize the map and the mapview
    //   await this.mapService.initMap();

    //   // this.mapService.setContainer(this.mapViewEl2);
    //   // await this.mapService.initMap();
      
      
    // }
    createAndLoadMapUsingRXJS()
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
    // this.mapService.goto(<number>this.focusPoint.value.longitude, <number>this.focusPoint.value.latitude);
    // this.mapService.setMapViewZoom(7);

    this.viewmap.CenterByLongtitudeAndLatitude(<number>this.focusPoint.value.longitude, <number>this.focusPoint.value.latitude);
    this.viewmap.setMapViewZoom(7);

  }

  onScaleClick = () => {
    // set the map view's scale
    // this.mapService.setMapViewScale(<number>this.scale.value);
    this.viewmap.setMapViewScale(<number>this.scale.value);
  }


  getTable = () => {
    // this.data = this.mapService.getAttributesArray() as PeriodicElement[];
    this.data = this.viewmap.getAttributesArray() as PeriodicElement[]
  }

  onMatSliderScaleValueUpdated = () => {
    // set the map view's scale
    // this.mapService.setMapViewScale(<number>this.matSliderScaleValue);
    this.viewmap.setMapViewScale(<number>this.matSliderScaleValue);
  }

  onZoomClick = () => {
    //zoom when needed to a spasific value
    // this.mapService.setMapViewZoom(<number>this.zoom.value);
    this.viewmap.setMapViewZoom(<number>this.zoom.value);

  }

  onClearGraphics = () => {
    //clear graphics from the map
    // this.mapService.clearMapOfGraphics();
    this.viewmap.clearMapOfGraphics();
  }

  ngOnDestroy(): void {

    this.untilServiceFinished.complete();
    // this.mapService.ngOnDestroy();
    this.isInitialized = false;
  }

  onAddBlueLines = () => {
    //add the blue lines map image layer to the map
    this.viewmap.setGraphicalChoice(-1);
    this.viewmap.addMapImageLayer();
    // this.mapService.setGraphicalChoice(-1);
    // this.mapService.addMapImageLayer();
  }

  OnSelectionChange = () => {
    //change the graphical choice 
    // this.mapService.setGraphicalChoice(this.GrahpicalChoicesControl);
    this.viewmap.setGraphicalChoice(this.GrahpicalChoicesControl);
  }

  

}
