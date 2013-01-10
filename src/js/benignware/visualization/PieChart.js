(function() {
	
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var VisualChart = Class.require("benignware.visualization.VisualChart");
	var DataTable = Class.require("benignware.visualization.DataTable");
	
	var _parent;

    
    /**
	 * PieChart class
	 * @class benignware.visualization.PieChart  
	 */
    
	function PieChart() {
		
		_parent.apply(this, arguments);
		
	}
	
	Class.register("benignware.visualization.PieChart", PieChart);
	
	Class.extend(VisualChart, PieChart);
	_parent = Class.getParent(PieChart);

	
	PieChart.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
	}
	
	PieChart.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
	}
	
	PieChart.prototype._buildLegendItems = function() {
		var items = [];
		var categoryIndex = this.getCategoryIndex();
		var colors = this.getSeriesColors();
		var dataTable = this.getDataTable();
		for (var r = 0; r < dataTable.getNumberOfRows(); r++) {
			var label = dataTable.getCell(r, categoryIndex);
			var color = colors[r];
			items.push({
				label: label, 
				bullet: {
					type: 'rect', 
					style: {
						fill: color
					}
				}
			});
		}
		return items;
	}
	
	PieChart.prototype._render = function() {
		
		_parent._render.call(this);

	}
	
	PieChart.prototype._renderChart = function(chartWidth, chartHeight) {
		
		var chartSize = this.getChartSize(); 
		var chartWidth = chartSize.width;
		var chartHeight = chartSize.height;
		
		var svgElem = this.chartLayer;
		
		var radius = Math.min(chartWidth, chartHeight) / 2;
		var x = chartWidth / 2;
		var y = chartHeight / 2;
		
		var circleElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "circle");
		circleElem.setAttribute("cx", x);
		circleElem.setAttribute("cy", y);
		circleElem.setAttribute("r", radius);
		circleElem.setAttribute("fill", "#afafaf");
		svgElem.appendChild(circleElem);

		var categoryIndex = this.getCategoryIndex();

		var total = 0;
		var min = null;
		var max = null;
		var values = [];
		var dataTable = this.getDataTable();
		for (var r = 0; r < dataTable.getNumberOfRows(); r++) {
			
			for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
				
				var cell = dataTable.getCell(r, c);
				var value = parseFloat(cell);
				if (c != categoryIndex) {
					min = min != null ? Math.min(min, value) : value;
					max = max != null ? Math.max(max, value) : value;
					total+= value;
					values.push(value);
				}
			}
		}
		
		var colors = this.getSeriesColors();
		var lx = x, ly = y - radius;
		var value = 0;
		var labelPoints = [];
		var labelRadius = radius * 0.75; 
		var angle = 0;
		for (var i = 0; i < values.length; i++) {
			// render section
			value+= values[i];
			var p = value / total;
			var radians = p * Math.PI * 2;
			var vx = x + Math.sin(radians) * radius;
			var vy = y - Math.cos(radians) * radius;
			var pathElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
			var pathString = "M" + x + " " + y + " L" + lx + " " + ly + " A" + radius + "," + radius + " 0 0,1 " + vx + "," + vy + " Z";
			pathElem.setAttribute("d", pathString);
			var color = colors[i] || 'black';
			pathElem.setAttribute('style', "fill-opacity: 1;");
			pathElem.setAttribute("stroke", 'white');
			pathElem.setAttribute("stroke-width", '2');
			pathElem.setAttribute("fill", color);
			svgElem.appendChild(pathElem);
			lx = vx;
			ly = vy;
			// render label
			var a = angle + (radians - angle) / 2;
			var ax = x + Math.sin(a) * labelRadius;
			var ay = y - Math.cos(a) * labelRadius;
			angle = radians;
			var textElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "text");
			var color = colors[i] || 'black';
//			textElem.setAttribute('fill', "black");
			textElem.setAttribute('x', ax);
			textElem.setAttribute("y", ay);
			textElem.setAttribute("text-anchor", "middle");
			var labelText = (values[i] / total * 100).toFixed(1);
			var labelTextNode = this.ownerDocument.createTextNode(labelText);
			textElem.appendChild(labelTextNode);
			svgElem.appendChild(textElem);
		}	
		
	}
	
	
	return PieChart;
})();