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
		
		
		
		var chartObj = null;
		
		switch (options.type) {
		
			case 'line':
				
				if (options.smooth && options.smooth != 'none') {
					
					if (options.smooth == 'approximation') {
						chartObj = new d3chart.LineChart(element, options);
						chartObj.setCurve("approx");
					} else if (options.smooth == 'interpolation') {
						chartObj = new d3chart.LineChart(element, options);
						chartObj.setCurve("inter");
					}
					
				} else {
					console.log("line-chart: ", element, options); 
					chartObj = new d3chart.LineChart(element, options);
					chartObj.setCurve("linear");
				}
				
				break;
		
		}
		
		
		if (!chartObj) {
			throw 'Chart-type is not supported';
			return;
		}
		
		chartObj.setDataTable(options.dataTable);
		chartObj.setTitle(options.title);
		if (chartObj.setLegend) {
			chartObj.setLegend(options.legend);
		}
		if (chartObj.setSeriesColors) {
			chartObj.setSeriesColors(options.seriesColors);
		}
		chartObj._renderChart();
	
	}
	
	// register plugin
	window.registerProvider('d3', new ChartGenD3Support());
	
})();

