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
	
	var _parent;
	
	


    CSS.setDefaultStyle(".benignware-visualization-BaseChart .chart-color-0", "color", "blue");
    CSS.setDefaultStyle(".benignware-visualization-BaseChart .chart-color-1", "color", "red");
    CSS.setDefaultStyle(".benignware-visualization-BaseChart .chart-color-2", "color", "orange");
    CSS.setDefaultStyle(".benignware-visualization-BaseChart .chart-color-3", "color", "green");
    CSS.setDefaultStyle(".benignware-visualization-BaseChart .chart-color-4", "color", "violet");
    CSS.setDefaultStyle(".benignware-visualization-BaseChart .chart-color-5", "color", "yellow");
    CSS.setDefaultStyle(".benignware-visualization-BaseChart .chart-color-6", "color", "cyan");
    CSS.setDefaultStyle(".benignware-visualization-BaseChart .chart-color-7", "color", "brown");
    CSS.setDefaultStyle(".benignware-visualization-BaseChart .chart-color-8", "color", "gray");
    
    /**
	 * base class for cartesian chart
	 * @class benignware.visualization.BaseChart  
	 */
    
	function BaseChart() {
		
		_parent.apply(this, arguments);
		
		// data table
		
		var _dataTable = null;
		
		this.setDataTable = function(dataTable) {
			if (dataTable.columns && dataTable.rows) {
				dataTable = new DataTable(dataTable);
			}
			_dataTable = dataTable;
			this.invalidate();
		}
		
		this.getDataTable = function() {
			return _dataTable || new DataTable();
		}

		// title
		var _title = null;
		
		this.setTitle = function(title) {
			if (title != _title) {
				_title = title;
				this.invalidate();
			}
			
		}
		
		this.getTitle = function() {
			if (_title) {
				return _title;
			}
			return null;
		}
		
		// category key
		
		var _categoryIndex = undefined;
		
		this.setCategoryIndex = function(categoryIndex) {
			_categoryIndex = categoryIndex;
			this.invalidate();
		}
		
		this.getCategoryIndex = function() {
			if (typeof _categoryIndex != 'undefined') {
				return _categoryIndex;
			}
			return 0;
		}
		
		// colors
		
		var _seriesColors = null;
		var _cssSeriesColors = null;
		
		this.setSeriesColors = function(colors) {
//			if (typeof colors == "string") {
//				
//			}
			_chartColors = colors;
			this.invalidate();
		}
		
		this.setSeriesColumnIndices = function() {
			var dataTable = this.getDataTable();
			var categoryIndex = this.getCategoryIndex();
			var result = [];
			if (dataTable) {
				for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
					if (c != categoryIndex) {
						result.push(c);
					}
				}
			}
			return result;
		}
		
		
		this.getSeriesColors = function(colors) {
			var chartElem = this;
			
			return _seriesColors || (function() {
				if (_cssSeriesColors) {
					return _cssSeriesColors;
				}
				
				_cssSeriesColors = [];
				var divElem = chartElem.ownerDocument.createElement('div');
				divElem.className = "chart-color-0";
				chartElem.appendChild(divElem);
				var color = null;
				var index = 0;
				while (color = Element.getComputedStyle(divElem, 'color')) {
					_cssSeriesColors.push(color);
					index++;
					divElem.className = "chart-color-" + index;
					if (index > 12) {
						break;
					}
				}
				chartElem.removeChild(divElem);
				return _cssSeriesColors;
			})() || [];
			chartElem.invalidate();
		}
	}
	
	Class.register("benignware.visualization.BaseChart", BaseChart);
	
	Class.extend(Component, BaseChart);
	_parent = Class.getParent(BaseChart);

	BaseChart.getFormattedValue = function(value, pattern) {
		switch (typeof value) {
			case 'number':
				return StringUtils.formatNumber(value, pattern);
				
			case 'date':
			case 'object':
				if (typeof value == 'number') {
					value = new Date(value);
				}
				return StringUtils.formatDate(value, pattern);
		}
		return value;
	}
	
	BaseChart.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
	}
	
	BaseChart.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
	}
	
	BaseChart.prototype._update = function() {
		// render
		this._render();
	}
	
	BaseChart.prototype._render = function() {
	}
	
	
	return BaseChart;
})();