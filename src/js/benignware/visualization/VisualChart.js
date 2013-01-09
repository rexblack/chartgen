(function() {
	
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var DataTable = Class.require("benignware.visualization.DataTable");
	var SVGUtils = Class.require("benignware.visualization.SVGUtils");
	
	var BaseChart = Class.require("benignware.visualization.BaseChart");
	
	var _parent;
    
	CSS.setDefaultStyle(".benignware-visualization-VisualChart", "width", "600px");
    CSS.setDefaultStyle(".benignware-visualization-VisualChart", "height", "400px");

    /**
	 * base class for cartesian chart
	 * @class benignware.visualization.VisualChart  
	 */
    
	function VisualChart() {
		
		_parent.apply(this, arguments);

		var _legend = 'right';
		
		this.setLegend = function(position) {
			if (position != _legend) {
				_legend = position;
				this.invalidate();
			}
		}
		
		this.getLegend = function() {
			if (_legend) {
				return _legend;
			}
			return 'none';
		}
		
	}
	
	Class.register("benignware.visualization.VisualChart", VisualChart);
	
	Class.extend(BaseChart, VisualChart);
	_parent = Class.getParent(VisualChart);

	
	VisualChart.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
	}
	
	VisualChart.prototype.contentLayer = null;
	
	VisualChart.prototype._createChildren = function() {
		
		_parent._createChildren.apply(this, arguments);
		
		var doc = this.ownerDocument;
		
		var svgElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
		svgElem.setAttribute('class', "chart-gfx");
		svgElem.setAttribute('version', "1.1");
		this.appendChild(svgElem);
		this.graphicsElem = svgElem;
		
		this.contentLayer = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
		svgElem.appendChild(this.contentLayer);
		
		this.chartLayer = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
		this.contentLayer.appendChild(this.chartLayer);
		
		this.legendLayer = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
		this.contentLayer.appendChild(this.legendLayer);
		
		this.titleLayer = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
		this.contentLayer.appendChild(this.titleLayer);
		
	}
	
	VisualChart.prototype._update = function() {
		// render
		this._render();
	}
	
	VisualChart.prototype._buildLegendItems = function() {
		var items = [];
		var categoryIndex = this.getCategoryIndex();
		var colors = this.getSeriesColors();
		var dataTable = this.getDataTable();
		var i = 0;
		for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
			if (c != categoryIndex) {
				var label = dataTable.getColumnLabel(c);
				var color = colors[i];
				items.push({
					label: label, 
					bullet: {
						type: 'rect', 
						style: {
							fill: color
						}
					}
				});
				i++;
			}
		}
		return items;
	}
	
	/**
	 * implement chart rendering here. called by the VisualChart::_render method.
	 */
	VisualChart.prototype._renderChart = function(chartWidth, chartHeight) {
	}
	
	VisualChart.prototype.getChartMargin = function() {
		return {left: 110, top: 90, bottom: 90, right: 110};
	}
	
	VisualChart.prototype.getChartSize = function() {
		var size = this.getSize();
		var margin = this.getChartMargin();
		return {
			width: size.width - margin.left - margin.right, 
			height: size.height - margin.top - margin.bottom
		}
	}
	
	VisualChart.prototype._render = function() {

		console.log('visual chart render');
		
		var dataTable = this.getDataTable();
		
		if (!dataTable || dataTable.getNumberOfRows() == 0) {
			return;
		}
		
		var svgElem = this.graphicsElem;
		
		var margin = Element.getBorderMetrics(this, 'border', 'padding');
		
		var width = Element.getWidth(this);
		var height = Element.getHeight(this);
		
		margin = this.getChartMargin();
		
		var contentX = margin.left;
		var contentY = margin.top;
		var contentWidth = width - margin.left - margin.right;
		var contentHeight = height - margin.top - margin.bottom;
		
		contentWidth = Math.max(contentWidth, 0);
		contentHeight = Math.max(contentHeight, 0);
		
		var chartMargin = this.getChartMargin();
		var chartSize = this.getChartSize();
		var chartWidth = chartSize.width;
		var chartHeight = chartSize.height;
		
		svgElem.style.position = "absolute";
		
		svgElem.setAttribute("style", "font-family: Arial; max-width: " + width + "px; width: 100%; height: auto;");
		
//		svgElem.setAttribute("width", width);
		svgElem.setAttribute("height", height);
		svgElem.setAttribute("viewBox",  "0 0 " + width + " " + height);
		svgElem.setAttribute("preserveAspectRatio", "xMinYMin meet");

		this.chartLayer.setAttribute("transform", "");
		SVGUtils.clear(this.chartLayer);
		
		// render legend

		this.legendLayer.setAttribute("transform", "");
		SVGUtils.clear(this.legendLayer);
		
		var legendPosition = this.getLegend();
		
		if (legendPosition == 'left' || legendPosition == 'right' || legendPosition == 'top' || legendPosition == 'bottom') {

			var items = this._buildLegendItems();
			var legendMargin = 10;
			
			var legendDirection = legendPosition == 'right' || legendPosition == 'left' ? 'vertical' : 'horizontal';
			
			
			var legendWidth;
			
			switch (legendPosition) {
			
				case 'right': 
					legendWidth = chartMargin.right - legendMargin * 2;
					break;
					
				case 'left': 
					legendWidth = chartMargin.left - legendMargin * 2;
					break;
					
				case 'bottom': 
					legendWidth = width - chartMargin.left - legendMargin * 2;
					break;
					
				case 'top': 
					legendWidth = width - chartMargin.left - legendMargin * 2;
					break;
			}
			
			var legendOptions = {direction: legendDirection}
			
			var legendX = 0;
			var legendY = 0;
			
			var legendSize = SVGUtils.renderList(this.legendLayer, items, legendWidth, legendOptions);
			
			switch (legendPosition) {
				
				case 'right': 
					legendX = chartMargin.left + chartWidth + legendMargin;
					legendY = chartMargin.top + legendMargin;
					break;
					
				case 'left': 
					legendX = chartMargin.left + legendMargin;
					legendY = chartMargin.top + legendMargin;
					break;
					
				case 'bottom': 
					legendX = chartMargin.left + legendMargin;
					legendY = chartMargin.top + chartHeight - legendSize.height - legendMargin;
					break;
					
				case 'top': 
					legendX = chartMargin.left;
					legendY = chartMargin.top - legendSize.height - legendMargin;
					break;
			}
			
			console.log("chart: ", legendPosition, chartX, chartY, legendSize.height);
			
			this.legendLayer.setAttribute("transform", "translate(" + legendX + ", " + legendY + ")");
			
		}
		
		
		var chartX = chartMargin.left;
		var chartY = chartMargin.top;
		
		// render title

		SVGUtils.clear(this.titleLayer);
		
		var title = this.getTitle();
		
		
		if (title != null) {
			
			var titleX = chartX;
			var titleY = (legendPosition == "top" ? legendY : chartY) - legendMargin * 2;
			this.titleLayer.setAttribute("transform", "translate(" + titleX + ", " + titleY + ")");
			
			var titleText = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "text");
			
			titleText.style.fontSize = "16px";
			titleText.style.fontWeight = "bold";
			var titleTextNode = this.ownerDocument.createTextNode(title);
			
			titleText.appendChild(titleTextNode);
			this.titleLayer.appendChild(titleText);
		}
		
		
		
		this.chartLayer.setAttribute("transform", "translate(" + chartX + ", " + chartY + ")");
		
		SVGUtils.clear(this.chartLayer);
		
		var clipPath = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "clipPath");
		clipPath.setAttribute('id', 'chart-clip');
		this.chartLayer.appendChild(clipPath);
		
		var rect = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
		rect.setAttribute("x", 0);
		rect.setAttribute("y", 0);
		rect.setAttribute("width", chartWidth);
		rect.setAttribute("height", chartHeight);
		rect.setAttribute("fill", '#afafaf');
		
		clipPath.appendChild(rect);
		
		this.chartLayer.setAttribute('clip-path', "url(#chart-clip)");
			 
		this._renderChart(chartWidth, chartHeight);

	}
	
	
	return VisualChart;
})();