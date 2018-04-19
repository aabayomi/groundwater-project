
// color 
var income_domain = [0, 10000, 50000, 70000, 80000, 150000, 290000, 360000]
var income_color = d3.scaleThreshold()
    .domain(income_domain)
    .range(d3.schemeGreens[7]);

var poverty_domain = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]
var poverty_color = d3.scaleThreshold()
    .domain(poverty_domain)
    .range(d3.schemeReds[4]);

// incomeData 
var incomeData = d3.map();

// povertyData 
var povertyData = d3.map();


//var g = svg.append("g");

var width = 960,
    height = 600;

// var svg = d3.select("svg"),
//     width = svg.attr("width"),
//     height = svg.attr("height");

// var svg = d3.select("svg.income")
//       .append("svg")
//       .attr("width", "100%")
//       .attr("height", "100%")
//       .call(d3.zoom().on("zoom", function () {
//               svg.attr("transform", d3.event.transform)
//       }))
//       .append("g")


// var randomX = d3.random.normal(width / 2, 80),
//     randomY = d3.random.normal(height / 2, 80);

// var data = d3.range(2000).map(function() {
//     return [randomX(), randomY() ];
// });

//var zoom = d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoomed);

var svg = d3.select("svg.income").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
   // .call(zoom)
    .call(d3.zoom().on("zoom", function () {
              svg.attr("transform", d3.event.transform)
    .append("g")

svg.append("rect")
    .attr("class", "overlay")
    .attr("width", width)
    .attr("height", height);






// asynchronous tasks, load topojson maps and data
d3.queue()
    .defer(d3.json, "data/Tx-counties.json")
    .defer(d3.csv, "data/tx.income.csv", function(d) { 
        if (isNaN(d.income)) {
            incomeData.set(d.id, 0); 
        } else {
            incomeData.set(d.id, +d.income); 
        }
        
    })
    // .defer(d3.csv, "data/poverty.csv", function(d) {
    //     if (d.poverty == '-') {
    //         povertyData.set(d.id, 0);
    //     } else {
    //         povertyData.set(d.id, +d.poverty); 
    //     }
        
    // })
    .await(ready);



// callback function  
function ready(error, data) {

    if (error) throw error;
     console.log(data);

    // texas topojson
    var texas = topojson.feature(data, {
        type: "GeometryCollection",
        geometries: data.objects.Tx.geometries
    });
    
    //d3.selectAll('svg').attr("transform", "scale(2)");
    // projection and path
    var projection = d3.geoAlbersUsa()
       .fitExtent([[50, 50], [460, 580]], texas);;
          //.scale(10000)
         // .translate([width /2,height /2]);

    var geoPath = d3.geoPath()
        //.projection(projection);
          .projection(d3.geoConicConformal()
          .parallels([33, 45])
          .rotate([96, -39])
          .fitSize([width, height], texas));

    // draw texas map and bind income data
    d3.select("svg.income").selectAll("path")
        .data(texas.features)
        .enter()
        .append("path")
        .attr("d", geoPath)
        .attr("fill", "white")
        // .transition().duration(2000)
        // .delay(function(d, i) {
        //     return i * 5; 
        // })
        .ease(d3.easeLinear)
        .attr("fill", function(d) { 
            var value = incomeData.get(d.properties.GEOID);
            return (value != 0 ? income_color(value) : "lightblue");  

        })
        .attr("class", "counties-income");
    
  // title
    d3.select("svg.income").selectAll("path")
        .append("title")
        .text(function(d) {
            return d.income = incomeData.get(d.properties.GEOID);
        });

    // draw new york map and bind poverty data
    // d3.select("svg.poverty").selectAll("path")
    //     .data(new_york.features)
    //     .enter()
    //     .append("path")
    //     .attr("d", geoPath)
    //     .attr("fill", "white")
    //     .transition().duration(2000)
    //     .delay(function(d, i) {
    //         return i * 5; 
    //     })
    //     .ease(d3.easeLinear)
    //     .attr("fill", function(d) { 
    //         var value = povertyData.get(d.properties.GEOID);
    //         return (value != 0 ? poverty_color(value) : "lightblue");  

    //     })
    //     .attr("class", "counties-poverty");
        
    // title
    // d3.select("svg.poverty").selectAll("path")
    //     .append("title")
    //     .text(function(d) {
    //         return d.income = incomeData.get(d.properties.GEOID);
    //     });



// function zoomClick() {
//     var clicked = d3.event.target,
//         direction = 1,
//         factor = 0.2,
//         target_zoom = 1,
//         center = [width / 2, height / 2],
//         extent = zoom.scaleExtent(),
//         translate = zoom.translate(),
//         translate0 = [],
//         l = [],
//         view = {x: translate[0], y: translate[1], k: zoom.scale()};

//     d3.event.preventDefault();
//     direction = (this.id === 'zoom_in') ? 1 : -1;
//     target_zoom = zoom.scale() * (1 + factor * direction);

//     if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

//     translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
//     view.k = target_zoom;
//     l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

//     view.x += center[0] - l[0];
//     view.y += center[1] - l[1];

//     interpolateZoom([view.x, view.y], view.k);
// }


// d3.selectAll('button').on('click', zoomClick);

// //});


 //}

