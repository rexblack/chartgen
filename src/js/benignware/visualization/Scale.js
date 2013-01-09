(function() {
	
	var Class = benignware.core.Class;
	
	function Scale(min, max, ticks, linear) {
		var result = calculateScale(min, max, ticks, linear);
		for (var x in result) {
			this[x] = result[x];
		}
	}
	
	Class.register('benignware.visualization.Scale', Scale);
	
	Scale.calculate = function(min, max, ticks, linear) {
		return new Scale(min, max, ticks, linear);
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
	
	
	function calculateScale(min, max, ticks, linear) {
		if (typeof min == 'object' && min.getTime) {
			return calculateTimeScale(min, max, ticks, linear);
		}
		return calculateNumericScale(min, max, ticks, linear);
	}
	
	function calculateNumericScale(min, max, ticks, linear) {
    	
    	console.log("calculate numeric scale: ", min, max);
    	
    	min = typeof min == "undefined" ? 0 : min;
    	max = typeof max == "undefined" ? 1 : max;
    	ticks = typeof ticks != "number" ? 10 : ticks;
    	linear = typeof linear == "undefined" ? false : linear;

//    	min = min.toFixed(2);
//    	max = max.toFixed(2);
    	
    	var diff = Math.abs(max - min);
    	
    	var range = niceNum(diff, false);
	
    	var interval = niceNum(range / ticks, true);
    	
    	nmin = min - min % interval;
    	nmax = max - max % interval;
		
    	console.log("scale: ", nmin, nmax, linear, min, max);
    	
    	if (linear) {
    		
    		if (nmin > min) {
        		nmin-= interval;
        	}
        	if (nmax < max) {
        		nmax+= interval;
        	}
        	
    	} else {
    		
    		console.log("NOT LINEAR SCALE", nmin, min);
    		
    		if (nmin < min) {
    			console.log("ADD INTERVAL", nmin, min);
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
    	
    	var ticks = [];
    	var value = nmin;
    	
    	for (var i = 0; i < count; i++) {
    		ticks[i] = value;
    		value+= interval;
		}
    	
    	if (linear) {
    		min = nmin;
    		max = nmax;
    	}

//    	console.log("calculate scale: ", min, max);
    	
    	return {
    		interval: interval, 
    		min: min, 
    		max: max, 
    		ticks: ticks
    	}
    }
	
	
	function getMonthsBetween(date1, date2) {
		var a = date1;
		var b = date2;
		 
		// Months between years.
		var months = (b.getFullYear() - a.getFullYear()) * 12;
		 
		// Months between... months.
		months += b.getMonth() - a.getMonth();
		 
		// Subtract one month if b's date is less that a's.
		if (b.getDate() < a.getDate())
		{
		    months--;
		}
		
		return months;
	}
	
    
	function calculateTimeScale(minDate, maxDate, ticks, linear) {
		
		console.log("calculate time scale: ", minDate, maxDate, ticks, linear);
		
		var months = getMonthsBetween(minDate, maxDate);
		
		var minYear = minDate.getFullYear();
		if (!linear) {
			minYear++;
		}
		var maxYear = maxDate.getFullYear();
		var yearScale = calculateNumericScale(minYear, maxYear, ticks, linear);
		
		var min = new Date("1/1/1970");
		min.setFullYear(yearScale.min);
		yearScale.min = min;
		
		var max = new Date("1/1/1970");
		max.setFullYear(yearScale.max);
		yearScale.max = max;
		
		for (var i = 0; i < yearScale.ticks.length; i++) {
			var year = yearScale.ticks[i];
			var date = new Date("1/1/1970");
			date.setFullYear(year);
			yearScale.ticks[i] = date;
		}
		
		return yearScale;
	}
    
    
	
	return Scale;
	
	
})();