import * as d3 from "d3";

var mapWidth = 900, mapHeight = 600;

var projection = d3.geoAlbers();

var path = d3.geoPath()
  .projection(projection);



 function prov(){
  var svg = d3.select(".prov-wrapper").append("svg")
  .attr("width", mapWidth)
  .attr("height", mapHeight);
  d3.json("/ontario.topojson").then(function () {
    //if (error) throw error;
  
    provinces = topojson.feature(ontario, ontario.Topology.objects);
    console.log("ontario topo:", ontario);
    // set default projection values 
    projection
      .scale(1)
      .translate([0, 0]);
  
    // creates bounding box and helps with projection and scaling
    var b = path.bounds(provinces),
      s = .95 / Math.max((b[1][0] - b[0][0]) / mapWidth, (b[1][1] - b[0][1]) / mapHeight),
      t = [(mapWidth - s * (b[1][0] + b[0][0])) / 2, (mapHeight - s * (b[1][1] + b[0][1])) / 2];
  
    // set project with bounding box data
    projection
      .scale(s)
      .translate(t);
  
    // get individual provinces
    svg.selectAll("path")
      .data(provinces.features)
      .join("path")
      .attr("class", "map_province")
      .attr("d", path);
  
    // add the mesh/path between provinces
    svg.append("path")
      .datum(topojson.mesh(ontario, ontario.objects.ontarioprov, function (a, b) { return a !== b; }))
      .attr("class", "map_mesh")
      .attr("d", path);
  
  })}

  export{prov}