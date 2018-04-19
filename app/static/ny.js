
// color 
var income_domain = [ 50, 100, 200, 400, 500, 600, 700, 800, 900];
//var income_color = d3.scaleThreshold().domain(income_domain).range(d3.schemeOrRd[7]);

var ext_color_domain = [0, 50, 100, 200, 400, 500, 600, 700, 800, 900];
var legend_labels = ["0","< 50", "50+", "100+", "200+", "400+","500+","600+","700+","800+","< 50"]              
var income_color = d3.scaleThreshold()
  .domain(income_domain)
  .range(["#ffffcc", "#ffeda0", "#fed976", "#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"]);
//   .range(["#adfcad", "#ffcb40", "#ffba00", "#ff7d73", "#ff4e40", "#ff1300","#FF6133","#DA4216","#DA9816","#8CDA16"]);




// incomeData 
var incomeData = d3.map();



var id_svg = "svg";
var i = 1;


var canvas = d3.select('body').append('svg.income').append('g');

//var width = 960, height = 600;


var margin = {top: 50, right: 40, bottom: 20, left: 10},
    width = 1060 - margin.left - margin.right,
    height = 620 - margin.top - margin.bottom;


var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


//// Function for map zooming
function zoomed() {
    svg.attr("transform",
        "translate(" + zoom.translate() + ")" +
        "scale(" + zoom.scale() + ")"
    );
}

function interpolateZoom (translate, scale) {
    var self = this;
    return d3.transition().duration(350).tween("zoom", function () {
        var iTranslate = d3.interpolate(zoom.translate(), translate),
            iScale = d3.interpolate(zoom.scale(), scale);
        return function (t) {
            zoom
                .scale(iScale(t))
                .translate(iTranslate(t));
            zoomed();
        };
    });
}

function zoomClick() {
    var clicked = d3.event.target,
        direction = 1,
        factor = 0.2,
        target_zoom = 1,
        center = [width / 2, height / 2],
        extent = zoom.scaleExtent(),
        translate = zoom.translate(),
        translate0 = [],
        l = [],
        view = {x: translate[0], y: translate[1], k: zoom.scale()};

    d3.event.preventDefault();
    direction = (this.id === 'zoom_in') ? 1 : -1;
    target_zoom = zoom.scale() * (1 + factor * direction);

    if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    view.k = target_zoom;
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    interpolateZoom([view.x, view.y], view.k);
}


/// drag



d3.helper = {};
 
d3.helper.tooltip = function(accessor){
    return function(selection){
        var tooltipDiv;
        var bodyNode = d3.select('body').node();
        selection.on("mouseover", function(d, i){
            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();
            // Append tooltip
            tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px')
                .style('position', 'absolute') 
                .style('z-index', 1001);
            // Add text using the accessor function
            var tooltipText = accessor(d, i) || '';
            //Crop text arbitrarily
            tooltipDiv.style('width', function(d, i){return (tooltipText.length > 80) ? '300px' : null;})
               .html(tooltipText);
            
        })
        .on('mousemove', function(d, i) {
            // Move tooltip
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px');
            var tooltipText = accessor(d, i) || '';
            tooltipDiv.html(tooltipText);
        })
        .on("mouseout", function(d, i){
            // Remove tooltip
            tooltipDiv.remove();
        });
 
    };
};

// Load data 
var loadData = function () {
    var sect = document.getElementById('dropdown');//.getAttribute();
   // selected_dataset = d3.event.target.value;
    section = sect.options[sect.selectedIndex].text;
    var dataFile = 'static/' + section + '.csv';

    d3.queue()
        //.defer(d3.json, "data/ny-quantize-topo.json")
        // .defer(d3.json, "data/Tx-twokm.json")
        .defer(d3.json, "static/Tx-counties.json")
        .defer(d3.csv, dataFile, function (d) {
            if (isNaN(d.income)) {
                incomeData.set(d.id, 0);
            } else {
                incomeData.set(d.id, +d.income);
            }

        //    console.log(d.precipitation)

        })
        //  .call(d3.helper.tooltip()) (function(d, i){return tooltipText(d);})
       // console.log(d.precipitation)
        .await(ready);
    //console.log(section);


//console.log(d)


}

function loadDataAtStartUp() {
    // var dataFile = 'data/income.csv'
    var dataFile = 'static/2017.csv'
    d3.queue()
        .defer(d3.json, "static/Tx-counties.json")
        .defer(d3.csv, dataFile, function (d) {
            if (isNaN(d.income)) {
                incomeData.set(d.id, 0);
            } else {
                incomeData.set(d.id, +d.income);
            }
    console.log(d.precipitation)
    // console.log(d.income)
    })
     .await(ready);  
}

loadDataAtStartUp();

function Update() {
    d3.selectAll('g').remove();
    loadData();
}


// callback function  
function ready(error, data) {

    if (error) throw error;

    // texas topojson
    var texas = topojson.feature(data, {
        type: "GeometryCollection",
         geometries: data.objects.Tx.geometries
    });
    
    // projection and path
    var projection = d3.geoAlbersUsa()
        .fitExtent([[20, 20], [460, 580]], texas);;

    var geoPath = d3.geoPath()
        //.projection(projection);
        .projection(d3.geoConicConformal()
            .parallels([33, 45])
            .rotate([100])
            .fitSize([width, height], texas));


    // draw Texas map and bind income data
  var svg = d3.select("svg.income").append('g').selectAll("path")
        .data(texas.features)
        .enter()
        .append("path")
        .attr("d", geoPath)
        .attr("fill", "white")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(d3.zoom().on("zoom", function () {
              svg.attr("transform", d3.event.transform)   /// complete the zoommm?
      }))
     
     
        // .transition().duration(2000)
        // .delay(function (d, i) {
        //     return i * 5;
        // })
        //.ease(d3.easeLinear)
        .attr("fill", function (d) {
            var value = incomeData.get(d.properties.GEOID);
            return (value != 0 ? income_color(value) : "lightblue");
           
        })
        .attr("class", "counties-income")
        .call(d3.helper.tooltip(function(d, i){return tooltipText(d);}))
        .attr("class", "legend")
       // .call(legend);

function tooltipText(d){
        return "<b> CountyName:" + d.properties["NAME"] + "</b>"
                //   + "<br/> County: " + d.County
                  + "<br/> Groundwater Level: " + d.income
                //   + "<br/> Precipitation: " + d.precipitation
                //   + "<br/> Max Temperature: " + d.income
                //   + "<br/> Min Temperature: " + d.income
    console.log(d)
    console.log(d.income)

}
    

var legend = d3.select("svg")
  .selectAll("g")
  .data(ext_color_domain)
  .enter().append("g")
  .attr("class", "legend")


var ls_w = 20, ls_h = 20;

  legend.append("rect")
  .attr("x", 20)
  .attr("y", function(d, i){ return height - (i*ls_h) - 2*ls_h;})
  .attr("width", ls_w)
  .attr("height", ls_h)
  .style("fill", function(d, i) { return income_color(d); })
  .style("opacity", 0.8);

  legend.append("text")
  .attr("x", 50)
  .attr("y", function(d, i){ return height - (i*ls_h) - ls_h - 4;})
  .text(function(d, i){ return legend_labels[i]; });



    // title
    d3.select("svg.income").selectAll("path")
        .append("title")
        .text(function (d) {
            return d.income = incomeData.get(d.properties.GEOID);    
            
        });
}(window.d3);