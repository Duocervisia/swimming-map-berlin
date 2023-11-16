import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Feature from 'ol/Feature.js';
import {Draw, Modify, Snap} from 'ol/interaction.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {get, transform, fromLonLat, Projection} from 'ol/proj.js';
import {Point, LineString} from 'ol/geom.js';
import $ from "jquery";
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import Overlay from 'ol/Overlay.js';
import Helper from './helper.js';

export default class BerlinMap{
    map
    source
    popupOverlay
    main

    peoplePoints
    peopleLines = [];
    placesPoints = [];
    shortestPeopleDistance = {
      index: null,
      distance: null
    }

    pointRadius = $(window).width() < 1200 ? 18 : 7
    pointBorderWidth = $(window).width() < 1200 ? 3 : 2
    lineThinkness = $(window).width() < 1200 ? 8 : 4

    constructor(main){
      this.main = main;
      this.init();
      this.setEvents();
       
    }
    async load(){
      await this.loadData("https://docs.google.com/spreadsheets/d/e/2PACX-1vTHc-Y2YKfzWK8-ODpWG8kBFfObE8DK57Jh6tLc2weQeGR6yU84PgGJkSKyCwsc9dGX1QKD8Dlb28Sw/pub?gid=0&single=true&output=tsv", true)
      await this.loadData("https://docs.google.com/spreadsheets/d/e/2PACX-1vQBWDJ224e-Sf3UsyF1JmnibkFlGZK8Fuh-hh9tBMCP_A4gIZ-ZdIYflLdpEY12jDjeZevyuCMQKI5F/pub?gid=2050467191&single=true&output=tsv")
    }
    init(){
        const raster = new TileLayer({
            source: new OSM(),
        });
          
        this.source = new VectorSource();
        const vector = new VectorLayer({
          source: this.source
        });
        
        // Limit multi-world panning to one world east and west of the real world.
        // Geometry coordinates have to be within that range.
        const extent = get('EPSG:3857').getExtent().slice();
        extent[0] += extent[0];
        extent[2] += extent[2];
        const map = new Map({
            layers: [raster, vector],
            target: 'map',
            view: new View({
                center: transform([13.414951, 52.507783], 'EPSG:4326', 'EPSG:3857'),
                zoom: 11,
                extent,
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
              bFeature = true;
              if(feature.getGeometry().constructor == LineString ){
                return;
              }
              if(inTooltipElement){
                that.popupOverlay.setPosition(evt.coordinate);
                return;
              }
              inTooltipElement = true;

              let text = "<h4>"+feature.attributes.Name+"</h4>\n";
              if(Object.keys(feature.attributes).length > 7){
                if(feature.attributes["Besucht am"].length >= 8){
                  text += "<p><b>Besucht am: " +feature.attributes["Besucht am"] +"</b></p>";
                }
                text += "<p>Typ: " +feature.attributes.Typ +"</p>";
                text += "<p>Gebaut: " +feature.attributes["ab Jahr"] +"</p>";
                text += "<p>Bahnlänge: " +feature.attributes["Bahnlänge"] +"</p><br>";
                let totalLength = 0;
                that.peoplePoints.forEach(peopleFeature => {
                  let lineFeature = that.addLineBetweenPoints([peopleFeature.getGeometry().getCoordinates(), feature.getGeometry().getCoordinates()])
                  text += "<p>" +peopleFeature.attributes.Name +": "+ Helper.meterFormatter(lineFeature.getGeometry().getLength()) +"</p>";
                  that.peopleLines.push(lineFeature);
                  totalLength += lineFeature.getGeometry().getLength();
                });
                text += "<p><b>Summe: " +Helper.meterFormatter(totalLength) +"</b></p>";

              }
              $('.custom-popup')[0].innerHTML = text;
              $('.custom-popup')[0].hidden = false;
              that.popupOverlay.setPosition(evt.coordinate);
            },
            { layerFilter: (layer) => {
                return (layer.type === new VectorLayer().type) ? true : false;
            }, hitTolerance: 0})
          
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
              const lonlat = Helper.dmsToDecimal(obj["Location"]);
              var oFeature = new Feature({
                  geometry: new Point(
                      fromLonLat([lonlat["longitude"],lonlat["latitude"]]),
                  )
              });
            oFeature.attributes = obj;

          
            let color;
              if(obj["Besucht am"].length < 8){
                color = that.main.frontend.getColorByType(obj["Typ"])
              }else{
                if(mostRecentIndex == null || Helper.parseDateString(obj["Besucht am"]) > Helper.parseDateString(jsonObj[mostRecentIndex]["Besucht am"])){
                  mostRecentIndex = i
                }
                color = that.main.frontend.getColorByType("Besucht")
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
            $('#visited-pool-count').text(been);
            $('#all-pool-count').text(jsonObj.length);
            $('#last-visited-pool').text(jsonObj[mostRecentIndex]["Name"] + " am " + jsonObj[mostRecentIndex]["Besucht am"]);
            that.setShortestPeopleDistance();
            
          }else{
            for (var i=0; i< jsonObj.length; i++){
              var obj = jsonObj[i];
              const lonlat = Helper.dmsToDecimal(obj["Location"]);
              var oFeature = new Feature({
                  geometry: new Point(
                      fromLonLat([lonlat["longitude"],lonlat["latitude"]]),
                  )
              });
          
              let color = that.main.frontend.getColorByType("Menschen");

             
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
        if(element.attributes["Besucht am"].length < 8 && element.attributes.enabled){
          if(that.shortestPeopleDistance.index === null || element.attributes.totalLength < that.shortestPeopleDistance.distance){
            that.shortestPeopleDistance.index = i
            that.shortestPeopleDistance.distance = element.attributes.totalLength
          }
        }
        i++;
      });
      if(that.shortestPeopleDistance.index !== null){
        let color = this.main.frontend.getColorByType("Am nächsten Unbesucht")
        this.placesPoints[that.shortestPeopleDistance.index].setStyle(this.getPointStyle(color));
        $('#next-visit-pool').text(this.placesPoints[that.shortestPeopleDistance.index].attributes["Name"]);
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
        }else if(element.attributes.visited !== undefined && element.attributes.visited && this.main.frontend.isTypeEnabled("Besucht")){
          console.log(element.attributes["Typ"])
          element.setStyle(this.getPointStyle(element.attributes["color"]));
        
        }else{
          element.setStyle(new Style({}));
          element.attributes.enabled = false;
        }
      });
      this.setShortestPeopleDistance();
    }
      
}