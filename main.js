import './style.css'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css';

console.log("Hello World!")

const basel_coords = [47.56059246043523, 7.590136499248171]
const dbis_coords = [47.560191795618316, 7.587282445690428]

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
