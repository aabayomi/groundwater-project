
// color


// births data
var birthsData=d3.map();



// asynchronous taks 
d3.queue()
    .defer(d3.json,"data/final.json")
    .defer(d3.csv,"data/population.csv")
    .await(ready);


// callback function
function ready(error,data){

    if(error) throw error;

    //usa
    var usa = topojson.feature(data, {
        type:"GeaometryCollection",
        geometries: data.objects.counties.geometries
    });

    //
    var projection =d3.geoAlbersUsa()
        .fitExtent([[20,20],[460,500] ],usa)

    var geoPath=d3.geoPath()
        .projection(projection)


    d3.select("svg.births").selectAll("path")
        .data(usa.features)
        .enter()
        .append("path")
        .attr("d",geoPath)
        attr("fill","green");
}

