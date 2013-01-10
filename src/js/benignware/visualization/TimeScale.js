(function() {
	
	var Class = benignware.core.Class;
	var NumericScale = Class.require('benignware.visualization.NumericScale');
	
	function TimeScale(min, max, ticks, linear) {
		var result = calculateTimeScale(min, max, ticks, linear);
		for (var x in result) {
			this[x] = result[x];
		}
	}
	
	Class.register('benignware.visualization.TimeScale', TimeScale);
	
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
	
	function daysInMonth(month,year) {
	    return new Date(year, month, 0).getDate();
	}
    
	function calculateTimeScale(minTime, maxTime, ticks, linear) {

		var minDate = new Date(minTime);
		var maxDate = new Date(maxTime);

		var monthsBetween = getMonthsBetween(minDate, maxDate);
		
		var minYear = minDate.getFullYear();
		if (!linear) {
			minYear++;
		}
		var maxYear = maxDate.getFullYear();
		var yearScale = new NumericScale(minYear, maxYear, ticks, linear);
		
		var min = new Date("1/1/1970");
		min.setFullYear(yearScale.min);
		yearScale.min = min.getTime();
		
		var max = new Date("1/1/1970");
		max.setFullYear(yearScale.max);
		yearScale.max = max.getTime();
		
		for (var i = 0; i < yearScale.ticks.length; i++) {
			var decYear = yearScale.ticks[i];
			var intYear = Math.floor(decYear);
			var decMonth = (decYear - intYear) * 12;
			var intMonth = Math.floor(decMonth);
			var decDay = (decMonth - intMonth) * daysInMonth(intMonth, intYear);
			var intDay = Math.floor(decDay);
			
			var date = new Date("1/1/1970");
			date.setFullYear(intYear);
			date.setMonth(intMonth);
			date.setDate(intDay + 1);
			
			yearScale.ticks[i] = date.getTime();
		}
		
		return yearScale;
	}
    
    
	
	return TimeScale;
	
	
})();