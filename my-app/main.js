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


const raster = new TileLayer({
  source: new OSM(),
});

const sourceNotBeen = new VectorSource();
const vectorNotBeen = new VectorLayer({
  source: sourceNotBeen,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.2)',
    'stroke-color': '#bf1029',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': '#bf1029',
  },
});

const sourceBeen = new VectorSource();
const vectorBeen = new VectorLayer({
  source: sourceBeen,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.2)',
    'stroke-color': '#056517',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': '#056517',
  },
});

// Limit multi-world panning to one world east and west of the real world.
// Geometry coordinates have to be within that range.
const extent = get('EPSG:3857').getExtent().slice();
extent[0] += extent[0];
extent[2] += extent[2];
const map = new Map({
  layers: [raster, vectorNotBeen, vectorBeen],
  target: 'map',
  view: new View({
    center: transform([13.414951, 52.507783], 'EPSG:4326', 'EPSG:3857'),
    zoom: 12,
    extent,
  }),
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
  var aBeen = [];
  var aNotBeen = [];
  for (i=0; i< jsonObj.length; i++){
    var obj = jsonObj[i];
    
    const lonlat = dmsToDecimal(obj["Location"]);
    
    var oFeature = new Feature({
        geometry: new Point(
            fromLonLat([lonlat["longitude"],lonlat["latitude"]])
        )
    });
    if(obj["Besucht am"].length > 8){
      aNotBeen.push(oFeature);
    }else{
      aBeen.push(oFeature);
    }
  }

  sourceBeen.addFeatures(aBeen);
  sourceNotBeen.addFeatures(aNotBeen);

});


// const modify = new Modify({source: source});
// map.addInteraction(modify);

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

// let draw, snap; // global so we can remove them later
// const typeSelect = document.getElementById('type');

// function addInteractions() {
//   draw = new Draw({
//     source: source,
//     type: typeSelect.value,
//   });
//   map.addInteraction(draw);
//   snap = new Snap({source: source});
//   map.addInteraction(snap);
// }

// /**
//  * Handle change event.
//  */
// typeSelect.onchange = function () {
//   map.removeInteraction(draw);
//   map.removeInteraction(snap);
//   addInteractions();
// };

// addInteractions();
