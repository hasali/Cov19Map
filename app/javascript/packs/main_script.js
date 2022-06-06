import * as d3 from "d3"
import { prov } from './ontario'

const _ = require("lodash");
const parseTime = d3.timeParse("%Y-%m-%d");

var freqData;
var provinces;
var dataFiles = ['/vaccinations.csv', '/prov_loc.csv'];
var provTopoData = "/canadaprovtopo.json";
var mapWidth = 900, mapHeight = 600;
var legendText = [];
var legendColor = ["rgb(217,91,67)", "rgb(217,91,67)", "rgb(217,91,67)"];
var legendOpacity = [0.2, 0.6, 0.9];
var c10 = d3.scaleOrdinal(d3.schemeCategory10);
var format = d3.format(".3s")

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



var statsBar = d3.select(".stats")
  .append('svg')
  .attr('width', 100)
  .attr('height', 200)
  .selectAll('g')
  .data(legendColor)
  .join('g')
  .attr("transform", function (d, i) { return "translate(0," + i * 40 + ")"; });

statsBar.append('rect')
  .attr('width', 17)
  .attr('height', 17)
  .style('opacity', (d, i) => { return legendOpacity[i] })
  .style('fill', (d, i) => { return legendColor[i] });

statsBar.append('text')
  .attr('class', 'dose-text')
  .text("0")
  .attr("x", 30)
  .attr("y", 9)
  .attr("dy", ".35em")
  .style('fill', 'white');

/*--------------------------------DRAW MAP!----------------------------------*/

// load TopoJSON file of Canada
d3.json("/canadaprovtopo.json").then(function (canada) {
  //if (error) throw error;

  provinces = topojson.feature(canada, canada.objects.canadaprov);
  console.log("canada topo:", canada);
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
    .datum(topojson.mesh(canada, canada.objects.canadaprov, function (a, b) { return a !== b; }))
    .attr("class", "map_mesh")
    .attr("d", path);

}).then(Promise.all(dataFiles.map(url => d3.csv(url))).then((data) => {
  //console.log(provinces);
  //Left Outer Join province location data onto province vaccine data
  data[0].forEach(main => {
    var addGeoData = data[1].filter((provLoc) => {
      return main.pruid === provLoc.pruid;
    });
    main.long = (addGeoData[0] !== undefined) ? addGeoData[0].long : null;
    main.lat = (addGeoData[0] !== undefined) ? addGeoData[0].lat : null;
  })

  //Get end of month vaccine data. Also, use total dose field for first dose until first dose field has non-zero entries.  
  var filteredData = data[0].filter((row) => {
    if (row['numtotal_dose1_administered'] == "")
      row['numtotal_dose1_administered'] = row['numtotal_all_administered'];
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
}).then(() => {

  console.log(provinces);
  console.log("freqData", freqData);

  var canadaFinal = freqData[freqData.length - 14];

  var rScale = d3.scaleLinear()
    .domain([0, canadaFinal.DoseTotal])
    .range([0, 400]);

  /*-----------------------Legend----------------------------*/

  /*-----------------Draw Circle Markers----------------*/

  d3.select("#nRadius").on("input", function () {
    update(+this.value);
  });

  update(11);
  //Slider and map circle marker functionality. 
  var nRadius1;

  function update(nIndex) {
    //Create new array ordered by date using slider value as index. 
    //[1] is to step into sub array in array of objects.

    nRadius1 = d3.groups(freqData, d => d.Date)[nIndex][1];
    console.log(nRadius1);

    nRadius1.forEach(d => {
      d3.select("#value")
        .text(d.Date.toLocaleString('default', { month: 'long' }) + " " + d.Date.getFullYear());
    })

    //circles.exit().remove();
    svg.selectAll(".circle1")
      .data(nRadius1)
      .join("circle")
      .attr("class", "circle1")
      .attr("cx", (d) => {
        return projection([d.Long, d.Lat])[0];
      })
      .attr("cy", d => {
        return projection([d.Long, d.Lat])[1];
      })
      .transition()
      .duration(500)
      .attr("r", d => rScale(d.Dose1))
      .style("fill", "rgb(217,91,67)")
      .style("opacity", 0.2)
      .style("stroke", "black")
      .style("z-index", -1)
      .style("pointer-events", "none");

    svg.selectAll(".circle2")
      .data(nRadius1)
      .join("circle")
      .attr("class", "circle2")
      .attr("cx", (d) => {
        return projection([d.Long, d.Lat])[0];
      })
      .attr("cy", d => {
        return projection([d.Long, d.Lat])[1];
      })
      .transition()
      .duration(500)
      .attr("r", d => rScale(d.Dose2))
      .style("fill", "rgb(217,91,67)")
      .style("opacity", 0.6)
      .style("stroke", "black")
      .style("z-index", -1)
      .style("pointer-events", "none")

    svg.selectAll(".circle3")
      .data(nRadius1)
      .join("circle")
      .attr("class", "circle3")
      .attr("cx", (d) => {
        return projection([d.Long, d.Lat])[0];
      })
      .attr("cy", d => {
        return projection([d.Long, d.Lat])[1];
      })
      .transition()
      .duration(500)
      .attr("r", d => rScale(d.Dose3))
      .style("fill", "rgb(217,91,67)")
      .style("opacity", 1)
      .style("stroke", "black")
      .style("z-index", -1)
      .style("pointer-events", "none");

    d3.select("#nRadius").property("value", nIndex);

  }
  function mouseover(event, d) {
    for (let i = 0; i < nRadius1.length; i++) {
      if (nRadius1[i].Province === d.properties.name.normalize("NFD").replace(/\p{Diacritic}/gu, "")) {
        legendText = [nRadius1[i].Dose1, nRadius1[i].Dose2, nRadius1[i].Dose3];
      }
    }
    statsBar.select("text.dose-text")
      .data(legendText)
      .transition()
      .duration(500)
      .tween("text.dose-text", function (d) {
        const i = d3.interpolateRound(+this.textContent, +d);
        return function (t) { return format(this.textContent = i(t)); };
      })
  }
  function mouseout() {
    statsBar.selectAll("text.dose-text")
      .transition()
      .duration(500)
      .tween("text.dose-text", function () {
        const i = d3.interpolateRound(this.textContent, 0);
        return function (t) { return format(this.textContent = i(t)) };
      });
  }
  svg.selectAll("path")
  
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("click", function(event,d){
      console.log('province name: ', d.properties.name);
      prov();
      d3.selectAll(".circle1")
        .classed("circleInvisible", !d3.selectAll(".circle1").classed("circleInvisible"));
      d3.selectAll(".circle2")
        .classed("circleInvisible", true);
      d3.selectAll(".circle3")
        .classed("circleInvisible", true);
      
      d3.selectAll(".wrapper path")
        .style("opacity",0.6);
    });
  
    // window.addEventListener("click", function(event) {
    //  console.log("hello");
    // });  

}))

/*-----------------------------NOTES----------------------------------*/


//USE function mouseover()... instead

// How to swap data with province for circle?

// On event listener function for prov() that also changes circle

// store data and carry it to slider update as well.