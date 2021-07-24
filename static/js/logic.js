var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var earthquakeCircles = [];

d3.json(queryUrl).then(function(data){
    console.log(data);
    var earthquakes = data.features;
    console.log(earthquakes);
    earthquakes.forEach(earthquake =>{
        var long = earthquake.geometry.coordinates[0];
        var lat = earthquake.geometry.coordinates[1];
        var depth = earthquake.geometry.coordinates[2];
        var mag = earthquake.properties.mag;
        var color = getColor(depth);
        var popText = "<h3>" + earthquake.properties.place + "</h3>" +
                        "<hr> <p>Magnitude: "+ mag + "<br>Depth: "
                        + depth.toFixed(2) +"</p>"
        earthquakeCircles.push(
            L.circle([lat,long], {
                color: color,
                fillColor: color,
                fillOpacity: 0.25,
                radius: mag*10000
            }).bindPopup(popText)
        );
    });

    var earthquakeLayer = L.layerGroup(earthquakeCircles);
    createMap(earthquakeLayer);

});

function createMap(earthquakeLayer){

        var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: "",
            tileSize: 512,
            maxZoom: 18,
            zoomOffset: -1,
            id: "mapbox/dark-v10",
            accessToken: API_KEY
            });

        var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
            attribution: "",
            tileSize: 512,
            maxZoom: 18,
            zoomOffset: -1,
            id: "mapbox/satellite-v8",
            accessToken: API_KEY
            });   

        var baseMaps = {
            Dark: darkMap,
            Satellite: satellite
        };
    
        var overlayMaps = {
            Earthquake: earthquakeLayer
        };

        var myMap = L.map("map",{
            center: [40.00, -93.00],
            zoom: 4,
            layers: [darkMap, earthquakeLayer]
        });
    
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
          }).addTo(myMap);

        var legend = L.control({position: "bottomright"});
        legend.onAdd = function(){
            var div = L.DomUtil.create("div", "info legend");
            var labels = []
            var limits = [8,9,29,49,69,90];
            var categories = ["-10-10","10-30","30-50","50-70", "70-90","+90"];


            labels.push("<text x =\"10\" y=\"25\""
                + "style=\"font-size:20px; font-weight:bold;\">"+
                "Quake Depth"+"</text>");

            limits.forEach(function(limit, index){
                var ypos = 40+(40*index)
                var label = "<rect x=\"10\" y=\"" + ypos + "\" height=\"40\""+
                " width=\"40\" style=\"fill:" + getColor(limit +1) + 
                ";fill-opacity:1;\"/> <text x =\"60\" y=\"" + (ypos+25) +
                "\" style=\"font-size:20px;\">"+categories[index]+"</text>";

                labels.push(label);
            });

            div.innerHTML += "<svg height=\"300\" width=\"150\" style=\"background-color:white\">"+
            labels.join("") + "</svg>";

            return div;

        };

        legend.addTo(myMap);
}

function getColor(depth){
    var color = "";
    if (depth > 90){
        color = "#cc3300";
    } else if (depth > 69){
        color = "#ff9900";
    } else if (depth > 49){
        color = "#ffcc00";
    } else if (depth > 29){
        color = "#ffff00";
    } else if (depth > 9){
        color = "#bfff00";
    } else{
        color = "#40ff00";
    }
    return color;
}