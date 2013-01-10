(function() {
	
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var CartesianChart = Class.require("benignware.visualization.CartesianChart");
	
	var _parent;

    
    /**
	 * LineChart class
	 * @class benignware.visualization.LineChart  
	 */
    
	function LineChart() {
		_parent.apply(this, arguments);
	}
	
	Class.register("benignware.visualization.LineChart", LineChart);
	
	Class.extend(CartesianChart, LineChart);
	_parent = Class.getParent(LineChart);

	
	LineChart.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
	}
	
	LineChart.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
	}
	
//	LineChart.prototype._renderLegend = function(labels) {
//		if (!labels) {
//			var labels = [];
//			var dataTable = this.getDataTable();
//			var rows = dataTable.rows;
//			var categoryKey = this.getCategoryKey();
//			for (var r = 0; r < rows.length; r++) {
//				var row = rows[r]
//				var cells = rows[r].cells;
//				for (var c = 0; c < cells.length; c++) {
//					var cell = cells[c];
//					if (cell.id == categoryKey) {
//						console.log("category cell: ", cell.value);
//						labels.push(cell.value);
//					}
//				}
//			}
//		}
//		_parent._renderLegend.call(this, labels);
//	}
	
	LineChart.prototype._renderChart = function() {
		_parent._renderChart.call(this);
		this._renderGraphs();
	}
	
	LineChart.prototype._renderGraphs = function() {
		
		// get graphs
		var dataTable = this.getDataTable();
		var categoryIndex = this.getCategoryIndex();
		
		var categoryScale = this.getCategoryScale();
		 
		if (categoryScale.min == categoryScale.max) {
			return;
		}
		
		var valueScale = this.getValueScale();
		
		var chartSize = this.getChartSize();
		var chartWidth = chartSize.width;
		var chartHeight = chartSize.height;
		
		var colors = this.getSeriesColors();
		
		var graphs = [];
		
		
		
		for (var r = 0; r < dataTable.getNumberOfRows(); r++) {

			// category values
			
			var categoryValue = r;
			if (categoryIndex != null) {
				categoryValue = dataTable.getCell(r, categoryIndex);
				if (dataTable.getColumnType(categoryIndex) == 'date') {
					categoryValue = categoryValue.getTime();
				}
				if (dataTable.getColumnType(categoryIndex) == 'string') {
					categoryValue = r;
				}
			}

			// series values

			for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {

				if (c != categoryIndex) {

					var columnId = dataTable.getColumnId(c);
					var graph = graphs[columnId] ? graphs[columnId] : graphs[columnId] = [];
					
					var value = dataTable.getCell(r, c);
					if (dataTable.getColumnType(c) == 'date') {
						value = value.getTime();
					}
					if (dataTable.getColumnType(c) == 'string') {
						value = r;
					}
					
					if (categoryValue < categoryScale.min) {
//						console.log("smaller than scale", r); 
					}
					
					// get percent by bounds
					var pc = (categoryValue - categoryScale.min) / (categoryScale.max - categoryScale.min);
					var pv = (value - valueScale.min) / (valueScale.max - valueScale.min);

					var px = pc;
					var py = pv;
					
					// upscale by chart size
					var x = Math.floor(px * chartWidth);
					var y = Math.floor(chartHeight - py * chartHeight);
					
					graph.push({x: x, y: y});
					
					i++;
				}

			}
			
		}
		

		var graphIndex = 0;
		for (var columnId in graphs) {
			
			var points = graphs[columnId];
			
			var pathElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
			this.chartLayer.appendChild(pathElem);
			
			var pathStr = "M";
			
			for (var i = 0; i < points.length; i++ ) {
				var p = points[i];
				
				if (i > 0) {
					pathStr+= "L";
				}
				
				pathStr+= p.x + " " + p.y + " ";
			}
			
			var color = colors[graphIndex];
			
			pathElem.setAttribute("d", pathStr);
			pathElem.setAttribute("stroke", color);
			pathElem.setAttribute("stroke-width", "1");
			pathElem.setAttribute("fill", "none");
			
			graphIndex++;
		}
	}
	
	return LineChart;
})();