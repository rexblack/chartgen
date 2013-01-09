(function() {
	
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var ArrayUtils = Class.require("benignware.util.ArrayUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var BaseChart = Class.require("benignware.visualization.BaseChart");
	var VisualChart = Class.require("benignware.visualization.VisualChart");
	var DataTable = Class.require("benignware.visualization.DataTable");
	
	var NumericScale = Class.require("benignware.visualization.NumericScale");
	var TimeScale = Class.require("benignware.visualization.TimeScale");
	
	var SVGUtils = Class.require("benignware.visualization.SVGUtils");
	
	var _parent;

//    CSS.setDefaultStyle(".benignware-visualization-CartesianChart .grid-line", "stroke", "#efefef");
//    CSS.setDefaultStyle(".benignware-visualization-CartesianChart .axis-label", "font-size", "12px");

    /**
	 * base class for cartesian chart
	 * @class benignware.visualization.CartesianChart  
	 */
    
	function CartesianChart() {
		
		_parent.apply(this, arguments);
		
		var _dateFormat = 'MM/dd/yyyy';
		
		this.setDateFormat = function(dateFormat) {
			_dateFormat = dateFormat;
			this.invalidate();
		}
		
		this.getDateFormat = function(dateFormat) {
			return _dateFormat;
		}
		
		var _numberFormat = '#.##';
		
		this.setNumberFormat = function(numberFormat) {
			_numberFormat = numberFormat;
			this.invalidate();
		}
		
		this.getNumberFormat = function(numberFormat) {
			return _numberFormat;
		}
		
		
		var _switchAxes = false;
		
		this.setSwitchAxes = function(bool) {
			_switchAxes = StringUtils.toBoolean(bool);
			this.invalidate();
		}
		
		this.getSwitchAxes = function(numberFormat) {
			return _switchAxes;
		}
		
	}
	
	Class.register("benignware.visualization.CartesianChart", CartesianChart);
	
	Class.extend(VisualChart, CartesianChart);
	_parent = Class.getParent(CartesianChart);
	
	CartesianChart.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
	}
	
	CartesianChart.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
		
		this.axesLayer = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'g');
		this.contentLayer.insertBefore(this.axesLayer, this.chartLayer);
		
		this.xAxisGridLayer = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'g');
		this.xAxisGridLayer.setAttribute('class', 'x-grid');
		this.axesLayer.appendChild(this.xAxisGridLayer);
		
		this.yAxisGridLayer = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'g');
		this.yAxisGridLayer.setAttribute('class', 'y-grid');
		this.axesLayer.appendChild(this.yAxisGridLayer);
		
		this.yAxisTicksLayer = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'g');
		this.yAxisTicksLayer.setAttribute('class', 'y-ticks');
		this.axesLayer.appendChild(this.yAxisTicksLayer);
		
		this.xAxisTicksLayer = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'g');
		this.yAxisTicksLayer.setAttribute('class', 'x-ticks');
		this.axesLayer.appendChild(this.xAxisTicksLayer);
	}
	
	
	function getValueBounds(dataTable, columnIndices) {
		
		var min = null;
		var max = null;
		
		for (var r = 0; r < dataTable.getNumberOfRows(); r++) {
			
			for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
				
				if (ArrayUtils.contains(columnIndices, c)) {
					
					var value = dataTable.getCell(r, c);
					
					if (dataTable.getColumnType(c) == 'date') {
						// timestamp for dates
						value = value.getTime();
					}
					
					min = min != null ? Math.min(min, value) : value;
					max = max != null ? Math.max(max, value) : value;

				}

			}
		}
		
		return {
			min: min != null ? min : 0, max: max != null ? max : dataTable.getNumberOfRows() - 1
		}
		
	}
	
	
	
	CartesianChart.prototype._render = function() {
		_parent._render.call(this);
	}
	
	CartesianChart.prototype._renderChart = function(chartWidth, chartHeight) {
		_parent._renderChart.apply(this, arguments);
		this._renderAxes();
	}
	
	
	CartesianChart.prototype.getCategoryScale = function() {
		var dataTable = this.getDataTable();
		var switchAxes = this.getSwitchAxes();
		var chartSize = this.getChartSize();
		var ticks = Math.ceil((switchAxes ? chartSize.height : chartSize.width) / 50);
		var columnIndex = this.getCategoryIndex();
		var columnType = dataTable.getColumnType(columnIndex);
		var columnBounds = getValueBounds(dataTable, [columnIndex]);
		var linear = false;
		var scale = null;
		switch (columnType) {
			case 'date': 
				scale = new TimeScale(columnBounds.min, columnBounds.max, ticks, linear);
				break;
			case 'number': 
				scale = new NumericScale(columnBounds.min, columnBounds.max, ticks, linear);
				break;
			case 'string':
				var tickItems = [];
				for (var r = 0; r < dataTable.getNumberOfRows(); r++) {
					var cell = dataTable.getCell(r, columnIndex);
					tickItems.push(r);
				}
				scale = {
					min: 0, 
					max: dataTable.getNumberOfRows(), 
					ticks: tickItems, 
					interval: 1
				}
		}
		return scale;
	}
	
	CartesianChart.prototype.getValueScale = function() {
		var dataTable = this.getDataTable();
		var switchAxes = this.getSwitchAxes();
		var chartSize = this.getChartSize();
		var ticks = Math.ceil((switchAxes ? chartSize.width : chartSize.height) / 50);
		var categoryIndex = this.getCategoryIndex();
		var valueIndex = categoryIndex != 0 ? 0 : 1;
		var valueType = dataTable.getColumnType(valueIndex);
		var valueIndices = [];
		for (var c = 0; c < dataTable.getNumberOfColumns(); c++) if (c != categoryIndex) valueIndices.push(c);
		var valueBounds = getValueBounds(dataTable, valueIndices);
		var valueScale = valueType == "date" ? new TimeScale(valueBounds.min, valueBounds.max, ticks, true) : new NumericScale(valueBounds.min, valueBounds.max, ticks, true);
		return valueScale;
	}
	
	CartesianChart.prototype._renderAxes = function(chartWidth, chartHeight) {

		var dataTable = this.getDataTable();
		
		this.axesLayer.setAttribute('transform', this.chartLayer.getAttribute('transform'));
		
		var chartSize = this.getChartSize();
		var chartWidth = chartSize.width;
		var chartHeight = chartSize.height;
		var chartMargin = this.getChartMargin();
		
		var switchAxes = this.getSwitchAxes();
		
		var colors = this.getSeriesColors();

		var categoryIndex = this.getCategoryIndex();
		var categoryType = dataTable.getColumnType(categoryIndex);
		
		console.log("CATTYPE: ", categoryIndex, categoryType);
		
		var valueIndex = categoryIndex != 0 ? 0 : 1;
		var valueType = dataTable.getColumnType(valueIndex);
		
		var valueIndices = [];
		for (var c = 0; c < dataTable.getNumberOfColumns(); c++) if (c != categoryIndex) valueIndices.push(c);
		
		var ticks = Math.min(7, dataTable.getNumberOfRows() - 1);
		
		var categoryBounds = getValueBounds(dataTable, [categoryIndex]);
//		var categoryScale = categoryType == "date" ? new TimeScale(categoryBounds.min, categoryBounds.max, ticks, false) : new NumericScale(categoryBounds.min, categoryBounds.max, ticks, false);
		categoryScale = this.getCategoryScale();
		
		var valueBounds = getValueBounds(dataTable, valueIndices);
//		var valueScale = valueType == "date" ? new TimeScale(valueBounds.min, valueBounds.max, ticks, true) : new NumericScale(valueBounds.min, valueBounds.max, ticks, true);
		
		var valueScale = this.getValueScale();
		
		var rx = switchAxes ? valueScale : categoryScale;
		var ry = switchAxes ? categoryScale : valueScale;

		
		// grid
		
		
		SVGUtils.clear(this.yAxisGridLayer);

		// vertical grid
		for (var i = 0; i < ry.ticks.length; i++) {
			var vy = ry.ticks[i];
			var py = (vy - ry.min) / (ry.max - ry.min);
			var y = Math.floor(chartHeight - py * chartHeight);
			var lineElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "line");
			this.yAxisGridLayer.appendChild(lineElem);
			lineElem.setAttribute('x1', 0);
			lineElem.setAttribute('x2', chartWidth);
			lineElem.setAttribute('y1', y);
			lineElem.setAttribute('y2', y);
			lineElem.setAttribute("stroke", "#efefef");
			lineElem.setAttribute("stroke-width", "1");
			lineElem.setAttribute("class", "grid-line horizontal-grid");
		}
		
		// vertical axis
		var lineElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "line");
		this.yAxisGridLayer.appendChild(lineElem);
		lineElem.setAttribute('x1', 0);
		lineElem.setAttribute('x2', 0);
		lineElem.setAttribute('y1', 0);
		lineElem.setAttribute('y2', chartHeight);
		lineElem.setAttribute("stroke", "#000000");
		lineElem.setAttribute("stroke-width", "1");
		lineElem.setAttribute("class", "axis-line vertical-axis");
		
		
		SVGUtils.clear(this.xAxisGridLayer);
		
		

		
		// horizontal grid
		
		for (var i = 0; i < rx.ticks.length; i++) {
			var vx = rx.ticks[i];
			var px = (vx - rx.min) / (rx.max - rx.min);
			var x = Math.floor(px * chartWidth);
			var lineElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "line");
			this.xAxisGridLayer.appendChild(lineElem);
			lineElem.setAttribute('x1', x);
			lineElem.setAttribute('x2', x);
			lineElem.setAttribute('y1', 0);
			lineElem.setAttribute('y2', chartHeight);
			lineElem.setAttribute("stroke", "#efefef");
			lineElem.setAttribute("stroke-width", "1");
			lineElem.setAttribute("class", "grid-line vertical-grid");
		}

		// horizontal axis
		var lineElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "line");
		this.xAxisGridLayer.appendChild(lineElem);
		lineElem.setAttribute('x1', 0);
		lineElem.setAttribute('x2', chartWidth);
		lineElem.setAttribute('y1', chartHeight);
		lineElem.setAttribute('y2', chartHeight);
		lineElem.setAttribute("stroke", "#000000");
		lineElem.setAttribute("stroke-width", "1");
		lineElem.setAttribute("class", "axis-line horizontal-axis");
		
	
		// ticks
		
		var labelMargin = 5;

		// vertical labels
		
		SVGUtils.clear(this.yAxisTicksLayer);
		var labelMaxWidth = chartMargin.left - labelMargin * 2;
		for (var i = 0; i < ry.ticks.length; i++) {
			
			var tickValue = ry.ticks[i];
			var pv = (tickValue - ry.min) / (ry.max - ry.min);
			var y = Math.floor(chartHeight - pv * chartHeight);
			
			// get formatted value
			var columnIndex = switchAxes ? categoryIndex : valueIndex;
			
			var label = "";
			switch (dataTable.getColumnType(columnIndex)) {
				
				case 'date': 
				case 'number': 
					var value = dataTable.getColumnType(columnIndex) == 'date' ? new Date(tickValue) : tickValue;
					var pattern = dataTable.getColumnPattern(columnIndex) || this.getDateFormat();
					label = BaseChart.getFormattedValue(value, pattern);
					break;
					
				case 'string': 
					var row = dataTable.getNumberOfRows() - 1 - tickValue;
					label = dataTable.getCell(row, columnIndex);
					break;
			}
			
			var labelText = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'text');
			this.yAxisTicksLayer.appendChild(labelText);
			labelText.setAttribute("x", -labelMargin);
			labelText.setAttribute("font-size", "10px");
			var textSize = SVGUtils.renderText(labelText, label, labelMaxWidth);
			
			labelText.setAttribute("text-anchor", "end");
			
			labelText.setAttribute("y", y - textSize.height / 2);
			
			
		}

		
		
//		if (categoryIndex != null) {
			
			
		SVGUtils.clear(this.xAxisTicksLayer);
			
			// horizontal labels
			
			var labelMaxWidth = chartWidth / rx.ticks.length - labelMargin * 2;
			var isBroken = false;
			var mustRotate = true;
			
			var labelItems = [];
			
			for (var i = 0; i < rx.ticks.length; i++) {
				
				var tickValue = rx.ticks[i];
				var pv = (tickValue - rx.min) / (rx.max - rx.min);
				var v = Math.floor(pv * chartWidth);
				
				// get formatted value
				var columnIndex = switchAxes ? valueIndex : categoryIndex;
				
				var label = "";
				switch (dataTable.getColumnType(columnIndex)) {
					
					case 'date': 
					case 'number': 
						var value = dataTable.getColumnType(columnIndex) == 'date' ? new Date(tickValue) : tickValue;
						var pattern = dataTable.getColumnPattern(columnIndex) || this.getDateFormat();
						label = BaseChart.getFormattedValue(value, pattern);
						break;
						
					case 'string': 
						label = dataTable.getCell(tickValue, columnIndex);
						break;
				}

				var labelText = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'text');
				labelText.setAttribute("font-size", "10px");
				this.xAxisTicksLayer.appendChild(labelText);
				
				labelText.setAttribute("x", v);
				var textSize = SVGUtils.renderText(labelText, label, labelMaxWidth);
				labelText.setAttribute("text-anchor", "middle");

				var y = chartHeight + labelMargin;
				
				if (labelText.getComputedTextLength() > labelMaxWidth) {
					isBroken = true;
					var em = SVGUtils.getLineHeight(labelText);
					if (textSize.height > em + 0.1) {
						mustRotate = true;
					}
				}
				
				labelText.setAttribute("y", y);
				
				labelItems.push({
					x: v, 
					y: y, 
					width: textSize.width, 
					height: textSize.height, 
					svg: labelText
				});
				
			}
//		}
		
		if (isBroken) {
			for (var i = 0; i < labelItems.length; i++) {
				var labelItem = labelItems[i];
				if (mustRotate) {
					labelItem.svg.setAttribute("text-anchor", "end");
					labelItem.svg.setAttribute('transform', "rotate(-32 " + labelItem.x + "," + labelItem.y + ")");
		
				} else {
					if (i % 2 == 0) {
						labelItem.svg.setAttribute('dx', "1em");
					}
				}
				
			}
		}
		
		
		


	}
	
	
	
	
	return CartesianChart;
})();