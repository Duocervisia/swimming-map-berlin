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
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';

window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};


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

map.on('click', function(evt) {
  map.forEachFeatureAtPixel(evt.pixel,
    function(feature) {
      $('#clicked-pool').text(feature.attributes.Name);
    })
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
          color = '#33FFDD'
          break;
        case "Freibad":
          color = '#9999FF'
          break;
        default:
          console.log(obj["Typ"])
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

    if(window.mobileCheck()){
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
