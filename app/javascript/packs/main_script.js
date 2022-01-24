import * as d3 from "d3"

const parseTime = d3.timeParse("%Y-%m-%d");
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

        // load TopoJSON file of Canada
        d3.json("/canadaprovtopo.json", function(error, canada) {
          if (error) throw error;

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
                .datum(topojson.mesh(canada, canada.objects.canadaprov, function(a, b) { return a !== b; }))
                .attr("class", "map_mesh")
                .attr("d", path);
          
          console.log(provinces.features);

        });
        d3.csv("/prov_loc.csv", function(data) {
            console.log(data);
            svg.selectAll("circle")
	        .data(data)
	        .enter()
	        .append("circle")
	        .attr("cx", function(d) {
		        return projection([d.long, d.lat])[0];
                
	        })
	        .attr("cy", function(d) {
		        return projection([d.long, d.lat])[1];
	        })
	        .attr("r", function(d) {
		        return 20;
	        })
		    .style("fill", "rgb(217,91,67)")	
		    .style("opacity", 0.85)	
            
        });
        d3.csv('/vaccinations.csv', function(d){
            
            
            return{
                province: d.prename,
                doseTotal: +d.numtotal_all_administered,
                dose1: +d.numtotal_dose1_administered,
                dose2: +d.numtotal_dose2_administered,
                dose3: +d.numtotal_dose3_administered
                //date: parseTime(d.report_date)
            }
            
        });
        function mouseover(d) {     
          mapLabel.text(d.properties.name.slice(0,-5)) // remove suffix id from name
        }

        function mouseout(d) {     
          mapLabel.text("")  // remove out name
        }

        function clicked(d) {
          console.log(d.id, d.properties.name) // verify everything looks good
          // Add code here
        }
