import * as d3 from "d3";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import 'dotenv/config'

// Bug in leaflet.js: https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-483402699
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const map = L.map('map').setView([51.505, -0.09], 2);  // Centered around the world

// Default tile map
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
// }).addTo(map);

// JAWG tile map (minimal, b&w)
L.tileLayer('https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
    attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 0,
    maxZoom: 22,
    accessToken: process.env.JAWG_ACCESS_TOKEN
}).addTo(map);

const svg = d3.select(map.getPanes().overlayPane).append("svg");
const g = svg.append("g").attr("class", "leaflet-zoom-hide");

const cities = [
    {name: "New York", coords: [40.7128, -74.006]},
    {name: "London", coords: [51.5074, -0.1276]},
    {name: "Tokyo", coords: [35.6895, 139.6917]}
];

function update() {
    const bounds = map.getBounds();
    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
    const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());
    svg.style("width", bottomRight.x - topLeft.x + "px")
        .style("height", bottomRight.y - topLeft.y + "px")
        .style("left", topLeft.x + "px")
        .style("top", topLeft.y + "px");
    g.attr("transform", `translate(${-topLeft.x}, ${-topLeft.y})`);
    g.selectAll("circle")
        .attr("cx", d => map.latLngToLayerPoint(d.coords).x)
        .attr("cy", d => map.latLngToLayerPoint(d.coords).y);
}

const tooltip = d3.select(".tooltip");
g.selectAll("circle")
    .data(cities)
    .enter()
    .append("circle")
    .attr("r", 8)
    .attr("fill", "red")
    .on("mouseover", function (event, d) {
        tooltip.style("opacity", 1)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 5) + "px")
            .html(d.name);
        d3.select(this).attr("r", 12);
    })
    .on("mouseout", function () {
        tooltip.style("opacity", 0);
        d3.select(this).attr("r", 8);
    });

map.on("moveend", update);
update();
