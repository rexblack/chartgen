(function() {
	
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var ColumnChart = Class.require("benignware.visualization.ColumnChart");
	
	var _parent;

    
    /**
	 * BarChart class
	 * @class benignware.visualization.BarChart  
	 */
    
	function BarChart() {
		_parent.apply(this, arguments);
		this.setSwitchAxes(true);
	}
	
	Class.register("benignware.visualization.BarChart", BarChart);
	
	Class.extend(ColumnChart, BarChart);
	_parent = Class.getParent(BarChart);

	BarChart.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
	}
	
	BarChart.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
	}
	
	
	BarChart.prototype._render = function() {
		_parent._render.call(this);
	}
	
	BarChart.prototype._renderChart = function(chartWidth, chartHeight) {
		_parent._renderChart.apply(this, arguments);
	}

	return BarChart;
})();