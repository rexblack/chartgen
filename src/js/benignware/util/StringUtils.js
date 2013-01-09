(function() {
	
	var Class = benignware.core.Class;
	var ArrayUtils = Class.require('benignware.util.ArrayUtils');
	
	/**
	 * String utility methods
	 * @package benignware.util
	 * @class StringUtils
	 */
	function StringUtils() {}
	
	Class.register("benignware.util.StringUtils", StringUtils);
	
	/**
	 * finds a string in another
	 * @static
	 * @method contains
	 * @param {String} haystack
	 * @param {String} needle
	 * @returns
	 */
	StringUtils.contains = function(haystack, needle) {
		return haystack && needle ? haystack.indexOf(needle) >= 0 ? true : false : "";
	}

	/**
	 * trims whitespace from beginning and end of a string
	 * @static
	 * @method trim
	 * @param {String} string
	 * @returns
	 */
	StringUtils.trim = function(string) {
		if (string) {
			string = string.replace(/(\r\n|\n|\r)/gm,"");
			string = string.replace(/^(?:\s+|\n+)|(?:\s+|\n+)$/gm, '');
			return string;
		}
		return "";
	}
	
	/**
	 * trims slashes from beginning and end of a string
	 * @static
	 * @method trimSlashes
	 * @param {String} string
	 * @returns
	 */
	StringUtils.trimSlashes = function(string) {
		return string ? string.replace(/^\/+|\/+$/g, '') : '';
	}
	
	/**
	 * returns true if the specified string starts with the given sequence
	 * @static
	 * @method startsWith
	 * @param {String} string
	 * @param {String} sequence
	 * @returns {Boolean}
	 */
	StringUtils.startsWith = function(string, sequence) {
		return (string.indexOf(sequence) == 0);
	}
	
	/**
	 * returns true if the specified string ends with the given sequence
	 * @static
	 * @method endsWith
	 * @param {String} string
	 * @param {String} sequence
	 * @returns {Boolean}
	 */
	StringUtils.endsWith = function(string, sequence) {
		return (string.lastIndexOf(sequence) >= 0 && string.lastIndexOf(sequence) == string.length - sequence.length);
	}
	
	/**
	 * capitalizes a string
	 * @static
	 * @method capitalize
	 * @param {String} string
	 * @returns {String} the capitalized string
	 */
	StringUtils.capitalize = function(string) {
		return string.substring(0, 1).toUpperCase() + string.substring(1);
	}
	
	/**
	 * uncapitalizes a string
	 * @static
	 * @method capitalize
	 * @param {String} string
	 * @returns {String} the uncapitalized string
	 */
	StringUtils.uncapitalize = function(string) {
	 	return string.substring(0, 1).toLowerCase() + string.substring(1);
	}
	
	/**
	 * pluralizes a string
	 * @static
	 * @method pluralize
	 * @param {String} string
	 * @returns {String} the pluralized string
	 */
	StringUtils.pluralize = function(string) {
		if (StringUtils.endsWith(string, "y")) {
	 		return string.substring(0, string.length - 1) + "ies";
	 	} else {
	 		return string + "s";
	 	}
	}
	
	StringUtils.leftPad = function(str, len, character) {
		if (typeof(str) == "number") str = new String(str);
		if (typeof(character) == "undefined") character = "0";
		if (str.length > len) return str;
		var chStr = "";
		for (var i = 0; i < len - str.length; i++) {
			chStr+= character;
		}
		return chStr + str;
	}
	
	
	/* Conversion */
	
	/**
	 * returns a camel case string
	 * @param {String} string
	 * @returns {String}
	 */
	StringUtils.toCamelCase = function(string) {
		var split = string.split("-");
		var result = "";
		for (var i = 0; i < split.length; i++) {
			var word = split[i];
			if (i == 0 || !word.length) {
				result+= word;
			} else {
				result+= word.substring(0, 1).toUpperCase() + word.substring(1);
			}
		}
		return result;
	}
	
	StringUtils.hyphenate = function(name) {
		var result = "";
		for (var i = 0; i < name.length; i++) {
			var ch = name.charAt(i);
			if (ch.match(/[a-zA-Z]/) && ch == ch.toUpperCase()) {
				result+= "-" + ch.toLowerCase();
			} else {
				result+= ch;
			}
		}
		return result;
	}
	
	StringUtils.toBoolean = function (str) {
		if (typeof(str)=="string") {
			return (str == "true" || str == "1") ? true : false;
		}
		if (typeof(str)=="boolean") {
			return str;
		}
		return false;
	}
	
	StringUtils.toHex = function(num) {
		if (num == null) return "00";
		num = parseInt(num);
		if (num == 0 || isNaN(num)) return "00";
		num = Math.max(0, num); 
		num = Math.min(num, 255);
		num = Math.round(num);
		return "0123456789ABCDEF".charAt((num - num%16) / 16)
		     + "0123456789ABCDEF".charAt(num%16);
	}
	
	StringUtils.toHexColor = function(r, g, b) {
		return "#" + StringUtils.toHex(r) + StringUtils.toHex(g) + StringUtils.toHex(b);
	}
	
	StringUtils.toRGB = function(hexColor) {
		var r, g, b;
		hexColor = StringUtils.trim(hexColor);
		if (StringUtils.startsWith(hexColor, 'rgb')) {
			var p = /rgb\(([0-9]*)\s*,\s*([0-9]*)\s*,\s*([0-9]*)\)/;
			var reg = new RegExp( p );
			var m = reg.exec(hexColor);
			if (m) {
				r = parseInt(m[1]);
				g = parseInt(m[2]);
				b = parseInt(m[3]);
				return {r: r, g: g, b: b}
			}
		}
		var h = hexColor.charAt(0) == "#" ? hexColor.substring(1) : hexColor;
		r = parseInt(h.substring(0, 2), 16);
		g = parseInt(h.substring(2, 4), 16);
		b = parseInt(h.substring(4, 6), 16);
		return {r: r, g: g, b: b}
	}
	
	StringUtils.br2nl = function (str) {
		return str.replace(/<\s*br\s*\/?\s*>/gi, "\n");
	}
	
	StringUtils.nl2br = function (str) {
		return str.replace(/\n/gi, "<br/>");
	}
	
	StringUtils.stripTags = function(str) {
		var matchTag = /<(?:.|\s)*?>/g;
        return str.replace(matchTag, "");
	}
	
	StringUtils.jsonDecode = function(str) {
		var json = null;
		if (JSON && JSON.parse) {
			try {
				json = JSON.parse(str);
			} catch(e) {
				json = null;
			}
		}
		if (!json) {
			var trim = StringUtils.trim(str);
			if (trim) {
				if ((trim.indexOf("{") == 0 || trim.indexOf("[") == 0) && (trim.lastIndexOf("}") == trim.length - 1 || trim.lastIndexOf("]") == str.length - 1)) {
					json = eval ("(" + trim + ")");
				}
			}
		}
		return json;
	}
	
	
	
	// string formatting
	
	StringUtils.parseDate = function(string) {  
		var date = new Date();  
		var parts = String(string).split(/[- :]/);  
		date.setFullYear(parts[0]);  
		date.setMonth(parts[1] - 1);  
		date.setDate(parts[2]);  
		date.setHours(parts[3]);  
		date.setMinutes(parts[4]);  
		date.setSeconds(parts[5]);  
		date.setMilliseconds(0);  
		return date;  
	}  
	
	// thanks: http://dzone.com/snippets/javascript-formatdate-function
	StringUtils.formatDate = function (formatDate, formatString) {
//		console.log("StringUtils::formatDate", formatDate, formatString);
		if (formatDate instanceof Date) {
			var months = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
			var yyyy = formatDate.getFullYear();
			var yy = yyyy.toString().substring(2);
			var m = formatDate.getMonth() + 1;
//			console.log("FORMAT DATE GET MONTH", m);
			var mm = m < 10 ? "0" + m : m;
			var mmm = months[m];
			var d = formatDate.getDate();
			var dd = d < 10 ? "0" + d : d;
			
			var h = formatDate.getHours();
			var hh = h < 10 ? "0" + h : h;
			var n = formatDate.getMinutes();
			var nn = n < 10 ? "0" + n : n;
			var s = formatDate.getSeconds();
			var ss = s < 10 ? "0" + s : s;

			formatString = formatString.replace(/yyyy/i, yyyy);
			formatString = formatString.replace(/yy/i, yy);
			formatString = formatString.replace(/mmm/i, mmm);
			formatString = formatString.replace(/mm/i, mm);
			formatString = formatString.replace(/m/i, m);
			formatString = formatString.replace(/dd/i, dd);
			formatString = formatString.replace(/d/i, d);
			formatString = formatString.replace(/hh/i, hh);
			formatString = formatString.replace(/h/i, h);
			formatString = formatString.replace(/ii/i, nn);
			formatString = formatString.replace(/i/i, n);
			formatString = formatString.replace(/ss/i, ss);
			formatString = formatString.replace(/s/i, s);

			return formatString;
		} else {
			return "";
		}
	}
	
	
	StringUtils.formatNumber = function(number, mask) {
		mask = mask || "#.##";
		var match = new RegExp(/(#+)(?:\.(#+))?/).exec(mask);
		if (match) {
			var decimalPlaces = match[2] ? match[2].length : 0;
			var numberString = number.toFixed(decimalPlaces).toString();
			if (match[2] && match[2].match(/#+/)) {
				var f = parseFloat(numberString);
				return f.toString();
			}
			string = mask.substring(0, match.index) + numberString + mask.substring(match.index + match[0].length);
			return string;
		}
		return number.toString();
	}
	
	
	/* Currency formatting */
	StringUtils.formatCurrency = function(number, options) {
		var sep = ".", del = ",", unit = "$", prep = false, prec = 2;
		if (typeof(options) == "object") {
			sep = options['separator'] ? options['separator'] : sep;
			del = options['delimiter'] ? options['delimiter'] : del;
			unit = options['unit'] ? options['unit'] : unit;
			prep = options['prepend'] ? options['prepend'] : prep;
			prec = options['precision'] ? options['precision'] : prec;
		} else {
			sep = arguments[1] ? arguments[1] : sep;
			del = arguments[2] ? arguments[2] : del;
			unit = arguments[3] ? arguments[3] : unit;
			prep = typeof(arguments[4]) != "undefined" && !arguments[4] ? false : true;
			prec = arguments[5] ? arguments[5] : prec;
		}
		var string = number.toFixed(prec).toString();
		var regexp = new RegExp(unit,'g');
		string = string.replace(regexp, '');
		var s = string.split('.');
		var intstr = "";
		for (var i = s[0].length - 1; i >= 0; i--) {
			var d = s[0].length - i;
			if (d > 0 && d % 4 == 0) {
				intstr = del + intstr;
			}
			intstr = s[0][i] + intstr;
		}
		var result = intstr + sep + s[1];
		result = prep ? unit + result : result + unit;
		return result;
	}
	
	/* VALIDATION */
	
	StringUtils.isEmail = function(str) {
		return str.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
	}
	
	StringUtils.isFile = function(str) {
		var v = new RegExp();
		v.compile(/[^,{}]*\.[\w]+(?:\?.*)?$/gi);
		return v.test(str);
	}
	
	StringUtils.isUrl = function (string) {
		var v = new RegExp();
		v.compile("^(?:[A-Za-z]+://|/)?[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&\?\/.=]+$"); 
    	return v.test(StringUtils.trim(string));
	}
	
	StringUtils.isAbsoluteUrl = function (string) {
		if (StringUtils.isUrl(string)) {
			
		} 
		return false;
	}
	
	StringUtils.isRootUrl = function (string) {
		if (StringUtils.isUrl(string) && StringUtils.startsWith(StringUtils.trim(string), "/")) {
			return true;
		} 
	}
	
	StringUtils.isRelativeUrl = function (string) {
		if (StringUtils.isUrl(string) && !StringUtils.startsWith(StringUtils.trim(string), "/") && !StringUtils.parseURL(string).host) {
			return true;
		}
		return false;
	}
	
	StringUtils.isLocalUrl = function (string) {
		if (StringUtils.startsWith(string, "/")) {
			return true;
		}
		var info = StringUtils.parseURL(string);
		if (!info.host || info.host == window.location.host) {
			return true;
		}
		return false;
	}
	
	StringUtils.getFileName = function (url) {
		var a = url.split("/");
		return a.pop();
	}
	
	StringUtils.getFileExtension = function (url) {
		var fileName = StringUtils.getFileName(url);
		if (fileName) {
			var a = fileName.split(".");
			return a.pop();
		}
		return null;
	}
	
	StringUtils.getDirectoryName = function (url) {
		var a = url.split("/");
		a.pop();
		return a.join("/");
	}
	
	/**
	 * Extracts the specified parameter from an url.
	 * @method parseURL
	 * @param {String} str
	 * @param {String} name
	 */
	
	StringUtils.parseURL = function(url) {
		var result = {protocol: "", host: "", pathname:"", queryString:"", params:[]};
		var pattern = /^\s*(?:([a-z]*)\:\/\/([^\\\/]*))?(.*)?(.*)/i;
		var regex = new RegExp( pattern );
		var match = regex.exec(url);
		if (match) {
			result.protocol = match[1] || "";
			result.host = match[2] || "";
			result.pathname = match[3] || "";
			result.queryString = match[4] || "";
		}
		if (result.queryString) {
			var params = [];
			var queryString = result.queryString;
			queryString = StringUtils.startsWith(queryString, "?") ? queryString.substring(1) : queryString;
			if (queryString) {
				
				var pairs = queryString.split("&");
				for (var i = 0; i < pairs.length; i++) {
					var pair = pairs[i].split("=");
					var name = decodeURIComponent(pair[0]);
					var value = decodeURIComponent(pair[1]);
					var match = new RegExp(/^([a-z0-9_-]*)\[(.*)\]$/).exec(name);
					if (match) {
						name = match[1];
						key = match[2];
						if (!params[name]) {
							params[name] = [];
						}
						if (key) {
							params[name][key] = value;
						} else {
							params[name].push(value);
						}
					} else {
						params[name] = value;
					}
				}
				
			}
			result.params = params;
		}
		var base = result.protocol ? result.protocol + "//" + result.host : "";
		base+= result.pathname;
		result.base = base;
		return result;
	}
	
	
	
	StringUtils.buildHTTPQuery = function(params, prefix, urlencoded) {
		urlencoded = typeof urlencoded == "boolean" ? urlencoded : true;
		var pairs = [];
	    for(var p in params) {
	        var k = prefix ? prefix + "[" + p + "]" : p, v = params[p];
	        if (!v.constructor || v.constructor == Object || v.constructor == String) {
	        	pairs.push(typeof v == "object" ? 
	    	        	StringUtils.buildHTTPQuery(v, k, urlencoded) :
	    	        		(urlencoded ? encodeURIComponent(k) : k) + "=" + (urlencoded ? encodeURIComponent(v) : v));
	        }
	        
	    }
	    return pairs.join("&");
	}
	
	StringUtils.buildURL = function(url, params, prefix, urlencoded) {
		var urlInfo = StringUtils.parseURL(url);
		var params = ArrayUtils.merge(urlInfo.params, params);
		if (urlInfo.host) {
			url = urlInfo.protocol + "://" + urlInfo.host + urlInfo.pathname;
		} else {
			url = urlInfo.pathname;
		}
		var queryString = StringUtils.buildHTTPQuery(params, prefix, urlencoded);
		url+= queryString ? "?" + queryString : "";
		return url;
	}
	
	return StringUtils;
})();