/**
 * reads form elements into an array 
 * @param form
 * @returns {Array}
 */
function getFormArray(form) {
	
	var elements = form.elements;
	var options = [];
	var elements = form.elements;
	for (var i = 0; i < elements.length; i++) {
		var elem = elements[i];
		
		var name = elem.name;
		
		if (!name) continue;
		
		var value = elem.value;
		
		switch (elem.type) {
		
			case 'checkbox': 
				value = elem.checked;
				break;
				
			case 'number':
				value = parseFloat(elem.value);
				break;
		}
		
		var split = name.replace(/\]/g, '').split(/\[/); 
		
		var obj = options;

		var prop = name;
		for (var s = 0; s < split.length; s++) {
			prop = split[s];
			prop = !isNaN(parseInt(prop)) && isFinite(prop) ? parseInt(prop) : prop;
			if (split.length > 1 && s < split.length - 1) {
				if (!obj[prop]) {
					obj[prop] = [];
				}
				obj = obj[prop];
			}
		}
		
		obj[prop] = value;
		
	}
	
	return options;
}


function arrayToObject(array) {
	var result = array instanceof Array && array.length > 0 ? [] : {};
	for (var x in array) {
		var value = array[x];
		result[x] = typeof value == 'object' || value instanceof Array ? arrayToObject(array[x]) : array[x];
	}
	return result;
}

function getFormObject(form) {
	return arrayToObject(getFormArray(form));
}

/**
 * formats a decimal number
 * @param number
 * @param pattern
 * @returns
 */

//TODO: proper implementation with full support
function formatNumber(number, pattern) {
	pattern = pattern || "#.##";
	var match = new RegExp(/(#*)(?:\.(#+))?/).exec(pattern);
	if (match) {
		var decimalPlaces = match[2] ? match[2].length : 0;
		var numberString = number.toFixed(decimalPlaces).toString();
		string = pattern.substring(0, match.index) + numberString + pattern.substring(match.index + match[0].length);
		
		return string;
	}
	return number.toString();
}

function isNumeric(string) {
	return string.match(/^(-?\d+[\.]?\d*)$/);
}

/**
 * parses a decimal number by the given mask
 * @param string
 * @param pattern
 * @returns
 */
//TODO: proper implementation with full support
function parseNumber(string, pattern) {
	
	if (isNumeric(string)) {
		return parseFloat(string);
	}
	
	if (!isNaN(parseFloat(string)) && isFinite(string)) {
		return value;
	}
	
	var isDecimalPattern = pattern && pattern.lastIndexOf(".") >= 0;
	if (isDecimalPattern) {
		
		var sm = new RegExp(/(-?\d+[\., ]?\d*)/).exec(string);
		if (sm) {
			var split = sm[1].split(/\.|,| /);
			var decimalString = split.pop();
			var numString = split.join("");
			var value = decimalString ? parseFloat(numString + "." + decimalString) : parseInt(numString);
			return value;
		}
	}
	
	return 0;
}

/**
 * parses a date by the specified pattern
 * @param string
 * @param pattern
 * @returns
 */
//TODO: get rid of jquery
function parseDate(string, pattern) {
	try {
		return $.datepicker.parseDate( pattern, string );
	} catch(e) {
//		console.warn(e);
	}
	return string;
}

// datatable helpers

// column type detection
function detectColumnType(value, pattern) {
	var type = typeof(value);
	switch(type) {
		case 'number': 
			return type;
			
		case 'object': 
			if (value instanceof Date) {
				return 'date';
			}
			return type;
			
		case 'string': 
			
			// date
			var date = null;
			if (pattern) {
				date = parseDate(value, pattern);
			} else {
				date = new Date(value);
			}
			if (date && date.getTime() === date.getTime()) {
				return 'date';
			}
			
			// number
			var number = parseNumber(value, pattern);
			if (!isNaN(number)) {
				return 'number';
			}
	}
	return type;
}


/**
 * parses a 2d-array into a data-table-object with the specified format option
 * @param array
 * @param options
 * @returns {DataTable}
 */
function getDataTableFromArray(array, options) {
	
	options = options || {};
	options.columns = options.columns || [];
	options.firstRowAsColumnLabels = typeof options.firstRowAsColumnLabels == 'boolean' ? options.firstRowAsColumnLabels : true;
	
	var rows = array.slice();
	
	var dataTable = new DataTable();
	var numCols = rows[0].length;
	var firstRow = options.firstRowAsColumnLabels;
	
	for (var c = 0; c < numCols; c++) {
		var columnOptions = options.columns[c] ? options.columns[c] : options.columns[c] = {};
		var value = firstRow ? rows[1][c] : rows[0][c];
		var label = firstRow ? rows[0][c] : null;
		var pattern = columnOptions.pattern;
		var type = columnOptions.type || detectColumnType(value, pattern);
		dataTable.addColumn(type, label, pattern);
	}
	
	if (firstRow) {
		rows.shift();
	}
	
	for (var r = 0; r < rows.length; r++) {
		
		var row = rows[r];
		var cells = [];
		
		// get rows
		for (var c = 0; c < row.length; c++) {
			
			var value = row[c];
			
			var pattern = options.columns[c].pattern;
			var type = dataTable.getColumnType(c);
			
			// parse formatted values
			switch (type) {
				
				case 'date': 	
					value = parseDate(value, pattern);
					
					break;
					
				case 'number':
					value = parseNumber(value, pattern);	
					break;
			}
			
			cells.push(value);
		}
		
		dataTable.addRow(cells);
		
	}
	
	return dataTable;
}

