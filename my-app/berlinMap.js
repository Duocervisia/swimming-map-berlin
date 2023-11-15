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
import {getDistance} from 'ol/sphere';
import Helper from './helper.js';

export default class BerlinMap{
    map
    source
    popupOverlay

    peoplePoints
    peopleLines = [];

    constructor(){
        this.init();
        this.setEvents();
        this.loadData("https://docs.google.com/spreadsheets/d/e/2PACX-1vQBWDJ224e-Sf3UsyF1JmnibkFlGZK8Fuh-hh9tBMCP_A4gIZ-ZdIYflLdpEY12jDjeZevyuCMQKI5F/pub?gid=2050467191&single=true&output=tsv")
        this.loadData("https://docs.google.com/spreadsheets/d/e/2PACX-1vTHc-Y2YKfzWK8-ODpWG8kBFfObE8DK57Jh6tLc2weQeGR6yU84PgGJkSKyCwsc9dGX1QKD8Dlb28Sw/pub?gid=0&single=true&output=tsv", true)

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

        this.map.on('pointermove', (evt) => {
            checkPopup(evt)
        });
            
        this.map.on('click', function(evt) {
          that.peopleLines.forEach(line => {
            that.source.removeFeature(line);
          });
            checkPopup(evt)
        });

        function checkPopup(evt){
            let bFeature = false;
            that.map.forEachFeatureAtPixel(evt.pixel,
            function(feature) {
              bFeature = true;
              let text = "<h4>"+feature.attributes.Name+"</h4>\n";
              if(Object.keys(feature.attributes).length > 7){
                if(feature.attributes["Besucht am"].length >= 8){
                  text += "<p><b>Besucht am: " +feature.attributes["Besucht am"] +"</b></p>";
                }
                text += "<p>Typ: " +feature.attributes.Typ +"</p>";
                text += "<p>Gebaut: " +feature.attributes["ab Jahr"] +"</p>";
                text += "<p>Bahnlänge: " +feature.attributes["Bahnlänge"] +"</p><br>";
                that.peoplePoints.forEach(peopleFeature => {
                  let lineFeature = that.addLineBetweenPoints([peopleFeature.getGeometry().getCoordinates(), feature.getGeometry().getCoordinates()])
                  text += "<p>" +peopleFeature.attributes.Name +": "+ Helper.meterFormatter(lineFeature.getGeometry().getLength()) +"</p>";
                  that.peopleLines.push(lineFeature);
                });
              }
              $('.custom-popup')[0].innerHTML = text;
              $('.custom-popup')[0].hidden = false;
              that.popupOverlay.setPosition(evt.coordinate);
            },
            { layerFilter: (layer) => {
                return (layer.type === new VectorLayer().type) ? true : false;
            }, hitTolerance: 6 })
          
            if(!bFeature){
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

    loadData(link, people=false){
      let that = this;
        $.ajax(link).done(function(result){
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
      
          let radius = $(window).width() < 1200 ? 18 : 7
          let width = $(window).width() < 1200 ? 3 : 2
      
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
          
            let color;
              if(obj["Besucht am"].length < 8){
                switch(obj["Typ"]){
                  case "Hallenbad":
                    color = '#00FFFF'
                    break;
                  case "Kombibad":
                    color = '#e337de'
                    break;
                  case "Freibad":
                    color = '#9999FF'
                    break;
                  default:
                    color = '#1940FF'
                    break;
                }
              }else{
                if(mostRecentIndex == null || Helper.parseDateString(obj["Besucht am"]) > Helper.parseDateString(jsonObj[mostRecentIndex]["Besucht am"])){
                  mostRecentIndex = i
                }
                color = '#00E626';
                been++;
              } 
              
              oFeature.setStyle(that.getPointStyle(radius, color, width));
              oFeature.attributes = obj;
              aFeatures.push(oFeature)
            }
            $('#visited-pool-count').text(been);
            $('#all-pool-count').text(jsonObj.length);
            $('#last-visited-pool').text(jsonObj[mostRecentIndex]["Name"] + " am " + jsonObj[mostRecentIndex]["Besucht am"]);
          }else{
            for (var i=0; i< jsonObj.length; i++){
              var obj = jsonObj[i];
              const lonlat = Helper.dmsToDecimal(obj["Location"]);
              var oFeature = new Feature({
                  geometry: new Point(
                      fromLonLat([lonlat["longitude"],lonlat["latitude"]]),
                  )
              });
          
              let color = "#ffa500";
             
              oFeature.setStyle(that.getPointStyle(radius, color, width));
              oFeature.attributes = obj;
              aFeatures.push(oFeature)
            }
            that.peoplePoints = aFeatures;
          }
          that.source.addFeatures(aFeatures);
        
        });
    }

    getPointStyle(radius, color, width){
      return new Style({
        image: new CircleStyle({
          radius: radius,
          fill: new Fill({
            color: color,
          }),
          stroke: new Stroke({
            color: '#202124',
            width: width,
          }),
        }),
      });
    }
    getLineStyle(){
      return new Style({
        fill: new Fill({ color: '#ab2e2e', weight: 4 }),
        stroke: new Stroke({ color: '#ab2e2e', width: 4, lineDash: [0, 6]})
      });
    }
      
}