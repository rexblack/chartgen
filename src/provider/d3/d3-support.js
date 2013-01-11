(function() {

	var Class = benignware.core.Class;
	var Element = Class.require('benignware.core.Element');
	var Loader = Class.require('benignware.core.Loader');
	
	/*
	 * D3-Support Class
	 */
	function ChartGenD3Support() {
		this.name = 'D3';
	}
	
	// render chart
	ChartGenD3Support.prototype.renderChart = function(element, options) {
		
		console.log("call d3 support: ", element, options); 
		
		var chartObj = null;
		
		switch (options.type) {
		
			case 'line': 
				chartObj = new d3chart.LineChart(element, options);
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
		
		if (!chartObj) {
			throw 'Chart-type is not supported';
		}
		
		if (chartObj) {
			chartObj._renderChart();
		}
	}
	
	// register plugin
	window.registerProvider('d3', new ChartGenD3Support());
	
})();

