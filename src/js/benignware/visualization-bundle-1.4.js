(function() {
	
	
	var Class = benignware.core.Class;
	
	/**
	 * Data abstraction layer
	 * @class benignware.visualization.DataTable
	 */
	function DataTable(data) {
		
		var columns = data && data.columns ? data.columns : [];
		var rows = data && data.rows ? data.rows : [];
		
		/**
		 * @privileged
		 * @method addColumn
		 * @param {String} type the column's data type
		 * @param {String} label the column label
		 * @param {String} pattern the column's format pattern 
		 */
		this.addColumn = function(type, label, pattern) {
			columns.push({
				type: type, 
				label: label, 
				pattern: pattern
			});
		}
		
		/**
		 * returns an alphabetical column id based on the column index.
		 * @privileged
		 * @method getColumnId
		 * @param {Number} columnIndex the column index
		 * @return {String} the column id  
		 */
		this.getColumnId = function(columnIndex) {
			return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(columnIndex);
		}
		
		
		/**
		 * sets the label on column with the specified index.
		 * @privileged
		 * @method setColumnLabel
		 * @param {Number} columnIndex the column index
		 * @param {String} label the column label
		 */
		this.setColumnLabel = function(columnIndex, label) {
			if (columns[columnIndex]) {
				columns[columnIndex].label = label;
			}
		}
		
		/**
		 * returns the label for the specified column index.
		 * @privileged
		 * @method getColumnLabel
		 * @param {Number} columnIndex
		 * @return {String} the column label
		 */
		this.getColumnLabel = function(columnIndex) {
			return columns[columnIndex] && columns[columnIndex].label ? columns[columnIndex].label : "";
			//this.getColumnId(columnIndex);
		}
		
		/**
		 * returns the type for the specified column index.
		 * @privileged
		 * @method getColumnType
		 * @param {Number} columnIndex
		 * @return {String} the column type
		 */
		this.getColumnType = function(columnIndex) {
			return columns[columnIndex] && columns[columnIndex].type ? columns[columnIndex].type : null;
		}
		
		/**
		 * returns the pattern for the specified column index.
		 * @privileged
		 * @return {String} the column pattern
		 */
		this.getColumnPattern = function(columnIndex) {
			return columns[columnIndex] && columns[columnIndex].pattern ? columns[columnIndex].pattern : null;
		}
		
		/**
		 * adds a row of values to the table
		 * @privileged
		 * @method addRow
		 * @param {Array} values
		 */
		this.addRow = function(values) {
			var rowIndex = rows.length;
			for (var c = 0; c < values.length; c++) {
				this.setCell(rowIndex, c, values[c]);
			}
		}
		
		/**
		 * returns the value of the cell with specified row and column index.
		 * @privileged
		 * @method getCell
		 * @param {Number} rowIndex
		 * @param {Number} columnIndex
		 * @return {Object} value 
		 */
		this.getCell = function(rowIndex, columnIndex) {
			return rows[rowIndex][columnIndex];
		}
		
		/**
		 * sets the value of the cell with the specified row and column index.
		 * @privileged
		 * @method setCell
		 * @param {Number} rowIndex
		 * @param {Number} columnIndex
		 * @param {Object} value
		 */
		this.setCell = function(rowIndex, columnIndex, value) {
			// row
			row = rows[rowIndex]; 
			if (!row) row = rows[rowIndex] = [];
			// cell
			row[columnIndex] = value;
		}
		
		/**
		 * returns the number of columns of the data table.
		 * @privileged
		 * @method getNumberOfColumns
		 * @return {Number} the number of columns
		 */
		this.getNumberOfColumns = function() {
			return columns.length;
		}
		
		/**
		 * returns the number of rows of the data table.
		 * @privileged
		 * @method getNumberOfRows
		 * @return {Number} the number of rows
		 */
		this.getNumberOfRows = function() {
			return rows.length;
		}
		
		/**
		 * returns an object with columns and rows.
		 * @privileged
		 * @method toJSON
		 * @return {Object} an object containing columns and rows
		 */
		this.toJSON = function() {
			return {
				columns: columns, 
				rows: rows
			}
		}
		
	}
	
	
	Class.register('benignware.visualization.DataTable', DataTable);
	
	//
	return DataTable;
	
})();
(function() {
	
	var Class = benignware.core.Class;
	
	/**
	 * calculates a numerical scale.
	 * @class benignware.visualization.NumericScale
	 */
	
	/**
	 * @constructor
	 * @param {Number} min the minimum value
	 * @param {Number} max the maximum value
	 * @param {Number} ticks the amount of desired ticks
	 * @param {Boolean} linear determines if the scale should contain all values or may be cut off.
	 * @return {benignware.visualization.NumericScale} the scale object
	 */
	function NumericScale(min, max, ticks, linear) {
		var result = calculateNumericScale(min, max, ticks, linear);
		for (var x in result) {
			this[x] = result[x];
		}
	}
	
	Class.register('benignware.visualization.NumericScale', NumericScale);
	
	/**
	 * returns a nice number for the specified range
	 * @static
	 * @method prettyNumber
	 * @param {Number} the range of the number
	 * @param {Boolean} round specifies if the number should be rounded.
	 * @return {Number} a nice number
	 */
	NumericScale.prettyNumber = function(range, round) {
		return niceNum(range, round);
	}
	
	/**
	 * the calculated min value
	 * @property min
	 * @return {Number} the min value
	 */
	NumericScale.prototype.min;
	
	/**
	 * the calculated max value
	 * @property max
	 * @return {Number} the max value
	 */
	NumericScale.prototype.max;
	
	/**
	 * the calculated interval
	 * @property interval
	 * @return {Number} the scale interval
	 */
	NumericScale.prototype.interval;
	
	/**
	 * the calculated tick values
	 * @property tickItems
	 * @return {Array} an array containing tick values
	 */
	NumericScale.prototype.tickItems;
	
	
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
(function() {
	
	var Class = benignware.core.Class;
	var NumericScale = Class.require('benignware.visualization.NumericScale');
	
	/**
	 * calculates a time-based scale
	 * @class benignware.visualization.TimeScale
	 * @extends benignware.visualization.NumericScale
	 */
	
	/**
	 * calculates a time-based scale
	 * @constructor
	 * @param {Number} min the minimum value
	 * @param {Number} max the maximum value
	 * @param {Number} ticks the amount of desired ticks
	 * @param {Boolean} linear determines if the scale should contain all values or may be cut off.
	 * @return {benignware.visualization.TimeScale} the scale object
	 */
	
	function TimeScale(min, max, ticks, linear) {
		var result = calculateTimeScale(min, max, ticks, linear);
		for (var x in result) {
			this[x] = result[x];
		}
	}
	
	Class.extend(NumericScale, TimeScale);
	
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
(function() {
	
	var Class = benignware.core.Class;

	/**
	 * SVG utility functions
	 * @class benignware.visualization.SVGUtils
	 */
	function SVGUtils() {
				
	}
	
	Class.register('benignware.visualization.SVGUtils', SVGUtils);
			
	/**
	 * @field SVG_NAMESPACE
	 * @return {String} http://www.w3.org/2000/svg
	 */
	SVGUtils.SVG_NAMESPACE = "http://www.w3.org/2000/svg";
	
	/**
	 * creates an svg canvas
	 * @static
	 * @method create
	 * @param {Document} doc the document, where the node should be created on
	 * @param {Object} attributes an object containing keys and values
	 */
	SVGUtils.create = function(doc, attributes) {
		var svg = doc.createElementNS(SVGUtils.SVG_NAMESPACE, "svg");
		svg.setAttribute('version', "1.1");
		for (var x in attributes) svg.setAttribute(x, attributes[x]);
		return svg;
	}
	
	/**
	 * creates an svg element
	 * @static
	 * @method createElement
	 * @param {Document} doc the document, where the node should be created on
	 * @param {String} tagName the element's type
	 * @param {Object} attributes an object containing keys and values
	 */
	SVGUtils.createElement = function(doc, tagName, attributes) {
		var elem = doc.createElementNS(SVGUtils.SVG_NAMESPACE, tagName);
		for (var x in attributes) elem.setAttribute(x, attributes[x]);
		return elem;
	}
	
	
	/**
	 * removes all childnodes from the specified svg element.
	 * @static
	 * @method clear
	 * @param {Element} svg the element that should be cleared
	 */
	SVGUtils.clear = function(svg) {
		var svgChildren = svg.childNodes;
		for (var i = 0; i < svgChildren.length; i++) {
			svg.removeChild(svgChildren[i]);
			i--;
		}
	}
	
	/**
	 * measures the line height on the specified svg text element
	 * @static
	 * @method getLineHeight
	 * @param {Element} svg the element
	 */
	SVGUtils.getLineHeight = function(svg) {
		var test = svg.ownerDocument.createTextNode("A");
		svg.appendChild(test);
		var bbox = SVGUtils.getBBox(svg);
		var em = bbox.height;
		svg.removeChild(test);
		return em;
	}
	
	/**
	 * renders lines of text to an svg text elements. 
	 * @param {Element} svg the svg text element
	 * @param {String} string the text that should be rendered
	 * @param {Number} width the width to wrap at
	 * @return {Object} an object containing size dimensions
	 */
	SVGUtils.renderText = function(svg, string, width) {
		
		if (typeof string != 'string') return string;
		
		var doc = svg.ownerDocument;
		
		var textNode = doc.createTextNode("");
		svg.appendChild(textNode);
		
		// wrap lines
		var lines = [];
		var line = [];
		var length = 0;
		var words = string.split(/\s+/);
		
		while(words.length) {
			var word = words[0];
			svg.firstChild.data = line.join(' ') + ' ' + word;
			length = svg.getComputedTextLength();

			if (width > 0 && length > width) {
				
				if (!words.length) {
					line.push(words[0]);
				}
				
				if (line.length == 0) {
					lines.push(words.shift());
				} else {
					lines.push(line.join(' '));
				}
				line = [];
			} else {
				var w = words.shift();
				line.push(w);
			}
			if (words.length == 0 && line.length) {
				lines.push(line.join(' '));
			}
			
		}
		svg.removeChild(textNode);
		
		// layout
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			var tspan = doc.createElementNS(SVGUtils.SVG_NAMESPACE, 'tspan');
			tspan.appendChild(doc.createTextNode(line));
			tspan.setAttribute("x", svg.getAttribute("x"));
			tspan.setAttribute("dy", "1em");
			svg.appendChild(tspan);
		}
		var bbox = SVGUtils.getBBox(svg);
		return {
			width: bbox.width, 
			height: bbox.height
		}
	}
	
	
	/**
	 * returns the bounding box of an svg text element.  
	 * @static
	 * @method getBBox
	 * @param {Element} svg the svg text element
	 */
	SVGUtils.getBBox = function(svg) {
		try {
			return svg.getBBox();
		} catch (e) {
			return {x: 0, y: 0, width: 0, height: 0}
		}
	}
	
	/**
	 * renders a list with colored bullets and labels. set options.direction = 'horizontal' to create an horizontal list. defaults to vertical.
	 * @static
	 * @method renderList
	 * @param {Element} svg the svg-layer
	 * @param {Array} items an array containing labels and style options
	 * @param {Number} width the desired width of the list
	 * @param {Object} options an object containing options. 
	 */
	SVGUtils.renderList = function(svg, items, width, options) {
		
		options = options || {};
		
		var optionsBullet = options.bullet || {};
		var optionsBulletStyle = optionsBullet || {};
		
		var doc = svg.ownerDocument;
		// var direction = "vertical";
		var direction = options.direction || 'vertical';
		var x = 0;
		var y = 0;
		var w = 0;
		var h = 0;
		
		for (var i = 0; i < items.length; i++) {
			
			var item = items[i];
			var text = doc.createElementNS(SVGUtils.SVG_NAMESPACE, 'text');
			text.setAttribute("font-size", "13px");
			svg.appendChild(text);
			
			var bulletType = item.bullet && item.bullet.type ? item.bullet.type : optionsBullet.type || 'rect';
			if (bulletType != 'none') {
				var bullet = svg.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, bulletType);
				svg.appendChild(bullet);
			}
			
			// measure em
			var em = SVGUtils.getLineHeight(text);
			
			var bulletSize = em / 2;
			
			text.setAttribute("x", x + bulletSize + 5);
			text.setAttribute("y", y - 4);
			
			// text.setAttribute("alignment-baseline", 'baseline');
			
			var textSpace = direction == 'vertical' ? width - em : 0;
			SVGUtils.renderText(text, item.label, textSpace);
			
			bbox = SVGUtils.getBBox(text);
			
			var textWidth = bbox.width + em;
			var textHeight = bbox.height;

			var bx = x;
			var by = y;
			
			if (bullet) {
				if (bulletType == 'circle') {
					bullet.setAttribute("cx", x + bulletSize / 2);
					bullet.setAttribute("cy", y + em / 2 - 2);
					bullet.setAttribute("r", bulletSize / 2);
				} else {
					bullet.setAttribute("x", x);
					bullet.setAttribute("y", y + (em - bulletSize) / 2 - 2);
					bullet.setAttribute("width", bulletSize);
					bullet.setAttribute("height", bulletSize);
				}
				
				var itemBulletStyle = item.bullet && item.bullet.style ? item.bullet.style : {};
				var fill = itemBulletStyle.fill || optionsBulletStyle.fill || "#ff0000";
				
				bullet.setAttribute("fill", fill);
			}
			
			if (direction == 'horizontal') {
				x+= textWidth;
				if (x > width) {
					y+= textHeight;
					x = 0;
				}
			} else {
				y+= textHeight;
			}
			
		}
		w = width;
		h  = y + textHeight;
		return {
			width: w, 
			height: h
		}
	}
	
	
	/**
	 * 
	 * renders a line. 
	 * @static
	 * @method renderLine
	 * @param {Element} svg an svg layer
	 * @param {Array} points an array containing objects with x- and y-properties
	 * @param {Object} options an object containing options
	 */
	SVGUtils.renderLine = function(svg, points, options) {
//		console.log("render line", points.length, options);
		var smooth = typeof options.smooth == 'boolean' ? options.smooth : false;
		var tension = typeof options.tension == 'number' ? options.tension : 0.5;
		var stroke = typeof options.stroke != 'undefined' ? options.stroke : '#000';
		var strokeWidth = typeof options.strokeWidth != 'undefined' ? options.strokeWidth : 1;
		var approximate = typeof options.approximate == 'boolean' ? options.approximate : false;
		var t = !isNaN( options.tension ) ? options.tension : 0.5;
		
		var pathElem = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
		svg.appendChild(pathElem);
		
		var pathStr = "";
		
		
		if (!smooth) {
			for (var i = 0; i < points.length; i++ ) {
				var p = points[i];
				pathStr+= i > 0 ? "L " : "M ";
				pathStr+= p.x + " " + p.y;
			}	
		} else if (approximate) {
			var p = points[0];
			pathStr+= "M" + p.x + " " + p.y + " ";
			for (var i = 1; i < points.length - 1; i++) {
			    var c = (points[i].x + points[i + 1].x) / 2;
			    var d = (points[i].y + points[i + 1].y) / 2;
			    pathStr+= "Q " + points[i].x + " " + points[i].y + " " + c + " " + d;
			}
			pathStr+= "T " + points[i].x + " " + points[i].y;
		} else {
			var p = points[0];
			pathStr+= "M" + p.x + " " + p.y + " ";
			for (var i = 1; i < points.length - 1; i+=1) {
				var p = points[i - 1];
				var p1 = points[i];
				var p2 = points[i + 1];
			    var cps = getControlPoints(p.x, p.y, p1.x, p1.y, p2.x, p2.y, 0.5);
//			    pathStr+= "Q " + points[i].x + " " + points[i].y + " " + c + " " + d;
//			    var cpx = p1.x * 2 - (p.x + p2.x) / 2;
//			    var cpy = p1.y * 2 - (p.y + p2.y) / 2;
//			    console.log("I: ", i, cpx, cpy);
//			    pathStr+= "Q " + p.x + " " + p.y + " " + cpx + " " + cpy;
//			    pathStr+= "T " + p.x + " " + p.y;
			    pathStr+= "C " + cps.p1.x + " " + cps.p1.y + " " + cps.p2.x + " " + cps.p2.y + " " + p2.x + " " + p2.y;
			}
			pathStr+= "T " + points[points.length - 1].x + " " + points[points.length - 1].y;
		}

		pathElem.setAttribute("d", pathStr);
		pathElem.setAttribute("stroke", stroke);
		pathElem.setAttribute("stroke-width", strokeWidth);
		pathElem.setAttribute("fill", "none");
		
	}
	
	
	function getControlPoints(x0,y0,x1,y1,x2,y2,t){
		t = typeof t == 'number' ? t : 0.5;
		console.log("ctrl points: T: ", t);
	    var d01=Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2));
	    var d12=Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
	    var fa=t*d01/(d01+d12);   // scaling factor for triangle Ta
	    var fb=t*d12/(d01+d12);   // ditto for Tb, simplifies to fb=t-fa
	    var p1x=x1-fa*(x2-x0);    // x2-x0 is the width of triangle T
	    var p1y=y1-fa*(y2-y0);    // y2-y0 is the height of T
	    var p2x=x1+fb*(x2-x0);
	    var p2y=y1+fb*(y2-y0);  
//	    return [p1x,p1y,p2x,p2y];
	    return {
	    	p1: {x: p1x, y: p1y}, 
	    	p2: {x: p2x, y: p2y}
	    }
	}
	
	function catmullRom2bezier( points ) {
		  // alert(points)
		  var crp = points.split(/[,\s]/);
		  
		  var d = "";
		  for (var i = 0, iLen = crp.length; iLen - 2 > i; i+=2) {
		    var p = [];
		    if ( 0 == i ) {
		      p.push( {x: parseFloat(crp[ i ]), y: parseFloat(crp[ i + 1 ])} );
		      p.push( {x: parseFloat(crp[ i ]), y: parseFloat(crp[ i + 1 ])} );
		      p.push( {x: parseFloat(crp[ i + 2 ]), y: parseFloat(crp[ i + 3 ])} );
		      p.push( {x: parseFloat(crp[ i + 4 ]), y: parseFloat(crp[ i + 5 ])} );
		    } else if ( iLen - 4 == i ) {
		      p.push( {x: parseFloat(crp[ i - 2 ]), y: parseFloat(crp[ i - 1 ])} );
		      p.push( {x: parseFloat(crp[ i ]), y: parseFloat(crp[ i + 1 ])} );
		      p.push( {x: parseFloat(crp[ i + 2 ]), y: parseFloat(crp[ i + 3 ])} );
		      p.push( {x: parseFloat(crp[ i + 2 ]), y: parseFloat(crp[ i + 3 ])} );
		    } else {
		      p.push( {x: parseFloat(crp[ i - 2 ]), y: parseFloat(crp[ i - 1 ])} );
		      p.push( {x: parseFloat(crp[ i ]), y: parseFloat(crp[ i + 1 ])} );
		      p.push( {x: parseFloat(crp[ i + 2 ]), y: parseFloat(crp[ i + 3 ])} );
		      p.push( {x: parseFloat(crp[ i + 4 ]), y: parseFloat(crp[ i + 5 ])} );
		    }
		    
		    // Catmull-Rom to Cubic Bezier conversion matrix 
		    //    0       1       0       0
		    //  -1/6      1      1/6      0
		    //    0      1/6      1     -1/6
		    //    0       0       1       0

		    var bp = [];
		    bp.push( { x: p[1].x,  y: p[1].y } );
		    bp.push( { x: ((-p[0].x + 6*p[1].x + p[2].x) / 6), y: ((-p[0].y + 6*p[1].y + p[2].y) / 6)} );
		    bp.push( { x: ((p[1].x + 6*p[2].x - p[3].x) / 6),  y: ((p[1].y + 6*p[2].y - p[3].y) / 6) } );
		    bp.push( { x: p[2].x,  y: p[2].y } );

		    d += "C" + bp[1].x + "," + bp[1].y + " " + bp[2].x + "," + bp[2].y + " " + bp[3].x + "," + bp[3].y + " ";
		  }
		  
		  return d;
		}
	
	
	return SVGUtils;
})();
(function() {
	
	
	/**
	 * the benignware visualization package contains chart modules for the basic chart types.
	 * @package benignware.visualization
	 */
	
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var ArrayUtils = Class.require("benignware.util.ArrayUtils");
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
	 * base class for all charts of the library.
	 * @class benignware.visualization.BaseChart  
	 */
    
	function BaseChart() {
		
		_parent.apply(this, arguments);
		
		// data table
		
		var _dataTable = null;
		
		/**
		 * sets the data-table for this component
		 * @privileged
		 * @method setDataTable
		 * @param {DataTable} dataTable the data-table instance
		 */
		this.setDataTable = function(dataTable) {
			if (dataTable.columns && dataTable.rows) {
				dataTable = new DataTable(dataTable);
			}
			_dataTable = dataTable;
			this.invalidate();
		}
		
		/**
		 * retrieves the data-table for this component
		 * @privileged
		 * @method getDataTable
		 * @return {DataTable} dataTable the data-table object
		 */
		this.getDataTable = function() {
			return _dataTable || new DataTable();
		}


		var _datePattern = 'MM/dd/yyyy';
		/**
		 * sets the component's date-format pattern. defaults to 'MM/dd/yyyy'.
		 * @privileged
		 * @method setDatePattern
		 * @param {String} datePattern a date-format pattern.
		 */
		this.setDatePattern = function(datePattern) {
			if (datePattern != _datePattern) {
				_datePattern = datePattern;
				this.invalidate();
			}
		}
		
		/**
		 * returns the chart's default date-format pattern.
		 * @privileged
		 * @method getDatePattern
		 * @return {String} the chart's default date-format pattern
		 */
		this.getDatePattern = function() {
			return _datePattern;
		}
		
		var _numberPattern = '#.##';
		/**
		 * sets the chart's default number-format pattern. defaults to '#.##'.
		 * @privileged
		 * @method setNumberPattern
		 * @param {String} numberPattern a number-format pattern
		 */
		this.setNumberPattern = function(numberPattern) {
			if (numberPattern != _numberPattern) {
				_numberPattern = numberPattern;
				this.invalidate();
			}
		}
		
		/**
		 * returns the chart's default number-format pattern.
		 * @privileged
		 * @method getNumberPattern
		 * @return {String} the chart's default number-format pattern
		 */
		this.getNumberPattern = function(numberPattern) {
			return _numberPattern;
		}
		

		var _title = null;
		/**
		 * sets the title for the chart
		 * @privileged
		 * @method setTitle
		 * @param {String} title the chart's title
		 */
		this.setTitle = function(title) {
			if (title != _title) {
				_title = title;
				this.invalidate();
			}
		}
		
		/**
		 * returns the title of the chart
		 * @privileged
		 * @method getTitle
		 * @return {String} title the chart's title
		 */
		this.getTitle = function() {
			if (_title) {
				return _title;
			}
			return null;
		}
		

		
		var _categoryIndex = undefined;
		/**
		 * specifies index of the chart's category column
		 * @privileged
		 * @method setCategoryIndex
		 * @param {Number} categoryIndex the category column index
		 */
		this.setCategoryIndex = function(categoryIndex) {
			if (_categoryIndex != this.getCategoryIndex()) {
				_categoryIndex = categoryIndex;
				this.invalidate();
			}
		}
		
		/**
		 * @privileged
		 * @method getCategoryIndex
		 * @return {Number} the category column index
		 */
		this.getCategoryIndex = function() {
			if (typeof _categoryIndex != 'undefined') {
				return _categoryIndex;
			}
			return 0;
		}
		
		
		/**
		 * returns the chart's series column indices based on exclusion of the category column.
		 * @privileged
		 * @method getSeriesColumnIndices
		 * @return {Array} an array containing column indices 
		 */
		this.getSeriesColumnIndices = function() {
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
		
		// colors
		
		var _seriesColors = [];
		var _cssSeriesColors = null;
		
		/**
		 * defines the colors of the chart's series.
		 * @privileged
		 * @method setSeriesColors
		 * @param {Array} colors an array containing css color values 
		 */
		this.setSeriesColors = function(colors) {			
			if (typeof(colors) == "string") {
				colors = ArrayUtils.filter(colors.split(","), function(obj) {
					return StringUtils.trim(obj);
				});
			}
			_seriesColors = colors;
			this.invalidate();
			
		}
		
		/**
		 * returns the chart's series colors. if not explicitly set, default values will be returned.
		 * @privileged
		 * @method getSeriesColors
		 * @return {Array} an array containing css color values.
		 */
		this.getSeriesColors = function() {
			
			var chartElem = this;
			
			var defaultColors = (function() {
				
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
			})();
			
			var colors = ArrayUtils.merge(defaultColors, _seriesColors);
			return colors;
		}
	}
	
	Class.register("benignware.visualization.BaseChart", BaseChart);
	
	Class.extend(Component, BaseChart);
	_parent = Class.getParent(BaseChart);

	/**
	 * formats a value based on its variable type and the specified pattern.
	 * @static
	 * @method getFormattedValue
	 * @return {String} the formatted value
	 */
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
	
	/**
	 * calls the components's render method
	 * @protected
	 * @method _update
	 */
	BaseChart.prototype._update = function() {
		// render
		this._render();
	}
	
	/**
	 * hook in here for the chart's rendering implementation.
	 * @protected
	 * @method _render
	 */
	BaseChart.prototype._render = function() {
	}
	
	
	return BaseChart;
})();
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
	
	var BaseChart = Class.require("benignware.visualization.BaseChart");
	
	var _parent;
    
	CSS.setDefaultStyle(".benignware-visualization-VisualChart", "width", "600px");
    CSS.setDefaultStyle(".benignware-visualization-VisualChart", "height", "400px");

    /**
	 * base class for all graphical charts
	 * @class benignware.visualization.VisualChart  
	 */
    
	function VisualChart() {
		
		_parent.apply(this, arguments);

		var _legend = 'right';
		
		/**
		 * sets legend position. can be one the following: top, right, bottom, left or none. defaults to right.
		 * @privileged
		 * @method setLegend 
		 * @param {String} position the chart legend's position
		 */
		this.setLegend = function(position) {
			if (position != _legend) {
				_legend = position;
				this.invalidate();
			}
		}
		
		/**
		 * returns the chart legend's position
		 * @privileged
		 * @method getLegend
		 * @return {String} the chart legend's position
		 */
		this.getLegend = function() {
			if (_legend) {
				return _legend;
			}
			return 'none';
		}
		
	}
	
	
	/**
	 * @field LEGEND_TOP
	 * @return {String} top
	 */
	VisualChart.LEGEND_TOP = "top";
	/**
	 * @field LEGEND_RIGHT
	 * @return {String} right
	 */
	VisualChart.LEGEND_RIGHT = "right";
	/**
	 * @field LEGEND_BOTTOM
	 * @return {String} bottom
	 */
	VisualChart.LEGEND_BOTTOM = "bottom";
	/**
	 * @field LEGEND_LEFT
	 * @return {String} left
	 */
	VisualChart.LEGEND_LEFT = "left";
	/**
	 * @field LEGEND_NONE
	 * @return {String} none
	 */
	VisualChart.LEGEND_NONE = "none";
	
	Class.register("benignware.visualization.VisualChart", VisualChart);
	
	Class.extend(BaseChart, VisualChart);
	_parent = Class.getParent(VisualChart);

	
	VisualChart.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
	}
	
	VisualChart.prototype.contentLayer = null;
	
	VisualChart.prototype._createChildren = function() {
		
		_parent._createChildren.apply(this, arguments);
		
		var doc = this.ownerDocument;
		
		var svgElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg");
		svgElem.setAttribute('class', "chart-gfx");
		svgElem.setAttribute('version', "1.1");
		this.appendChild(svgElem);
		this.graphicsElem = svgElem;
		
		this.contentLayer = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
		svgElem.appendChild(this.contentLayer);
		
		this.chartLayer = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
		this.contentLayer.appendChild(this.chartLayer);
		
		this.legendLayer = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
		this.contentLayer.appendChild(this.legendLayer);
		
		this.titleLayer = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "g");
		this.contentLayer.appendChild(this.titleLayer);
		
	}
	
	/**
	 * builds the legend's items. override this method to customize items.
	 * @protected
	 * @method _buildLegendItems
	 * @return {Array} an array containing legend items
	 */
	VisualChart.prototype._buildLegendItems = function() {
		var items = [];
		var categoryIndex = this.getCategoryIndex();
		var colors = this.getSeriesColors();
		var dataTable = this.getDataTable();
		var i = 0;
		for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
			if (c != categoryIndex) {
				var label = dataTable.getColumnLabel(c);
				var color = colors[i];
				items.push({
					label: label, 
					bullet: {
						type: 'rect', 
						style: {
							fill: color
						}
					}
				});
				i++;
			}
		}
		return items;
	}
	
	
	/**
	 * returns the margin of the chart's main layer. 
	 * @method getChartMargin
	 * @return {Object} an object containing left, top, bottom and right.
	 */
	VisualChart.prototype.getChartMargin = function() {
		return {left: 110, top: 90, bottom: 90, right: 110};
	}
	
	/**
	 * returns the size of the chart's main layer.
	 * @method getChartSize
	 * @return {Object} an object containing width and height. 
	 */
	VisualChart.prototype.getChartSize = function() {
		var size = this.getSize();
		var margin = this.getChartMargin();
		return {
			width: size.width - margin.left - margin.right, 
			height: size.height - margin.top - margin.bottom
		}
	}
	
	
	/**
	 * renders the chart's main layer
	 * @protected
	 * @method _renderChart
	 */
	VisualChart.prototype._renderChart = function() {
		
	}
	
	VisualChart.prototype._render = function() {
		
		var dataTable = this.getDataTable();
		
		if (!dataTable || dataTable.getNumberOfRows() == 0) {
			return;
		}
		
		var svgElem = this.graphicsElem;
		
		var margin = Element.getBorderMetrics(this, 'border', 'padding');
		
		var width = Element.getWidth(this);
		var height = Element.getHeight(this);
		
		margin = this.getChartMargin();
		
		var contentX = margin.left;
		var contentY = margin.top;
		var contentWidth = width - margin.left - margin.right;
		var contentHeight = height - margin.top - margin.bottom;
		
		contentWidth = Math.max(contentWidth, 0);
		contentHeight = Math.max(contentHeight, 0);
		
		var chartMargin = this.getChartMargin();
		var chartSize = this.getChartSize();
		var chartWidth = chartSize.width;
		var chartHeight = chartSize.height;
		
		svgElem.style.position = "absolute";
		
		svgElem.setAttribute("style", "font-family: Arial; max-width: " + width + "px; width: 100%; height: auto;");
		
//		svgElem.setAttribute("width", width);
		svgElem.setAttribute("height", height);
		svgElem.setAttribute("viewBox",  "0 0 " + width + " " + height);
		svgElem.setAttribute("preserveAspectRatio", "xMinYMin meet");

		this.chartLayer.setAttribute("transform", "");
		SVGUtils.clear(this.chartLayer);
		
		// render legend

		this.legendLayer.setAttribute("transform", "");
		SVGUtils.clear(this.legendLayer);
		
		var legendPosition = this.getLegend();
		var legendMargin = 10;
		
		if (legendPosition && legendPosition != 'none') {

			var items = this._buildLegendItems();
			
			
			var legendDirection = legendPosition == 'right' || legendPosition == 'left' ? 'vertical' : 'horizontal';
			
			var legendWidth;
			
			switch (legendPosition) {
			
				case 'right': 
					legendWidth = chartMargin.right - legendMargin * 2;
					break;
					
				case 'left': 
					legendWidth = chartMargin.left - legendMargin * 2;
					break;
					
				case 'bottom': 
					legendWidth = width - chartMargin.left - legendMargin * 2;
					break;
					
				case 'top': 
					legendWidth = width - chartMargin.left - legendMargin * 2;
					break;
			}
			
			var legendOptions = {direction: legendDirection}
			
			var legendX = 0;
			var legendY = 0;
			
			var legendSize = SVGUtils.renderList(this.legendLayer, items, legendWidth, legendOptions);
			this.legendLayer.setAttribute("class", "chart-legend");
			
			switch (legendPosition) {
				
				case 'right': 
					legendX = chartMargin.left + chartWidth + legendMargin;
					legendY = chartMargin.top + legendMargin;
					break;
					
				case 'left': 
					legendX = chartMargin.left + legendMargin;
					legendY = chartMargin.top + legendMargin;
					break;
					
				case 'bottom': 
					legendX = chartMargin.left + legendMargin;
					legendY = chartMargin.top + chartHeight - legendSize.height - legendMargin;
					break;
					
				case 'top': 
					legendX = chartMargin.left;
					legendY = chartMargin.top - legendSize.height - legendMargin;
					break;
			}
			
			this.legendLayer.setAttribute("transform", "translate(" + legendX + ", " + legendY + ")");
			
		}
		
		
		var chartX = chartMargin.left;
		var chartY = chartMargin.top;
		
		// render title

		SVGUtils.clear(this.titleLayer);
		
		var title = this.getTitle();
		
		if (title != null) {
			
			var titleX = chartX;
			var titleY = (legendPosition == "top" ? legendY : chartY) - legendMargin;
			this.titleLayer.setAttribute("transform", "translate(" + titleX + ", " + titleY + ")");
			
			var titleText = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "text");
			
			titleText.style.fontSize = "16px";
			titleText.style.fontWeight = "bold";
			titleText.setAttribute("class", "chart-title");
			
			var titleTextNode = this.ownerDocument.createTextNode(title);
			
			titleText.appendChild(titleTextNode);
			this.titleLayer.appendChild(titleText);
		}
		
		this.chartLayer.setAttribute("transform", "translate(" + chartX + ", " + chartY + ")");
		
		SVGUtils.clear(this.chartLayer);
		
		var clipPath = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "clipPath");
		clipPath.setAttribute('id', 'chart-clip');
		this.chartLayer.appendChild(clipPath);
		
		var rect = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
		rect.setAttribute("x", 0);
		rect.setAttribute("y", 0);
		rect.setAttribute("width", chartWidth);
		rect.setAttribute("height", chartHeight);
		rect.setAttribute("fill", '#afafaf');
		
		clipPath.appendChild(rect);
		
		this.chartLayer.setAttribute('clip-path', "url(#chart-clip)");
			 
		this._renderChart(chartWidth, chartHeight);

	}
	
	
	return VisualChart;
})();
(function() {
	
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var ArrayUtils = Class.require("benignware.util.ArrayUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var BaseChart = Class.require("benignware.visualization.BaseChart");
	var VisualChart = Class.require("benignware.visualization.VisualChart");
	var DataTable = Class.require("benignware.visualization.DataTable");
	
	var NumericScale = Class.require("benignware.visualization.NumericScale");
	var TimeScale = Class.require("benignware.visualization.TimeScale");
	
	var SVGUtils = Class.require("benignware.visualization.SVGUtils");
	
	var _parent;

//    CSS.setDefaultStyle(".benignware-visualization-CartesianChart .grid-line", "stroke", "#efefef");
//    CSS.setDefaultStyle(".benignware-visualization-CartesianChart .axis-label", "font-size", "12px");

    /**
	 * base class for all cartesian charts
	 * @class benignware.visualization.CartesianChart  
	 */
    
	function CartesianChart() {
		
		_parent.apply(this, arguments);
		
		
		var _switchAxes = false;
		/**
		 * switches the axes of the cartesian chart.
		 * @method setSwitchAxes
		 * @param {Boolean} bool a boolean value.
		 */
		this.setSwitchAxes = function(bool) {
			_switchAxes = StringUtils.toBoolean(bool);
			this.invalidate();
		}
		
		/**
		 * returns true if axes are switched.
		 * @method getSwitchAxes
		 * @return {Boolean} a boolean value indicating if axes are switched
		 */
		this.getSwitchAxes = function() {
			return _switchAxes;
		}
		
	}
	
	Class.register("benignware.visualization.CartesianChart", CartesianChart);
	
	Class.extend(VisualChart, CartesianChart);
	_parent = Class.getParent(CartesianChart);
	
	CartesianChart.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
		
		this.axesLayer = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'g');
		this.contentLayer.insertBefore(this.axesLayer, this.chartLayer);
		
		this.xAxisGridLayer = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'g');
		this.xAxisGridLayer.setAttribute('class', 'x-grid');
		this.axesLayer.appendChild(this.xAxisGridLayer);
		
		this.yAxisGridLayer = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'g');
		this.yAxisGridLayer.setAttribute('class', 'y-grid');
		this.axesLayer.appendChild(this.yAxisGridLayer);
		
		this.yAxisTicksLayer = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'g');
		this.yAxisTicksLayer.setAttribute('class', 'y-ticks');
		this.axesLayer.appendChild(this.yAxisTicksLayer);
		
		this.xAxisTicksLayer = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'g');
		this.yAxisTicksLayer.setAttribute('class', 'x-ticks');
		this.axesLayer.appendChild(this.xAxisTicksLayer);
	}
	
	
	function getValueBounds(dataTable, columnIndices) {

		var min = null;
		var max = null;
		
		for (var r = 0; r < dataTable.getNumberOfRows(); r++) {
			
			for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
				
				if (ArrayUtils.contains(columnIndices, c)) {
					
					var value = dataTable.getCell(r, c);
					
					if (dataTable.getColumnType(c) == 'date' && value.getTime) {
						// timestamp for dates
						value = value.getTime();
					}
					
					min = min != null ? Math.min(min, value) : value;
					max = max != null ? Math.max(max, value) : value;

				}

			}
		}
		
		return {
			min: min != null ? min : 0, max: max != null ? max : dataTable.getNumberOfRows() - 1
		}
		
	}
	
	CartesianChart.prototype._renderChart = function(chartWidth, chartHeight) {
		_parent._renderChart.apply(this, arguments);
		this._renderAxes();
	}
	
	
	/**
	 * returns the scale of the chart's category axis.
	 * @method getCategoryScale
	 * @return {Scale} an instance of a Scale subclass
	 */
	CartesianChart.prototype.getCategoryScale = function() {
		var dataTable = this.getDataTable();
		var switchAxes = this.getSwitchAxes();
		var chartSize = this.getChartSize();
		var ticks = Math.ceil((switchAxes ? chartSize.height : chartSize.width) / 50);
		var columnIndex = this.getCategoryIndex();
		var columnType = dataTable.getColumnType(columnIndex);
		var columnBounds = getValueBounds(dataTable, [columnIndex]);
		var linear = false;
		var scale = null;
		switch (columnType) {
			case 'date': 
				scale = new TimeScale(columnBounds.min, columnBounds.max, ticks, linear);
				break;
			case 'number': 
				scale = new NumericScale(columnBounds.min, columnBounds.max, ticks, linear);
				break;
			case 'string':
				var tickItems = [];
				for (var r = 0; r < dataTable.getNumberOfRows(); r++) {
					var cell = dataTable.getCell(r, columnIndex);
					tickItems.push(r);
				}
				scale = {
					min: 0, 
					max: dataTable.getNumberOfRows(), 
					ticks: tickItems, 
					interval: 1
				}
		}
		return scale;
	}
	
	
	/**
	 * returns the scale of the chart's value axis.
	 * @method getValueScale
	 * @return {Scale} an instance of a Scale subclass
	 */
	CartesianChart.prototype.getValueScale = function() {
		var dataTable = this.getDataTable();
		var switchAxes = this.getSwitchAxes();
		var chartSize = this.getChartSize();
		var ticks = Math.ceil((switchAxes ? chartSize.width : chartSize.height) / 50);
		var categoryIndex = this.getCategoryIndex();
		var valueIndex = categoryIndex != 0 ? 0 : 1;
		var valueType = dataTable.getColumnType(valueIndex);
		var valueIndices = [];
		for (var c = 0; c < dataTable.getNumberOfColumns(); c++) if (c != categoryIndex) valueIndices.push(c);
		var valueBounds = getValueBounds(dataTable, valueIndices);
		var valueScale = valueType == "date" ? new TimeScale(valueBounds.min, valueBounds.max, ticks, true) : new NumericScale(valueBounds.min, valueBounds.max, ticks, true);
		return valueScale;
	}
	
	/**
	 * renders axes, scales and grid of the chart.
	 * @protected
	 * @method _renderAxes
	 */
	CartesianChart.prototype._renderAxes = function(chartWidth, chartHeight) {

		var dataTable = this.getDataTable();
		
		this.axesLayer.setAttribute('transform', this.chartLayer.getAttribute('transform'));
		
		var chartSize = this.getChartSize();
		var chartWidth = chartSize.width;
		var chartHeight = chartSize.height;
		var chartMargin = this.getChartMargin();
		
		var switchAxes = this.getSwitchAxes();
		
		var colors = this.getSeriesColors();

		var categoryIndex = this.getCategoryIndex();
		var categoryType = dataTable.getColumnType(categoryIndex);
		
		var valueIndex = categoryIndex != 0 ? 0 : 1;
		var valueType = dataTable.getColumnType(valueIndex);
		
		var valueIndices = [];
		for (var c = 0; c < dataTable.getNumberOfColumns(); c++) if (c != categoryIndex) valueIndices.push(c);
		
		var ticks = Math.min(7, dataTable.getNumberOfRows() - 1);
		
		var categoryBounds = getValueBounds(dataTable, [categoryIndex]);
//		var categoryScale = categoryType == "date" ? new TimeScale(categoryBounds.min, categoryBounds.max, ticks, false) : new NumericScale(categoryBounds.min, categoryBounds.max, ticks, false);
		categoryScale = this.getCategoryScale();
		
		var valueBounds = getValueBounds(dataTable, valueIndices);
//		var valueScale = valueType == "date" ? new TimeScale(valueBounds.min, valueBounds.max, ticks, true) : new NumericScale(valueBounds.min, valueBounds.max, ticks, true);
		
		var valueScale = this.getValueScale();
		
		var rx = switchAxes ? valueScale : categoryScale;
		var ry = switchAxes ? categoryScale : valueScale;

		
		// grid
		
		
		SVGUtils.clear(this.yAxisGridLayer);

		// vertical grid
		for (var i = 0; i < ry.ticks.length; i++) {
			var vy = ry.ticks[i];
			var py = (vy - ry.min) / (ry.max - ry.min);
			var y = Math.floor(chartHeight - py * chartHeight);
			var lineElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "line");
			this.yAxisGridLayer.appendChild(lineElem);
			lineElem.setAttribute('x1', 0);
			lineElem.setAttribute('x2', chartWidth);
			lineElem.setAttribute('y1', y);
			lineElem.setAttribute('y2', y);
			lineElem.setAttribute("stroke", "#efefef");
			lineElem.setAttribute("stroke-width", "1");
			lineElem.setAttribute("class", "chart-grid");
		}
		
		// vertical axis
		var lineElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "line");
		this.yAxisGridLayer.appendChild(lineElem);
		lineElem.setAttribute('x1', 0);
		lineElem.setAttribute('x2', 0);
		lineElem.setAttribute('y1', 0);
		lineElem.setAttribute('y2', chartHeight);
		lineElem.setAttribute("stroke", "#000000");
		lineElem.setAttribute("stroke-width", "1");
		lineElem.setAttribute("class", "chart-axis");
		SVGUtils.clear(this.xAxisGridLayer);
		
		

		
		// horizontal grid
		for (var i = 0; i < rx.ticks.length; i++) {
			var vx = rx.ticks[i];
			var px = (vx - rx.min) / (rx.max - rx.min);
			var x = Math.floor(px * chartWidth);
			var lineElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "line");
			this.xAxisGridLayer.appendChild(lineElem);
			lineElem.setAttribute('x1', x);
			lineElem.setAttribute('x2', x);
			lineElem.setAttribute('y1', 0);
			lineElem.setAttribute('y2', chartHeight);
			lineElem.setAttribute("stroke", "#efefef");
			lineElem.setAttribute("stroke-width", "1");
			lineElem.setAttribute("class", "chart-grid");
		}

		// horizontal axis
		var lineElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "line");
		this.xAxisGridLayer.appendChild(lineElem);
		lineElem.setAttribute('x1', 0);
		lineElem.setAttribute('x2', chartWidth);
		lineElem.setAttribute('y1', chartHeight);
		lineElem.setAttribute('y2', chartHeight);
		lineElem.setAttribute("stroke", "#000000");
		lineElem.setAttribute("stroke-width", "1");
		lineElem.setAttribute("class", "chart-axis");
		
	
		// ticks
		
		var labelMargin = 5;

		// vertical labels
		
		SVGUtils.clear(this.yAxisTicksLayer);
		var labelMaxWidth = chartMargin.left - labelMargin * 2;
		for (var i = 0; i < ry.ticks.length; i++) {
			
			var tickValue = ry.ticks[i];
			var pv = (tickValue - ry.min) / (ry.max - ry.min);
			var y = Math.floor(chartHeight - pv * chartHeight);
			
			// get formatted value
			var columnIndex = switchAxes ? categoryIndex : valueIndex;
			
			var label = "";
			switch (dataTable.getColumnType(columnIndex)) {
				
				case 'date': 
				case 'number': 
					var value = dataTable.getColumnType(columnIndex) == 'date' ? new Date(tickValue) : tickValue;
					var pattern = dataTable.getColumnPattern(columnIndex) || this.getDatePattern();
					label = BaseChart.getFormattedValue(value, pattern);
					break;
					
				case 'string': 
					var row = dataTable.getNumberOfRows() - 1 - tickValue;
					label = dataTable.getCell(row, columnIndex);
					break;
			}
			
			var labelText = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'text');
			this.yAxisTicksLayer.appendChild(labelText);
			labelText.setAttribute("x", -labelMargin);
			labelText.setAttribute("font-size", "10px");
			var textSize = SVGUtils.renderText(labelText, label, labelMaxWidth);
			
			labelText.setAttribute("text-anchor", "end");
			labelText.setAttribute("y", y - textSize.height / 2);
			labelText.setAttribute("class", "chart-axis-label");
			
		}

		
		
//		if (categoryIndex != null) {
			
			
		SVGUtils.clear(this.xAxisTicksLayer);
			
			// horizontal labels
			
			var labelMaxWidth = chartWidth / rx.ticks.length - labelMargin * 2;
			var isBroken = false;
			var mustRotate = true;
			
			var labelItems = [];
			
			for (var i = 0; i < rx.ticks.length; i++) {
				
				var tickValue = rx.ticks[i];
				var pv = (tickValue - rx.min) / (rx.max - rx.min);
				var v = Math.floor(pv * chartWidth);
				
				// get formatted value
				var columnIndex = switchAxes ? valueIndex : categoryIndex;
				
				var label = "";
				switch (dataTable.getColumnType(columnIndex)) {
					
					case 'date': 
					case 'number': 
						var value = dataTable.getColumnType(columnIndex) == 'date' ? new Date(tickValue) : tickValue;
						var pattern = dataTable.getColumnPattern(columnIndex) || this.getDatePattern();
						label = BaseChart.getFormattedValue(value, pattern);
						break;
						
					case 'string': 
						label = dataTable.getCell(tickValue, columnIndex);
						break;
				}

				var labelText = this.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, 'text');
				labelText.setAttribute("font-size", "10px");
				this.xAxisTicksLayer.appendChild(labelText);
				
				labelText.setAttribute("x", v);
				var textSize = SVGUtils.renderText(labelText, label, labelMaxWidth);
				labelText.setAttribute("text-anchor", "middle");
				labelText.setAttribute("class", "chart-axis-label");
					
				var y = chartHeight + labelMargin;
				
				if (labelText.getComputedTextLength() > labelMaxWidth) {
					isBroken = true;
					var em = SVGUtils.getLineHeight(labelText);
					if (textSize.height > em + 0.1) {
						mustRotate = true;
					}
				}
				
				labelText.setAttribute("y", y);
				
				labelItems.push({
					x: v, 
					y: y, 
					width: textSize.width, 
					height: textSize.height, 
					svg: labelText
				});
				
			}
//		}
		
		if (isBroken) {
			for (var i = 0; i < labelItems.length; i++) {
				var labelItem = labelItems[i];
				if (mustRotate) {
					labelItem.svg.setAttribute("text-anchor", "end");
					labelItem.svg.setAttribute('transform', "rotate(-32 " + labelItem.x + "," + labelItem.y + ")");
		
				} else {
					if (i % 2 == 0) {
						labelItem.svg.setAttribute('dx', "1em");
					}
				}
				
			}
		}
		
		
		


	}
	
	
	
	
	return CartesianChart;
})();
(function() {
	
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var SVGUtils = Class.require("benignware.visualization.SVGUtils");
	var CartesianChart = Class.require("benignware.visualization.CartesianChart");
	
	var _parent;

    
    /**
	 * LineChart class
	 * @class benignware.visualization.LineChart 
	 * @extends benignware.visualization.CartesianChart 
	 */
    
	function LineChart() {
		_parent.apply(this, arguments);
		
		var _smooth = false;
		
		this.setSmooth = function(string) {
			if (string != _smooth) {
				_smooth = string;
				this.invalidate();
			}
		}
		
		this.getSmooth = function() {
			return _smooth;
		}
	}
	
	Class.register("benignware.visualization.LineChart", LineChart);
	
	Class.extend(CartesianChart, LineChart);
	_parent = Class.getParent(LineChart);
	
	
	LineChart.SMOOTH_NONE = "none";
	LineChart.SMOOTH_ACCURATE = "accurate";
	LineChart.SMOOTH_APPROXIMATE = "approximate";
	
	LineChart.prototype._renderChart = function() {
		_parent._renderChart.call(this);
		this._renderLines();
	}
	
	/**
	 * renders the value graphs.
	 * @protected
	 * @method _renderLines
	 */
	LineChart.prototype._renderLines = function() {
		
		// get graphs
		var dataTable = this.getDataTable();
		var categoryIndex = this.getCategoryIndex();
		
		var categoryScale = this.getCategoryScale();
		 
		if (categoryScale.min == categoryScale.max) {
			return;
		}
		
		var valueScale = this.getValueScale();
		
		var chartSize = this.getChartSize();
		var chartWidth = chartSize.width;
		var chartHeight = chartSize.height;
		
		var colors = this.getSeriesColors();
		
		var graphs = [];
		
		var lastValues = [];
		
		for (var r = 0; r < dataTable.getNumberOfRows(); r++) {

			// category values
			
			var categoryValue = r;
			if (categoryIndex != null) {
				categoryValue = dataTable.getCell(r, categoryIndex);
				if (dataTable.getColumnType(categoryIndex) == 'date') {
					categoryValue = categoryValue.getTime();
				}
				if (dataTable.getColumnType(categoryIndex) == 'string') {
					categoryValue = r;
				}
			}

			// series values

			
			for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {

				if (c != categoryIndex) {

					var columnId = dataTable.getColumnId(c);
					var graph = graphs[columnId] ? graphs[columnId] : graphs[columnId] = [];
					
					var v = dataTable.getCell(r, c);

					if (v != null) {
						value = v; 
						lastValues[c] = value;
					} else {
						if (typeof lastValues[c] == 'undefined') {
							// get initial value
							for (var a = 0; a < dataTable.getNumberOfRows(); a++) {
								var iv = dataTable.getCell(a, c);
								if (typeof iv != 'undefined' && iv != null) {
									lastValues[c] = iv;
									break;
								}
							}
						}
						value = lastValues[c];
					}
					
					if (dataTable.getColumnType(c) == 'date') {
						value = value.getTime();
					}
					if (dataTable.getColumnType(c) == 'string') {
						value = r;
					}
					
					if (categoryValue < categoryScale.min) {
//						console.log("smaller than scale", r); 
					}
					
					// get percent by bounds
					var pc = (categoryValue - categoryScale.min) / (categoryScale.max - categoryScale.min);
					var pv = (value - valueScale.min) / (valueScale.max - valueScale.min);

					var px = pc;
					var py = pv;
					
//					console.log("P: ", px, py);
					
					// upscale by chart size
					var x = Math.floor(px * chartWidth);
					var y = Math.floor(chartHeight - py * chartHeight);
					
					
					
					graph.push({x: x, y: y});
					
//					i++;
				}

			}
			
		}
		
		var smooth = this.getSmooth();

		var graphIndex = 0;
		for (var columnId in graphs) {
			
			var points = graphs[columnId];
			
//			var pathElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
//			this.chartLayer.appendChild(pathElem);
//			
//			var pathStr = "";
//			
//			for (var i = 0; i < points.length; i++ ) {
//				var p = points[i];
//				console.log("P: ", p);
////				if (i > 0) {
////					pathStr+= "T ";
////				}
////				
////				pathStr+= p.x + " " + p.y + " ";
//				
//				if (i > 0 ) {
//					
//					if (smooth && i < points.length - 1) {
//						var p0 = points[i - 1];
//						var p1 = points[i + 1];
//						var cpx = p.x * 2 - (p0.x + p1.x) / 2;
//						var cpy = p.y * 2 - (p0.y + p1.y) / 2;
//						console.log("I: ", i, p0, p1);
//						// pathStr+= "Q " + p1.x + " " + p1.y + " " + cpx + " " + cpy;
//						pathStr+= "Q "  + cpx + " " + cpy + " " + p1.x + " " + p1.y + " ";
//						// pathStr+= "T " + p.x + " " + p.y + " ";
//					} else {
//						pathStr+= "T " + p.x + " " + p.y;
//					}
//					
//				} else {
//					pathStr+= "M" + p.x + " " + p.y + " ";
//				}
//				
//			}
			
			var color = colors[graphIndex];
			
//			pathElem.setAttribute("d", pathStr);
//			pathElem.setAttribute("stroke", color);
//			pathElem.setAttribute("stroke-width", "1");
//			pathElem.setAttribute("fill", "none");
			
			var smoothType = this.getSmooth();
			var smooth = (smoothType && smoothType != 'none');
			var approximate = smoothType && smoothType == "approximate";
			SVGUtils.renderLine(this.chartLayer, points, {stroke: color, smooth: smooth, approximate: true})
//			SVGUtils.renderLine(this.chartLayer, points, {stroke: 'black', smooth: false, approximate: true})
			
			graphIndex++;
		}
	}
	
	return LineChart;
})();
(function() {
	
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var CartesianChart = Class.require("benignware.visualization.CartesianChart");
	
	var _parent;

    
    /**
	 * ColumnChart class. 
	 * @class benignware.visualization.ColumnChart  
	 * @extends benignware.visualization.CartesianChart
	 */
    
	function ColumnChart() {
		_parent.apply(this, arguments);
	}
	
	Class.register("benignware.visualization.ColumnChart", ColumnChart);
	
	Class.extend(CartesianChart, ColumnChart);
	_parent = Class.getParent(ColumnChart);

	ColumnChart.prototype._renderChart = function(chartWidth, chartHeight) {
		_parent._renderChart.apply(this, arguments);
		this._renderBars();
	}
	
	/**
	 * renders the value bars
	 * @method _renderBars
	 */
	ColumnChart.prototype._renderBars = function() {
		
		// get graphs
		var dataTable = this.getDataTable();
		var categoryIndex = this.getCategoryIndex();
		
		var categoryScale = this.getCategoryScale();
		var valueScale = this.getValueScale();
		
		var chartSize = this.getChartSize();
		var chartWidth = chartSize.width;
		var chartHeight = chartSize.height;
		
		var colors = this.getSeriesColors();
		var switchAxes = this.getSwitchAxes();
		
		var seriesNum = this.getSeriesColumnIndices().length;
		
		var csw = categoryScale.interval / (categoryScale.max - categoryScale.min);
		var cw = csw / seriesNum / 2;
		
		
		for (var r = 0; r < dataTable.getNumberOfRows(); r++) {

			// category values
			var categoryValue = r;
			if (categoryIndex != null) {
				categoryValue = dataTable.getCell(r, categoryIndex);
				if (dataTable.getColumnType(categoryIndex) == 'date') {
					categoryValue = categoryValue.getTime();
				}
				if (dataTable.getColumnType(categoryIndex) == 'string') {
					categoryValue = r;
				}
			}

			
			
			
			
			// series values
			var i = 0;
			for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
				
				if (c != categoryIndex) {

					var columnId = dataTable.getColumnId(c);
					
					var value = dataTable.getCell(r, c);
					if (dataTable.getColumnType(c) == 'date') {
						value = value.getTime();
					}

					// get percent by bounds
					var pc = (categoryValue - categoryScale.min) / (categoryScale.max - categoryScale.min);
					var pv = (value - valueScale.min) / (valueScale.max - valueScale.min);

					var pc = pc + (csw - seriesNum * cw) / 2 + i * cw;
					
					var px = switchAxes ? pv : pc;
					var py = switchAxes ? pc : pv;
					
					// upscale by chart size
					
					
					var x, y, w, h;
					
					if (switchAxes) {
						
						x = 0;
						y = Math.floor(py * chartHeight);
						
						w = px * chartWidth;
						h = cw * chartHeight;
						
					} else {
						x = Math.floor(px * chartWidth);
						y = Math.floor(chartHeight - py * chartHeight);

						w = cw * chartWidth;
						h = chartHeight - y;
					}

					var rect = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "rect");
					rect.setAttribute('x', x);
					rect.setAttribute('y', y);
					rect.setAttribute('width', w);
					rect.setAttribute('height', h);
					rect.setAttribute('fill', colors[i]);
					
					
					this.chartLayer.appendChild(rect);
					
					i++;
				}
				
			}
			
		}
		
		
		if (switchAxes) {
			this.yAxisTicksLayer.setAttribute('transform', 'translate(0,-' + csw / 2 * chartHeight + ')');
		} else {
			this.xAxisTicksLayer.setAttribute('transform', 'translate(' + csw / 2 * chartWidth + ',0)');
		}
		
		
	}
	
	return ColumnChart;
})();
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
	 * BarChart class. The bar chart is a column chart that is initialized with the switchAxes property set to true.
	 * @class benignware.visualization.BarChart  
	 * @extends benignware.visualization.ColumnChart
	 */
    
	function BarChart() {
		_parent.apply(this, arguments);
		this.setSwitchAxes(true);
	}
	
	Class.register("benignware.visualization.BarChart", BarChart);
	
	Class.extend(ColumnChart, BarChart);
	_parent = Class.getParent(BarChart);

	return BarChart;
})();
(function() {
	
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var VisualChart = Class.require("benignware.visualization.VisualChart");
	var DataTable = Class.require("benignware.visualization.DataTable");
	
	var _parent;

    
    /**
	 * PieChart class
	 * @class benignware.visualization.PieChart  
	 * @extends benignware.visualization.VisualChart
	 */
    
	function PieChart() {
		
		_parent.apply(this, arguments);
		
	}
	
	Class.register("benignware.visualization.PieChart", PieChart);
	
	Class.extend(VisualChart, PieChart);
	_parent = Class.getParent(PieChart);
	
	
	/**
	 * builds the legend items.
	 * @protected
	 * @method _buildLegendItems
	 * @return {Array} an array containing legend items
	 */
	PieChart.prototype._buildLegendItems = function() {
		var items = [];
		var categoryIndex = this.getCategoryIndex();
		var colors = this.getSeriesColors();
		var dataTable = this.getDataTable();
		for (var r = 0; r < dataTable.getNumberOfRows(); r++) {
			var label = dataTable.getCell(r, categoryIndex);
			var color = colors[r];
			items.push({
				label: label, 
				bullet: {
					type: 'rect', 
					style: {
						fill: color
					}
				}
			});
		}
		return items;
	}
	
	PieChart.prototype._render = function() {
		_parent._render.call(this);
	}
	
	PieChart.prototype._renderChart = function(chartWidth, chartHeight) {
		
		var chartSize = this.getChartSize(); 
		var chartWidth = chartSize.width;
		var chartHeight = chartSize.height;
		
		var svgElem = this.chartLayer;
		
		var radius = Math.min(chartWidth, chartHeight) / 2;
		var x = chartWidth / 2;
		var y = chartHeight / 2;
		
		var circleElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "circle");
		circleElem.setAttribute("cx", x);
		circleElem.setAttribute("cy", y);
		circleElem.setAttribute("r", radius);
		circleElem.setAttribute("fill", "#afafaf");
		svgElem.appendChild(circleElem);

		var categoryIndex = this.getCategoryIndex();

		var total = 0;
		var min = null;
		var max = null;
		var values = [];
		var dataTable = this.getDataTable();
		for (var r = 0; r < dataTable.getNumberOfRows(); r++) {
			
			for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
				
				var cell = dataTable.getCell(r, c);
				var value = parseFloat(cell);
				if (c != categoryIndex) {
					min = min != null ? Math.min(min, value) : value;
					max = max != null ? Math.max(max, value) : value;
					total+= value;
					values.push(value);
				}
			}
		}
		
		var colors = this.getSeriesColors();
		var lx = x, ly = y - radius;
		var value = 0;
		var labelPoints = [];
		var labelRadius = radius * 0.75; 
		var angle = 0;
		for (var i = 0; i < values.length; i++) {
			// render section
			value+= values[i];
			var p = value / total;
			var radians = p * Math.PI * 2;
			var vx = x + Math.sin(radians) * radius;
			var vy = y - Math.cos(radians) * radius;
			var pathElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path");
			var pathString = "M" + x + " " + y + " L" + lx + " " + ly + " A" + radius + "," + radius + " 0 0,1 " + vx + "," + vy + " Z";
			pathElem.setAttribute("d", pathString);
			var color = colors[i] || 'black';
			pathElem.setAttribute('style', "fill-opacity: 1;");
			pathElem.setAttribute("stroke", 'white');
			pathElem.setAttribute("stroke-width", '2');
			pathElem.setAttribute("fill", color);
			svgElem.appendChild(pathElem);
			lx = vx;
			ly = vy;
			// render label
			var a = angle + (radians - angle) / 2;
			var ax = x + Math.sin(a) * labelRadius;
			var ay = y - Math.cos(a) * labelRadius;
			angle = radians;
			var textElem = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "text");
			var color = colors[i] || 'black';
//			textElem.setAttribute('fill', "black");
			textElem.setAttribute('x', ax);
			textElem.setAttribute("y", ay);
			textElem.setAttribute("text-anchor", "middle");
			var labelText = (values[i] / total * 100).toFixed(1);
			var labelTextNode = this.ownerDocument.createTextNode(labelText);
			textElem.appendChild(labelTextNode);
			svgElem.appendChild(textElem);
		}	
		
	}
	
	
	return PieChart;
})();
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
	
	var BaseChart = Class.require("benignware.visualization.BaseChart");
	
	var _parent;
    
    

    /**
	 * html table chart
	 * @class benignware.visualization.TableChart  
	 */
    
	function TableChart() {
		_parent.apply(this, arguments);
	}
	
	Class.register("benignware.visualization.TableChart", TableChart);
	
	Class.extend(BaseChart, TableChart);
	_parent = Class.getParent(TableChart);

	
	/**
	 * stores a reference to the component's html table element.
	 * @protected
	 * @property __tableElem
	 * @return {Element} the component's html table elem.
	 */
	TableChart.prototype._tableElem = null;
	
	TableChart.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
		this._tableElem = this.ownerDocument.createElement('table');
		this.appendChild(this._tableElem);
	}

	TableChart.prototype._render = function() {
		
		var doc = this.ownerDocument;
		
		var table, tr, th, td;
		
		table = this._tableElem;
		table.style.fontFamily = "Arial";
		table.style.fontSize = "12px";
		table.style.border = "1px solid #efefef";
		table.style.borderCollapse = "collapse";
		table.style.marginBottom = "1.5em";
		
		this._tableElem.innerHTML = "";
		
		var dataTable = this.getDataTable();
		var title = this.getTitle();

		if (title) {
			var caption = doc.createElement('caption');
			caption.style.fontSize = "16px";
			caption.style.fontWeight = "bold";
			caption.style.textAlign = "left";
			caption.style.paddingBottom = "3px"
			caption.innerHTML = title;
			table.appendChild(caption);
		}
		tr = doc.createElement('tr');
		this._tableElem.appendChild(tr);
		
		for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
			var label = dataTable.getColumnLabel(c);
			if (label) {
				th = doc.createElement('th');
				th.style.border = "1px solid #dfdfdf";
				th.style.textAlign = "center";
				th.style.backgroundColor = '#efefef';
				th.style.wordWrap = "break-word";
				th.style.padding = "5px";
				th.innerHTML = label;
				tr.appendChild(th);
			}
			
		}
		
		for (var r = 0; r < dataTable.getNumberOfRows(); r++) {
			tr = doc.createElement('tr');
			this._tableElem.appendChild(tr);
			var even = r % 2;
			for (var c = 0; c < dataTable.getNumberOfColumns(); c++) {
				var cell = dataTable.getCell(r, c);
				var columnType = dataTable.getColumnType(c);
				var label = "";
				switch (columnType) {
								
					case 'date': 
					case 'number': 
						var value = columnType == 'date' ? new Date(cell) : cell;
						var pattern = dataTable.getColumnPattern(c);
						label = BaseChart.getFormattedValue(value, pattern);
						break;
						
					case 'string': 
						var row = dataTable.getNumberOfRows() - 1 - cell;
						label = dataTable.getCell(r, c);
						break;
				}
				td = doc.createElement('td');
				td.style.border = "1px solid #efefef";
				td.style.backgroundColor = even ? '#fafafa' : '';
				td.style.padding = "5px";
				td.style.textAlign = c == 0 ? "left" : "right";
				tr.appendChild(td);
				td.innerHTML = label;
			}
			if (r > 25) break;
		}
		
	}
	
	return TableChart;
})();
(function(){
	
	/**
	 * chart wrapper class
	 * @class benignware.visualization.ChartWrapper  
	 */
	var Class = benignware.core.Class;
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	
	function ChartWrapper(element, options) {
		
		
		
	}
	
	ChartWrapper.prototype.render = function() {

	}
	
	Class.register("benignware.visualization.ChartWrapper", ChartWrapper);

	return ChartWrapper;
})();
