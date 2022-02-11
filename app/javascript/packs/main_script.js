import * as d3 from "d3"
//import { update } from "lodash";


const _ = require("lodash");
const parseTime = d3.timeParse("%Y-%m-%d");

var dataFiles = ['/vaccinations.csv', '/prov_loc.csv']
var mapWidth = 900,
  mapHeight = 600;

var c10 = d3.scaleOrdinal(d3.schemeCategory10);

var projection = d3.geoAlbers();

var path = d3.geoPath()
  .projection(projection);

var svg = d3.select(".wrapper").append("svg")
  .attr("width", mapWidth)
  .attr("height", mapHeight);

var mapLabel = svg.append("text")
  .attr("y", 20)
  .attr("x", 0)
  .attr("class", "map_province_name")

/*---------------DRAW MAP!----------------*/
// load TopoJSON file of Canada
d3.json("/canadaprovtopo.json").then(function (canada) {
  //if (error) throw error;

  var provinces = topojson.feature(canada, canada.objects.canadaprov);

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
    .enter().append("path")
    .attr("class", "map_province")
    .attr("d", path)
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("click", clicked)

  // add the mesh/path between provinces
  svg.append("path")
    .datum(topojson.mesh(canada, canada.objects.canadaprov, function (a, b) { return a !== b; }))
    .attr("class", "map_mesh")
    .attr("d", path);
});

/*---------------LOAD DATA----------------*/
var freqData;
Promise.all(dataFiles.map(url => d3.csv(url))).then(data => {

  //Left Outer Join province location data onto province vaccine data
  data[0].forEach(main => {
    var addGeoData = data[1].filter((provLoc) => {
      return main.pruid === provLoc.pruid;
    });
    main.long = (addGeoData[0] !== undefined) ? addGeoData[0].long : null;
    main.lat = (addGeoData[0] !== undefined) ? addGeoData[0].lat : null;

  })

  //Get end of month vaccine data. 
  var filteredData = data[0].filter((row) => {
    return row['report_date'].slice(8, 10) == '28';
  })

  //Create Array of objects with the data we need.
  freqData = filteredData.map((d) => {
    return {
      Province: d.prename,
      DoseTotal: +d.numtotal_all_administered,
      Dose1: +d.numtotal_dose1_administered,
      Dose2: +d.numtotal_dose2_administered,
      Dose3: +d.numtotal_dose3_administered,
      Date: parseTime(d.report_date),
      Lat: +d.lat,
      Long: +d.long
    };
  })
  console.log("freqData", freqData);

  console.log([...d3.group(freqData, d => d.Date)][0]);

  var canadaFinal = freqData[freqData.length - 14];

  var rScale = d3.scaleLinear()
    .domain([0, canadaFinal.DoseTotal])
    .range([6, 400]);

  svg.selectAll("circle")
  .data(freqData)
  .join("circle")
  .attr("cx", (d) => {
      return projection([d.Long, d.Lat])[0];
    })
  .attr("cy", d => {
      return projection([d.Long, d.Lat])[1];
    })
    // .attr("r", d => {
    //   return rScale(d.DoseTotal);
    // })
    .style("fill", "rgb(217,91,67)")
    .style("opacity", 0.4)
    .style("stroke", "black")
  
  d3.select("#nRadius").on("input", function () {
    update(+this.value);
  });

  update(0);

  function update(nIndex) {
    var nRadius = [...d3.group(freqData, d => d.Date)][nIndex][1];

    nRadius.forEach(d => {

      d3.select("#value")
        .text(d.Date.toLocaleString('default', { month: 'long' }) + " " + d.Date.getFullYear());
      svg.selectAll("circle")
      .data(nRadius)
      .attr("r", d=>rScale(d.DoseTotal));
      // svg.selectAll("circle")
      // .data(d)
      // .enter() 
      // .attr("r", rScale(d.DoseTotal));
    })

    d3.select("#nRadius").property("value", nIndex);
  }
});

let mouseover = d => {

  mapLabel.text(d.srcElement.__data__.properties.name) // remove suffix id from name
}

function mouseout(d) {
  mapLabel.text("")  // remove out name
}

function clicked(d) {
  //Much Later
}