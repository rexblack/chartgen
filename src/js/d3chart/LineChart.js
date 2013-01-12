var d3chart = new Object();

(function() {
	
	 d3chart.LineChart = function(element, options) {
		
		// data table
		var _dataTable = null;
		
		this.setDataTable = function(dataTable) {
			if (dataTable.columns && dataTable.rows) {
				dataTable = new DataTable(dataTable);
			}
			_dataTable = dataTable;
		}
		
		this.getDataTable = function() {
			return _dataTable || new DataTable();
		}

		// title
		var _title = null;
		
		this.setTitle = function(title) {
			if (title != _title) {
				_title = title;
			}
			
		}
		
		this.getTitle = function() {
			if (_title) {
				return _title;
			}
			return null;
		}
		
		// curve-style
		var _curve = null;
		
		this.setCurve = function(curve) {
			if (curve != _curve) {
				_curve = curve;
			}
			
		}
		
		this.getCurve = function() {
			if (_curve) {
				return _curve;
			}
			return null;
		}
		
	 }
	
	 d3chart.LineChart.prototype._renderChart = function() {
			
			var dataTable = this.getDataTable();
			
			var data = [];
			var colIds = [];
			var colLabels = [];
			for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
				console.log("Column: " + dataTable.getColumnLabel(c));
				colIds[c] = "col"+c;
				colLabels[c] = dataTable.getColumnLabel(c);
			}
				
			for (var r = 0; r < dataTable.getNumberOfRows(); r++) {
				data[r] = new Object();
				for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
					// evil eval
					eval("data[r]." + colIds[c] + "=dataTable.getCell(r, c);");
				}
			}
			
			var numberFormat = d3.format(".0f");
			
			var basicWidth = $("#chart-form").width();
			var basicHeight = $("#chart-form").height();
			
			var margin = {top: 30, right: 20, bottom: 30, left: 50},
			    width = basicWidth - margin.left - margin.right,
			    height = basicHeight - margin.top - margin.bottom;
			
			
			var x = null;
			switch (dataTable.getColumnType(0)) {
				case 'number':
					x = d3.scale.linear()
						.range([0,width]);
					break;
				case 'date': 
					x = d3.time.scale()
					    .range([0, width]);
					break;
				}
			
			var y = null;
			switch (dataTable.getColumnType(1)) {
				case 'number':
					y = d3.scale.linear()
						.range([height, 0]);
					break;
				case 'date': 
					y = d3.time.scale()
					    .range([height, 0]);
					break;
			}
			
			var xAxis = d3.svg.axis()
			    .scale(x)
			    .orient("bottom")
			    .tickFormat(numberFormat)
			    ;
			
			var yAxis = d3.svg.axis()
			    .scale(y)
			    .orient("left");
			
			var line = line = d3.svg.line()
			    .x(function(d) { return x(d.col0); })
			    .y(function(d) { return y(d.col1); })
			    ;
			var curve = null;
			switch (this.getCurve()) {
				case ('linear'):
					// line only
					break;
				case ('approx'):
					curve = d3.svg.line()
					    .x(function(d) { return x(d.col0); })
					    .y(function(d) { return y(d.col1); })
					    .interpolate("basis")
					    ;
					break;
				case ('inter'):
					curve= d3.svg.line()
				    .x(function(d) { return x(d.col0); })
				    .y(function(d) { return y(d.col1); })
				    .interpolate("cardinal")
				    ;
					break;
			}
			
			
			x.domain(d3.extent(data, function(d) { return d.col0; }));
			// extend domain of y-axis by 10 % of range at both ends
			var extentY = d3.extent(data, function(d) { return d.col1; });
			var rangeY = extentY[1] - extentY[0];
			extentY[0] = extentY[0] - 0.1 * rangeY;
			extentY[1] = extentY[1] + 0.1 * rangeY;
			y.domain(extentY);
			
			// DRAW SVG
			
			var svg = d3.select("#chart-preview").append("svg")
		    .attr("width", width + margin.left + margin.right)
		    .attr("height", height + margin.top + margin.bottom)
		    .append("g")
		    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
			// x-axis
			svg.append("g")
			  .attr("class", "x axis")
			  .attr("transform", "translate(0," + height + ")")
			  .call(xAxis)
			  .style("shape-rendering", "crispEdges")
			  
			  .append("text")
				  .attr("x", width)
				  .attr("dy", "-.71em")
				  .style("text-anchor", "end")
				  .text(colLabels[0]);
			
			// y-axis
			svg.append("g")
			  .attr("class", "y axis")
			  .call(yAxis)
			  .style("shape-rendering", "crispEdges")
			
			  .append("text")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 6)
				  .attr("dy", ".71em")
				  .style("text-anchor", "end")
				  .text(colLabels[1]);
			
			svg.selectAll("path")
			.style("fill", "none")
			.style("stroke", "#000");
			
			// curve
			if (this.getCurve() == "linear") {
				// line
				svg.append("path")
				  .datum(data)
				  .attr("class", "line")
				  .attr("d", line)
				  .style("stroke", "steelblue")
				  .style("fill", "none")
				  .style("stroke-width", "2")
				  ;
			} else {
				// line in grey
				// line
				svg.append("path")
				  .datum(data)
				  .attr("class", "line")
				  .attr("d", line)
				  .style("stroke", "grey")
				  .style("fill", "none")
				  .style("stroke-width", "1")
				  ;
				// curve
				svg.append("path")
				  .datum(data)
				  .attr("class", "line")
				  .attr("d", curve)
				  .style("stroke", "steelblue")
				  .style("fill", "none")
				  .style("stroke-width", "2")
				  ;
			}
		
			
			  
	 }
		
	
	return d3chart.LineChart;	
}());