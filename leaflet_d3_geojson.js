import * as d3 from "d3";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import 'dotenv/config';
import uas from "url:./data/switzerland_uas_4326.geojson"

// Bug in leaflet.js: https://github.com/Leaflet/Leaflet/issues/4968#issuecomment-483402699
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const map = L.map('map').setView([46.8182, 8.2275], 7);  // Centered around Switzerland

// JAWG tile map (minimal, b&w)
L.tileLayer('https://tile.jawg.io/jawg-light/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
    attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 0,
    maxZoom: 22,
    accessToken: process.env.JAWG_ACCESS_TOKEN
}).addTo(map);

// Create an empty SVG element to be used with D3 and Leaflet
const svg = d3.select(map.getPanes().overlayPane).append("svg");
const g = svg.append("g").attr("class", "leaflet-zoom-hide");

// Data for the cities (example)
const cities = [
    { name: "New York", coords: [40.7128, -74.006] },
    { name: "London", coords: [51.5074, -0.1276] },
    { name: "Tokyo", coords: [35.6895, 139.6917] }
];

// Append circles to represent cities
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

// Tooltip for city hover events
const tooltip = d3.select(".tooltip");

// Function to update city positions based on the map state
function update() {
    g.selectAll("circle")
        .attr("cx", d => map.latLngToLayerPoint(d.coords).x)
        .attr("cy", d => map.latLngToLayerPoint(d.coords).y);

    // Sync the SVG with the map bounds
    const bounds = map.getBounds();
    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
    const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());
    svg.style("width", bottomRight.x - topLeft.x + "px")
        .style("height", bottomRight.y - topLeft.y + "px")
        .style("left", topLeft.x + "px")
        .style("top", topLeft.y + "px");

    g.attr("transform", `translate(${-topLeft.x}, ${-topLeft.y})`);
}

// Load the GeoJSON file using D3
d3.json(uas).then(geojsonData => {
    // For each feature in the GeoJSON, create SVG paths manually
    const path = g.selectAll("path")
        .data(geojsonData.features)
        .enter()
        .append("path")
        .attr("fill", "#2599cc")
        .attr("fill-opacity", 0.8)
        .attr("stroke", "#2c86ad")
        .attr("stroke-width", 1);

    // Manually generate the path string based on Leaflet projection
    function projectPoint(coords) {
        const point = map.latLngToLayerPoint(new L.LatLng(coords[1], coords[0]));
        return `${point.x},${point.y}`;
    }

    function geoPath(d) {
        // Assume we're dealing with polygons or multipolygons
        if (d.type === "Polygon") {
            return "M" + d.coordinates[0].map(coord => projectPoint(coord)).join(" L") + " Z";
        } else if (d.type === "MultiPolygon") {
            return d.coordinates.map(polygon => "M" + polygon[0].map(coord => projectPoint(coord)).join(" L") + " Z").join(" ");
        }
        return "";
    }

    // Update the path 'd' attribute with projected coordinates
    function updatePaths() {
        path.attr("d", d => geoPath(d.geometry));
    }

    map.on("moveend", () => {
        update();
        updatePaths();
    });

    update();  // Initial update for first render
    updatePaths();
});

// Initial update to position the cities and the GeoJSON
update();
