import * as d3 from "d3";

var regions;
var mapWidth = 700, mapHeight = 400;

var projection = d3.geoMercator()
.center([0, 5 ])
.scale(2000);

var path = d3.geoPath()
  .projection(projection);
 
 


 function prov(){
  var svg = d3.select(".prov-wrapper").append("svg")
  .attr("width", mapWidth)
  .attr("height", mapHeight);
  d3.json("/ontario2.json").then(function (ontario) {
    //if (error) throw error;
  
    regions = topojson.feature(ontario, ontario.objects.HR_035a18a_e);
    console.log("ontario topo:", ontario);
    
    // set default projection values 
    projection
      .scale(1)
      .translate([0, 0]);
  
    // creates bounding box and helps with projection and scaling
    var b = path.bounds(regions),
      s = .95 / Math.max((b[1][0] - b[0][0]) / mapWidth, (b[1][1] - b[0][1]) / mapHeight),
      t = [(mapWidth - s * (b[1][0] + b[0][0])) / 2, (mapHeight - s * (b[1][1] + b[0][1])) / 2];
  
    // set project with bounding box data
    projection
      .scale(s)
      .translate(t);
    var g = svg.append("g");
    // get individual regions
    g.selectAll("path")
      .data(regions.features)
      .join("path")
      .attr("class", "map_province")
      .attr("d", path);
  
    // add the mesh/path between regions
    g.append("path")
      .datum(topojson.mesh(ontario, ontario.objects.HR_035a18a_e, function (a, b) { return a !== b; }))
      .attr("class", "map_mesh")
      .attr("d", path);
  
  })}

  export{prov}