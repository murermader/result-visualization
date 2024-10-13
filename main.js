import "./style.css";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

const basel_coords = [47.56059246043523, 7.590136499248171];
const dbis_coords = [47.560191795618316, 7.587282445690428];
const kolllegienhaus_cords = [47.558548044771115, 7.583476523204751];
const church = [47.55632731812046, 7.591962500574559];

const dotIcon = L.icon({
  iconUrl: "shapes/dot.png",
  shadowUrl: "shapes/dot-shadow.png",

  iconSize: [15, 15], // size of the icon
  shadowSize: [15, 15], // size of the shadow
  //iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
  //shadowAnchor: [4, 62],  // the same for the shadow
  //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

// Base Layers
var osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap",
});
var osmHOT = L.tileLayer(
  "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      "© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France",
  },
);

const dbisMarker = L.marker(dbis_coords, { icon: dotIcon });
const kollegienhausMarker = L.marker(kolllegienhaus_cords, { icon: dotIcon });

const geoJson = {
  type: "Feature",
  properties: {
    name: "Mittlere Brücke Kirchgebäude",
    popupContent: "Hi!",
  },
  geometry: {
    type: "Point",
    coordinates: [7.5898043, 47.560044],
  },
};
const geoJsonPoint = L.geoJSON(geoJson);
const churchMarker = L.marker(church);
const line = L.polyline([dbis_coords, kolllegienhaus_cords]);
const polygon_kannenfeldpark = L.polygon([
  [47.56507584522959, 7.567553245277034],
  [47.567488799448775, 7.5710071723656185],
  [47.56640584538745, 7.572527706774529],
  [47.565227899037275, 7.572790483935742],
  [47.5637839687455, 7.570387764984862],
]);

const points = L.layerGroup([
  dbisMarker,
  kollegienhausMarker,
  geoJsonPoint,
  churchMarker,
]);
const other_shapes = L.layerGroup([line, polygon_kannenfeldpark]);

const baseMaps = {
  OpenStreetMap: osm,
  "OpenStreetMap.HOT": osmHOT,
};

const overlayMaps = {
  Points: points,
  "Other Shapes": other_shapes,
};

const map = L.map("map", { layers: [osm, points] }).setView(basel_coords, 13);
const layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
