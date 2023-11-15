import './style.css';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Feature from 'ol/Feature.js';
import {Draw, Modify, Snap} from 'ol/interaction.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {get, transform, fromLonLat} from 'ol/proj.js';
import {Point} from 'ol/geom.js';
import $ from "jquery";
import mobile from "is-mobile";

import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import Overlay from 'ol/Overlay.js';


const raster = new TileLayer({
  source: new OSM(),
});

const source = new VectorSource();
const vector = new VectorLayer({
  source: source
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

let popupOverlay = new Overlay({
  element: $('.custom-popup')[0],
  offset: [9, 9]
});
map.addOverlay(popupOverlay);

map.on('pointermove', (evt) => {
 checkPopup(evt)
});

map.on('click', function(evt) {
  checkPopup(evt)
});

$.ajax("https://docs.google.com/spreadsheets/d/e/2PACX-1vQBWDJ224e-Sf3UsyF1JmnibkFlGZK8Fuh-hh9tBMCP_A4gIZ-ZdIYflLdpEY12jDjeZevyuCMQKI5F/pub?gid=2050467191&single=true&output=tsv").done(function(result){
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

  var i;
  var aFeatures = [];
  var been = 0;
  let mostRecentIndex = null;

  for (i=0; i< jsonObj.length; i++){
    var obj = jsonObj[i];
    
    const lonlat = dmsToDecimal(obj["Location"]);
    
    var oFeature = new Feature({
        geometry: new Point(
            fromLonLat([lonlat["longitude"],lonlat["latitude"]]),
        )
    });

   let color;

    if(obj["Besucht am"].length < 8){
      // if(obj["Typ"] == "Hallenbad"){
      // }
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
      if(mostRecentIndex == null || parseDateString(obj["Besucht am"]) > parseDateString(jsonObj[mostRecentIndex]["Besucht am"])){
        mostRecentIndex = i
      }
      color = '#00E626';
      been++;

    }
    let radius = 7
    let width = 1

    if(mobile()){
      radius = 18
      width = 2
    }
    const customStyle = new Style({
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
    
    oFeature.setStyle(customStyle);
    oFeature.attributes = obj;
    aFeatures.push(oFeature)
  }

  $('#visited-pool-count').text(been);
  $('#all-pool-count').text(jsonObj.length);

  $('#last-visited-pool').text(jsonObj[mostRecentIndex]["Name"] + " am " + jsonObj[mostRecentIndex]["Besucht am"]);

  source.addFeatures(aFeatures);

});


function dmsToDecimal(dmsString) {
  // Split the DMS string into parts
  const parts = dmsString.split(/°|′|″|,|\s/).filter(part => part !== '');

  // Extract values for degrees, minutes, seconds, direction
  const latDeg = parseFloat(parts[0]);
  const latMin = parseFloat(parts[1]);
  const latSec = parseFloat(parts[2]);
  const latDir = parts[3].toUpperCase();

  const lonDeg = parseFloat(parts[4]);
  const lonMin = parseFloat(parts[5]);
  const lonSec = parseFloat(parts[6]);
  const lonDir = parts[7].toUpperCase();

  // Calculate decimal degrees
  const latitude = latDeg + latMin / 60 + latSec / 3600 * (latDir === 'S' ? -1 : 1);
  const longitude = lonDeg + lonMin / 60 + lonSec / 3600 * (lonDir === 'W' ? -1 : 1);

  return { latitude, longitude };
}

function parseDateString(dateString) {
  // Split the string into date and time parts
  const [datePart, timePart] = dateString.split(' ');

  // Split the date part into day, month, and year
  const [day, month, year] = datePart.split('.');

  // Split the time part into hour and minute
  const [hour, minute] = timePart.split(':');

  // Create a new Date object
  // Note: Months in JavaScript are zero-based, so we subtract 1 from the parsed month
  const parsedDate = new Date(year, month - 1, day, hour, minute);

  return parsedDate;
}
function checkPopup(evt){
  let bFeature = false;
  map.forEachFeatureAtPixel(evt.pixel,
  function(feature) {
    bFeature = true;
    let text = "<h4>"+feature.attributes.Name+"</h4>\n";
    if(feature.attributes["Besucht am"].length >= 8){
      text += "<p><b>Besucht am: " +feature.attributes["Besucht am"] +"</b></p>";
    }
    text += "<p>Typ: " +feature.attributes.Typ +"</p>";
    text += "<p>Gebaut: " +feature.attributes["ab Jahr"] +"</p>";
    text += "<p>Bahnlänge: " +feature.attributes["Bahnlänge"] +"</p>";

    $('.custom-popup')[0].innerHTML = text;
    $('.custom-popup')[0].hidden = false;
    popupOverlay.setPosition(evt.coordinate);
  },
  { layerFilter: (layer) => {
      return (layer.type === new VectorLayer().type) ? true : false;
  }, hitTolerance: 6 })

  if(!bFeature){
    $('.custom-popup')[0].innerHTML = '';
    $('.custom-popup')[0].hidden = true;
  }
}
