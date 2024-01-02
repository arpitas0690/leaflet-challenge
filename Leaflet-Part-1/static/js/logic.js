// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create the base layers.
var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
}); 

// Create a baseMaps object.
var baseMaps = {
  "Street Map": street,
  "Topographic Map": topo
};

//get the legend container in the body
var legendContainer = document.getElementById('legend');

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  console.log('Data', data);
  createFeatures(data.features);

  // Once we get a response, send the data.features object to the createFeatures function.
  function createFeatures(earthquakeData) {
    console.log('Creating features with data:',earthquakeData);

    // Find the minimum and maximum depth values in the dataset
    var minDepth = d3.min(earthquakeData, function (d) { return d.geometry.coordinates[2]; });
    var maxDepth = d3.max(earthquakeData, function (d) { return d.geometry.coordinates[2]; });

    //adding color scale for depth
    var colorScale = d3.scaleLinear()
    .domain([minDepth,maxDepth])
    .range(['yellow', 'red']);

    var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
          radius: feature.properties.mag * 3 || .5,
          color: colorScale(feature.geometry.coordinates[2]),
          fillColor: colorScale(feature.geometry.coordinates[2]), 
          fillOpacity:0.7
        });
      },
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}<hr><p>${new Date(feature.properties.time)}</p>`);
    }
  });  
  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
  console.log('Creating legend');
  // Send our colorscale data to the createLegend function/
  createLegend(colorScale);
  }
  // Function to create legend
  function createLegend(colorScale) {
    // Clear existing content in the legend container
    legendContainer.innerHTML = '';

    // Create legend content
    var legendContent = '<strong>Depth Legend</strong><br>';

    // legendColors = colorScale.ticks(5).map(function(depth) {
    var legendTicks = colorScale.ticks(5);

    legendTicks.forEach(function (tick, i) {
      var color = colorScale(tick);

      legendContent += `<div style="background-color: ${color}; width: 20px; height:10px; display: inline-block;"></div>`;
      legendContent += `<span>${tick.toFixed(2)} - ${(i < legendTicks.length - 1) ? legendTicks[i + 1].toFixed(2) : '+'}</span>`;
      if (i <legendTicks.length - 1) {
        legendContent += '<br>';
      }
    });

    // Insert legend content into the legend container
    legendContainer.innerHTML = legendContent;
  }  
  function createMap(earthquakes) {
 
      // Create an overlay object to hold our overlay.
      var overlayMaps = {
        Earthquakes: earthquakes
      };
    
      // Create our map, giving it the streetmap and earthquakes layers to display on load.
      var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [street, earthquakes]
      });
    
      // Create a layer control.
      // Pass it our baseMaps and overlayMaps.
      // Add the layer control to the map.
      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);
}});
