import * as d3 from "d3";
var provinces;
var mapWidth = 700, mapHeight = 400;

var projection = d3.geoMercator();

var path = d3.geoPath()
  .projection(projection);
 


 function prov(){
  var svg = d3.select(".prov-wrapper").append("svg")
  .attr("width", mapWidth)
  .attr("height", mapHeight);
  d3.json("/convert.json").then(function (ontario) {
    //if (error) throw error;
  
    //provinces = topojson.feature(ontario, ontario.objects.ontario);
    console.log("ontario topo:", ontario);
    
    // set default projection values 
    projection
      .scale(1)
      .translate([0, 0]);
  
    // creates bounding box and helps with projection and scaling
    var b = path.bounds(ontario),
      s = .95 / Math.max((b[1][0] - b[0][0]) / mapWidth, (b[1][1] - b[0][1]) / mapHeight),
      t = [(mapWidth - s * (b[1][0] + b[0][0])) / 2, (mapHeight - s * (b[1][1] + b[0][1])) / 2];
  
    // set project with bounding box data
    projection
      .scale(s)
      .translate(t);
    
    // get individual provinces
    svg.selectAll("path")
      .data(ontario.features)
      .join("path")
      .attr("class", "map_province")
      .attr("d", path);
  
    // add the mesh/path between provinces
    svg.append("path")
      .datum(topojson.mesh(ontario, ontario, function (a, b) { return a !== b; }))
      .attr("class", "map_mesh")
      .attr("d", path);
  
  })}

  export{prov}