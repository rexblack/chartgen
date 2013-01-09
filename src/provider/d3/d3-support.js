(function() {

	
	/*
	 * D3-LineChart
	 */
	
	function LineChart(element, options) {
		this.element = element; 
		this.options = options;
	}
	
	
	LineChart.prototype.render = function() {
//		console.log('render d3 line-chart', this.element, this.options);
			
		var element = this.element;
		element.style.width = this.options.width + "px";
		element.style.height = this.options.height + "px";
		// example implementation
		var doc = element.ownerDocument;
		var title = doc.createElement('h3');
		title.innerHTML = this.options.title;
		element.appendChild(title);
	}
	
	
	
	
	
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
				chartObj = new LineChart(element, options);
				break;
		
		}
		
		if (chartObj) {
			chartObj.render();
		}
		
	}
	
	
	// register plugin
	window.registerProvider('d3', new ChartGenD3Support());
	
})();

