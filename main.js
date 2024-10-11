import './style.css'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';

console.log("Hello World!")

const basel_coords = [47.56059246043523, 7.590136499248171]
const dbis_coords = [47.560191795618316, 7.587282445690428]
const kolllegienhaus_cords = [47.558548044771115, 7.583476523204751]
const church = [47.55632731812046, 7.591962500574559]

const dotIcon = L.icon({
    iconUrl: 'shapes/dot.png',
    shadowUrl: 'shapes/dot-shadow.png',

    iconSize:     [15, 15], // size of the icon
    shadowSize:   [15, 15], // size of the shadow
    //iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
    //shadowAnchor: [4, 62],  // the same for the shadow
    //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

const map = L.map('map').setView(basel_coords, 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const markerDefault = L.marker(dbis_coords, {icon: dotIcon}).addTo(map);
L.marker(kolllegienhaus_cords, {icon: dotIcon}).addTo(map);

const geoJson = {
    "type": "Feature",
    "properties": {
        "name": "Mittlere Brücke Kirchgebäude",
        "popupContent": "Hi!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [7.5898043, 47.5600440]
    }
};
L.geoJSON(geoJson).addTo(map);
L.marker(church).addTo(map);

const line = L.polyline([dbis_coords, kolllegienhaus_cords]).addTo(map);

