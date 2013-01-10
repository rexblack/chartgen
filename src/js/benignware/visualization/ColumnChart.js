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
	 * ColumnChart class
	 * @class benignware.visualization.ColumnChart  
	 */
    
	function ColumnChart() {
		_parent.apply(this, arguments);
	}
	
	Class.register("benignware.visualization.ColumnChart", ColumnChart);
	
	Class.extend(CartesianChart, ColumnChart);
	_parent = Class.getParent(ColumnChart);

	ColumnChart.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
	}
	
	ColumnChart.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
	}
	
	
	ColumnChart.prototype._render = function() {
		_parent._render.call(this);
	}
	
	ColumnChart.prototype._renderChart = function(chartWidth, chartHeight) {
		_parent._renderChart.apply(this, arguments);
		this._renderColumns();
	}
	
	ColumnChart.prototype._renderColumns = function() {
		
		// get graphs
		var dataTable = this.getDataTable();
		var categoryIndex = this.getCategoryIndex();
		
		var categoryScale = this.getCategoryScale();
		var valueScale = this.getValueScale();
		
		var chartSize = this.getChartSize();
		var chartWidth = chartSize.width;
		var chartHeight = chartSize.height;
		
		var colors = this.getSeriesColors();
		var switchAxes = this.getSwitchAxes();
		
		var seriesNum = this.setSeriesColumnIndices().length;
		
		var csw = categoryScale.interval / (categoryScale.max - categoryScale.min);
		var cw = csw / seriesNum / 2;
		
		
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
			var i = 0;
			for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
				
				if (c != categoryIndex) {

					var columnId = dataTable.getColumnId(c);
					
					var value = dataTable.getCell(r, c);
					if (dataTable.getColumnType(c) == 'date') {
						value = value.getTime();
					}

					// get percent by bounds
					var pc = (categoryValue - categoryScale.min) / (categoryScale.max - categoryScale.min);
					var pv = (value - valueScale.min) / (valueScale.max - valueScale.min);

					var pc = pc + (csw - seriesNum * cw) / 2 + i * cw;
					
					var px = switchAxes ? pv : pc;
					var py = switchAxes ? pc : pv;
					
					// upscale by chart size
					
					
					var x, y, w, h;
					
					if (switchAxes) {
						
						x = 0;
						y = Math.floor(py * chartHeight);
						
						w = px * chartWidth;
						h = cw * chartHeight;
						
					} else {
						x = Math.floor(px * chartWidth);
						y = Math.floor(chartHeight - py * chartHeight);

						w = cw * chartWidth;
						h = chartHeight - y;
					}

					var rect = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
					rect.setAttribute('x', x);
					rect.setAttribute('y', y);
					rect.setAttribute('width', w);
					rect.setAttribute('height', h);
					rect.setAttribute('fill', colors[i]);
					
					
					this.chartLayer.appendChild(rect);
					
					i++;
				}
				
			}
			
		}
		
		
		if (switchAxes) {
			this.yAxisTicksLayer.setAttribute('transform', 'translate(0,-' + csw / 2 * chartHeight + ')');
		} else {
			this.xAxisTicksLayer.setAttribute('transform', 'translate(' + csw / 2 * chartWidth + ',0)');
		}
		
		
	}
	
	return ColumnChart;
})();