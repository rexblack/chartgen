(function() {

	var Class = benignware.core.Class;
	var Element = Class.require('benignware.core.Element');
	var Loader = Class.require('benignware.core.Loader');
	
	// load framework
//	new Loader().load('js/benignware/visualization-bundle-1.4.js', {
//		success: function() {
//			console.info('benignware visualization library loaded.');
//		}
//	});
	

	/*
	 * D3-Support Class
	 */
	function ChartGenBenignwareSupport() {
		this.name = 'benignware';
	}
	
	// render chart
	ChartGenBenignwareSupport.prototype.renderChart = function(element, options) {
		
		
		var LineChart = Class.require('benignware.visualization.LineChart');
		var BaseChart = Class.require('benignware.visualization.BaseChart');
		var CartesianChart = Class.require('benignware.visualization.CartesianChart');
		var ColumnChart = Class.require('benignware.visualization.ColumnChart');
		var BarChart = Class.require('benignware.visualization.BarChart');
		var PieChart = Class.require('benignware.visualization.PieChart');
		var TableChart = Class.require('benignware.visualization.TableChart');
		
		var chartObj = null;
		
		switch (options.type) {
		
			case 'line': 
				
				chartObj = Element.initialize(element, LineChart, options);
				break;
				
			case 'column': 
				
				chartObj = Element.initialize(element, ColumnChart, options);
				break;
				
			case 'bar': 
				
				chartObj = Element.initialize(element, BarChart, options);
				
				break;
				
			case 'pie': 
				
				chartObj = Element.initialize(element, PieChart, options);
				break;
				
			case 'table': 
				
				chartObj = Element.initialize(element, TableChart, options);
				break;
		
		}
		
		chartObj.setDataTable(options.dataTable);
		chartObj.setTitle(options.title);
		if (chartObj.setLegend) {
			chartObj.setLegend(options.legend);
		}
		if (chartObj.setSeriesColors) {
			chartObj.setSeriesColors(options.seriesColors);
		}
		if (chartObj.setSmooth) {
			chartObj.setSmooth(options.smooth);
		}
		
		if (!chartObj) {
			throw 'Chart-type is not supported';
		}
		
	}
	
	
	// register plugin
	window.registerProvider('benignware', new ChartGenBenignwareSupport());
	
})();

