import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Feature from 'ol/Feature.js';
import {Draw, Modify, Snap} from 'ol/interaction.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import StadiaMaps from 'ol/source/StadiaMaps.js';

import {Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import {get, transform, fromLonLat, Projection} from 'ol/proj.js';
import {Point, LineString} from 'ol/geom.js';
import $ from "jquery";
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import Overlay from 'ol/Overlay.js';
import Helper from './helper.js';

export default class mapBuilder{
    map
    source
    popupOverlay
    main

    sources = []
    vectors = []

    peoplePoints
    peopleLines = [];
    placesPoints = [];
    shortestPeopleDistance = {
      index: null,
      distance: null
    }

    pointRadius
    pointBorderWidth
    lineThinkness

    constructor(main){
      this.main = main;
      this.pointRadius = $(window).width() < 1200 ? this.main.jsonLoader.data.map.mobile.pointRadius : this.main.jsonLoader.data.map.desktop.pointRadius
      this.pointBorderWidth = $(window).width() < 1200 ? this.main.jsonLoader.data.map.mobile.pointBorderWidth : this.main.jsonLoader.data.map.desktop.pointBorderWidth
      this.lineThinkness = $(window).width() < 1200 ? this.main.jsonLoader.data.map.mobile.lineThinkness : this.main.jsonLoader.data.map.desktop.lineThinkness
      this.init();
      // this.initLayers();
      this.setEvents();
       
    }
    initLayers(){
      this.main.jsonLoader.data.legend.forEach(element => {
        let source = new VectorSource();
        let vector = new VectorLayer({
          source: source
        });

        this.sources.push(source);
        this.sources.push(vector);
        this.map.addLayer(vector);
      });
    }
    async load(){
      await this.loadData(this.main.jsonLoader.data.person.url, true)
      await this.loadData(this.main.jsonLoader.data.points.url)
    }
    init(){
        const raster = [
          new TileLayer({
            source: new OSM({reprojectionErrorThreshold: 1000, wrapX: false, zDirection: 500}),
            // source: new StadiaMaps({
            //   layer: 'stamen_watercolor',
            //   // apiKey: 'OPTIONAL'
            // }),
          }),
          // new TileLayer({
          //   source: new StadiaMaps({
          //     layer: 'stamen_terrain_labels',
          //     // apiKey: 'OPTIONAL'
          //   }),
          // })
        ] 
          
        this.source = new VectorSource();
        const vector = new VectorLayer({
          source: this.source
        });
      
        const map = new Map({
            layers: raster.concat([vector]),
            target: 'map',
            view: new View({
                center: transform(this.main.jsonLoader.data.map.center, 'EPSG:4326', 'EPSG:3857'),
                zoom: this.main.jsonLoader.data.map.zoom
            }),
        });

        this.popupOverlay = new Overlay({
            element: $('.custom-popup')[0],
            offset: [9, 9]
        });
        map.addOverlay(this.popupOverlay);
        this.map = map
    }
    setEvents(){
        let that = this;
        let inTooltipElement = false;


        this.map.on('pointermove', (evt) => {
            checkPopup(evt)
        });
            
        this.map.on('click', function(evt) {
          that.peopleLines.forEach(line => {
            that.source.removeFeature(line);
          });
          inTooltipElement = false;
            checkPopup(evt)
        });


        function checkPopup(evt){
          let bFeature = false;

            that.map.forEachFeatureAtPixel(evt.pixel, function(feature) {
              if(feature.getGeometry().constructor == LineString ){
                return;
              }
              bFeature = true;
              if(inTooltipElement){
                that.popupOverlay.setPosition(evt.coordinate);
                return;
              }
              inTooltipElement = true;
              let text;

              if(feature.attributes[that.main.jsonLoader.data.points.date.field] !== undefined){
                text = "<h4>"+feature.attributes[that.main.jsonLoader.data.points.name.field]+"</h4>\n";
                if(feature.attributes[that.main.jsonLoader.data.points.date.field].length >= 8){
                  text += "<p><b>"+ that.main.jsonLoader.data.points.date.shownName +": " +feature.attributes[that.main.jsonLoader.data.points.date.field] +"</b></p>";
                }
                that.main.jsonLoader.data.points.tooltip.fieldsToShow.forEach(element => {
                  text += "<p>"+ element.shownName +": " +feature.attributes[element.field] +"</p>";
                });
                text += "<br>";
                let totalLength = 0;
                that.peoplePoints.forEach(peopleFeature => {
                  let lineFeature = that.addLineBetweenPoints([peopleFeature.getGeometry().getCoordinates(), feature.getGeometry().getCoordinates()])
                  text += "<p>" +peopleFeature.attributes.Name +": "+ Helper.meterFormatter(lineFeature.getGeometry().getLength()) +"</p>";
                  that.peopleLines.push(lineFeature);
                  totalLength += lineFeature.getGeometry().getLength();
                });
                text += "<p><b>Summe: " +Helper.meterFormatter(totalLength) +"</b></p>";

              }else{
                text = "<h4>"+feature.attributes[that.main.jsonLoader.data.person.name.field]+"</h4>\n";
              }
              $('.custom-popup')[0].innerHTML = text;
              $('.custom-popup')[0].hidden = false;
              that.popupOverlay.setPosition(evt.coordinate);
            },
            { layerFilter: (layer) => {
                return (layer.type === new VectorLayer().type) ? true : false;
            }, hitTolerance: that.main.jsonLoader.data.map.clickAccuracy})
          
            if(!bFeature){
              if(!inTooltipElement){
                return;
              }

              inTooltipElement = false;
             
              $('.custom-popup')[0].innerHTML = '';
              $('.custom-popup')[0].hidden = true;
              that.peopleLines.forEach(line => {
                that.source.removeFeature(line);
              });
            }
          }
    }
    addLineBetweenPoints(points){
      var featureLine = new Feature({
          geometry: new LineString(points)
      });
      featureLine.setStyle(this.getLineStyle());
      this.source.addFeature(featureLine);
      return featureLine;
    }

    async loadData(link, people=false){
      let that = this;
      return $.ajax(link).done(function(result){
          let arr = result.split('\n'); 
        
          var jsonObj = [];
          var headers = arr[0].split('\t');
          for(var i = 1; i < arr.length; i++) {
            var data = arr[i].split('\t');
            var obj = {};
            for(var j = 0; j < data.length; j++) {
              if(headers[j] != null){
                obj[headers[j].trim()] = data[j].trim();
              }
            }
            jsonObj.push(obj);
          }
          JSON.stringify(jsonObj);
      
          var aFeatures = [];
      
          if(!people){
            var been = 0;
            let mostRecentIndex = null;
          
            for (var i=0; i< jsonObj.length; i++){
              var obj = jsonObj[i];
              const lonlat = Helper.dmsToDecimal(obj[that.main.jsonLoader.data.points.location.field]);
              var oFeature = new Feature({
                  geometry: new Point(
                      fromLonLat([lonlat["longitude"],lonlat["latitude"]]),
                  )
              });
            oFeature.attributes = obj;

          
            let color;
              if(obj[that.main.jsonLoader.data.points.date.field].length < 8){
                color = that.main.frontend.getColorByType(obj["Typ"])
              }else{
                if(mostRecentIndex == null || Helper.parseDateString(obj[that.main.jsonLoader.data.points.date.field]) > Helper.parseDateString(jsonObj[mostRecentIndex][that.main.jsonLoader.data.points.date.field])){
                  mostRecentIndex = i
                }
                color = that.main.frontend.getColorByType(that.main.jsonLoader.data.points.date.legendType)
                oFeature.attributes.visited = true;

                been++;
              } 

              that.addTotalLengthAttribute(oFeature, i);
              oFeature.setStyle(that.getPointStyle(color));
              oFeature.attributes.color = color
              oFeature.attributes.enabled = true
              aFeatures.push(oFeature)
            }
            that.placesPoints = aFeatures;
            $('#visited-count').text(been);
            $('#all-count').text(jsonObj.length);
            if(jsonObj[mostRecentIndex] !== undefined){
              $('#last-visited').text(jsonObj[mostRecentIndex][that.main.jsonLoader.data.points.name.field] + " am " + jsonObj[mostRecentIndex][that.main.jsonLoader.data.points.date.field]);
            }
            that.setShortestPeopleDistance();
            
          }else{
            for (var i=0; i< jsonObj.length; i++){
              var obj = jsonObj[i];
              const lonlat = Helper.dmsToDecimal(obj[that.main.jsonLoader.data.person.location.field]);
              var oFeature = new Feature({
                  geometry: new Point(
                      fromLonLat([lonlat["longitude"],lonlat["latitude"]]),
                  )
              });
          
              let color = that.main.frontend.getColorByTypeAttribute("isPeopleType");

             
              oFeature.setStyle(that.getPointStyle(color));
              oFeature.attributes = obj;
              oFeature.attributes.color = color
              oFeature.attributes.enabled = true

              aFeatures.push(oFeature)
            }
            that.peoplePoints = aFeatures;
          }
          that.source.addFeatures(aFeatures);
        
        });
    }

    addTotalLengthAttribute(feature, index){
      let totalLength = 0;
      this.peoplePoints.forEach(peopleFeature => {
        let lineFeature = new LineString([peopleFeature.getGeometry().getCoordinates(), feature.getGeometry().getCoordinates()])
        totalLength += lineFeature.getLength();
      });
      feature.attributes.totalLength = totalLength
    }

    setShortestPeopleDistance(){
      let that = this;
      let i = 0;
      that.shortestPeopleDistance.index = null;
      that.shortestPeopleDistance.distance = null;

      that.placesPoints.forEach(element => {
        if(element.attributes[that.main.jsonLoader.data.points.date.field].length < 8 && element.attributes.enabled){
          if(that.shortestPeopleDistance.index === null || element.attributes.totalLength < that.shortestPeopleDistance.distance){
            that.shortestPeopleDistance.index = i
            that.shortestPeopleDistance.distance = element.attributes.totalLength
          }
        }
        i++;
      });
      if(that.shortestPeopleDistance.index !== null){
        let color = this.main.frontend.getColorByTypeAttribute("isNextVisitType")
        this.placesPoints[that.shortestPeopleDistance.index].setStyle(this.getPointStyle(color));
        $('#next-visit').text(this.placesPoints[that.shortestPeopleDistance.index].attributes[[that.main.jsonLoader.data.points.name.field]]);
      }
    }

    getPointStyle(color){
      return new Style({
        image: new CircleStyle({
          radius: this.pointRadius,
          fill: new Fill({
            color: color,
          }),
          stroke: new Stroke({
            color: '#202124',
            width: this.pointBorderWidth,
          }),
        }),
      });
    }
    getLineStyle(){
      return new Style({
        fill: new Fill({ color: '#ab2e2e', weight: this.lineThinkness }),
        stroke: new Stroke({ color: '#ab2e2e', width: this.lineThinkness, lineDash: [0, this.lineThinkness* 1.5]})
      });
    }

    selectorChanged(){
      this.placesPoints.forEach(element => {
        if(this.main.frontend.isTypeEnabled(element.attributes["Typ"]) && element.attributes.visited === undefined){
          element.setStyle(this.getPointStyle(element.attributes["color"]));
          element.attributes.enabled = true;
        }else if(element.attributes.visited !== undefined && element.attributes.visited && this.main.frontend.isTypeAttributeEnabled("isVisitedType")){
          element.setStyle(this.getPointStyle(element.attributes["color"]));
        
        }else{
          element.setStyle(new Style({}));
          element.attributes.enabled = false;
        }
      });
      this.setShortestPeopleDistance();
    }
      
}