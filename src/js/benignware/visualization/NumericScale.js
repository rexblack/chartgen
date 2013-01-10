(function() {
	
	var Class = benignware.core.Class;
	
	function NumericScale(min, max, ticks, linear) {
		var result = calculateNumericScale(min, max, ticks, linear);
		for (var x in result) {
			this[x] = result[x];
		}
	}
	
	Class.register('benignware.visualization.NumericScale', NumericScale);
	
	NumericScale.prettyNumber = function(range, round) {
		return niceNum(range, round);
	}
	
	
	function niceNum(range, round) {
		
//		console.log("nice num: ", range, round);
		
		var log10 = Math.log(range) / Math.log(10);
		
        var exponent = Math.floor(log10);
        var fraction = range / Math.pow(10, exponent);
        var niceFraction;
 
        if (round) {
                if (fraction < 1.5)
                    niceFraction = 1;
                else if (fraction < 3)
                    niceFraction = 2;
                else if (fraction < 7)
                    niceFraction = 5;
                else
                    niceFraction = 10;
        } else {
                if (fraction <= 1)
                    niceFraction = 1;
                else if (fraction <= 2)
                    niceFraction = 2;
                else if (fraction <= 5)
                    niceFraction = 5;
                else
                    niceFraction = 10;
        }
 
        return niceFraction * Math.pow(10, exponent);
    }
	
	function calculateNumericScale(min, max, ticks, linear) {
    	
    	if (min == max) {
    		
    		
    		return {
    			min: min, 
    			max: max, 
    			ticks: [], 
    			interval: 0
    		}
    	}
    	
    	
    	min = typeof min == "undefined" || isNaN(min) ? 0 : min;
    	max = typeof max == "undefined" || isNaN(max)? 1 : max;
    	ticks = typeof ticks != "number" ? 10 : ticks;
    	linear = typeof linear == "undefined" ? false : linear;

//    	min = min.toFixed(2);
//    	max = max.toFixed(2);
    	
    	var diff = Math.abs(max - min);
    	
    	var range = niceNum(diff, false);
	
    	var interval = niceNum(range / ticks, true);
    	
    	if (interval == 0) {
    		
    	}
//    	var interval = range / ticks;
    	
    	nmin = min - min % interval;
    	nmax = max - max % interval;
		
		if (isNaN(nmin) || isNaN(nmax)) {
    		return;
    	}
    	
    	if (linear) {
    		
    		if (nmin > min) {
        		nmin-= interval;
        	}
        	if (nmax < max) {
        		nmax+= interval;
        	}
        	
        	
        	
    	} else {
    		
    		if (nmin < min) {
    			nmin+= interval;
    		}
    		if (nmax < max) {
    			nmax+= interval;
    		}
    		
    	}

    	var count = (nmax - nmin) / interval;

    	if (linear && nmin + count * interval == nmax) {
    		count++;
    	}
    	
    	var tickItems = [];
    	var value = nmin;
    	
    	for (var i = 0; i < count; i++) {
    		tickItems[i] = value;
    		value+= interval;
		}
    	
    	if (linear) {
    		min = nmin;
    		max = nmax;
    	}
    	
    	return {
    		interval: interval, 
    		min: min, 
    		max: max, 
    		ticks: tickItems
    	}
    }
	

	return NumericScale;
	
	
})();