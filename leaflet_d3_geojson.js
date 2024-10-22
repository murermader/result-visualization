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
        .attr("stroke-width", 1)
        // TODO: box intersection always true?
        // .filter(d => {
        //     const bbox = L.latLngBounds(
        //         [8.281288106122878, 47.246810733013476], // SW corner of feature
        //         [8.737644767926998, 47.566365143710556],  // NE corner of feature
        //     );
        //     const featureBbox = d3.geoBounds(d);
        //     const featureLatLngBounds = L.latLngBounds(
        //         [featureBbox[0][1], featureBbox[0][0]], // SW corner of feature
        //         [featureBbox[1][1], featureBbox[1][0]]  // NE corner of feature
        //     );
        //     console.log(d)
        //     console.log(bbox.intersects(featureLatLngBounds))
        //     return bbox.intersects(featureLatLngBounds);
        // })
        // .attr("fill", "red")  // Change the fill to blue for filtered paths
        // .attr("stroke", "red");  // Optionally, change the stroke color too

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
    updateRectangle(); // Update the rectangle position on map changes
});

// Rectangle coordinates
const lowerLeft = [47.246810733013476, 8.281288106122878]; // [latitude, longitude]
const upperRight = [47.566365143710556, 8.737644767926998]; // [latitude, longitude]

// Function to add the rectangle to the map
function addRectangle() {
    // Project the geographic coordinates to pixel coordinates in the map's current view
    const lowerLeftPoint = map.latLngToLayerPoint(lowerLeft);
    const upperRightPoint = map.latLngToLayerPoint(upperRight);

    // Define width and height of the rectangle
    const width = upperRightPoint.x - lowerLeftPoint.x;
    const height = lowerLeftPoint.y - upperRightPoint.y;

    // Add the rectangle to the SVG layer
    g.append("rect")
        .attr("x", lowerLeftPoint.x)
        .attr("y", upperRightPoint.y) // y is the top-left corner, so we use upperRightPoint for that
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")  // No fill, just an outline
        .attr("stroke", "red")  // Red outline
        .attr("stroke-width", 2);  // Stroke thickness
}

// Function to update the rectangle position on map movement
function updateRectangle() {
    const lowerLeftPoint = map.latLngToLayerPoint(lowerLeft);
    const upperRightPoint = map.latLngToLayerPoint(upperRight);

    const width = upperRightPoint.x - lowerLeftPoint.x;
    const height = lowerLeftPoint.y - upperRightPoint.y;

    // Get the map's current translation (topLeft corner of the map view)
    const bounds = map.getBounds();
    const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());

    // Update the rectangle's position relative to the transformed SVG group (g)
    g.selectAll("rect")
        .attr("x", lowerLeftPoint.x - topLeft.x)
        .attr("y", upperRightPoint.y - topLeft.y)
        .attr("width", width)
        .attr("height", height);
}


// Initial update to position the cities and the GeoJSON
update();
addRectangle();
