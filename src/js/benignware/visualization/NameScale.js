(function() {
	
	var Class = benignware.core.Class;
	
	function NameScale(min, max, ticks, linear) {
		var result = calculateNameScale(min, max, ticks, linear);
		for (var x in result) {
			this[x] = result[x];
		}
	}
	
	Class.register('benignware.visualization.NameScale', NameScale);
	
	
	function calculateNameScale(min, max, ticks, linear) {
    	
    	console.log("calculate name scale: ", min, max, ticks, linear);
    	
    	return {
    		interval: interval, 
    		min: min, 
    		max: max, 
    		ticks: ticks
    	}
    }
	

	return NumericScale;
	
	
})();