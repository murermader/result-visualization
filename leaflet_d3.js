import * as d3 from "d3";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

// Initialize Leaflet map with OSM tiles
const map = L.map('map').setView([51.505, -0.09], 2);  // Centered around the world

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Append an SVG layer on top of Leaflet map for D3
const svg = d3.select(map.getPanes().overlayPane).append("svg");
const g = svg.append("g").attr("class", "leaflet-zoom-hide");

// Example data (markers)
const cities = [
    {name: "New York", coords: [40.7128, -74.006]},
    {name: "London", coords: [51.5074, -0.1276]},
    {name: "Tokyo", coords: [35.6895, 139.6917]}
];

const tooltip = d3.select(".tooltip");

// Function to update positions of the D3 elements on zoom
function update() {
    const bounds = map.getBounds();
    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
    const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

    svg.style("width", bottomRight.x - topLeft.x + "px")
        .style("height", bottomRight.y - topLeft.y + "px")
        .style("left", topLeft.x + "px")
        .style("top", topLeft.y + "px");

    g.attr("transform", `translate(${-topLeft.x}, ${-topLeft.y})`);

    // Position circles (for example, cities) on the map
    g.selectAll("circle")
        .attr("cx", d => map.latLngToLayerPoint(d.coords).x)
        .attr("cy", d => map.latLngToLayerPoint(d.coords).y);
}

// Create D3 circles for cities
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

map.on("moveend", update);  // Update positions when the map moves or zooms
update();  // Initial update
