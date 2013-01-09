(function() {
	
	var Class = benignware.core.Class;
	
	/**
	 * Array utility methods
	 * @class ArrayUtils
	 */
	function ArrayUtils() {
	}
	
	Class.register("benignware.util.ArrayUtils", ArrayUtils);
	
	ArrayUtils.intersect = function(array1, array2) {
		var a1 = array1.slice(0);
		var a2 = array2.slice(0);
		var result = [];
		for (var i=0;i<a1.length;i++){ 
	        for (var j=0;j<a2.length;j++) if (a1[i]==a2[j]) {
				a2.splice(j--, 1);
				result.push(a1[i]);
				break;
			}
	    }
		return result;
	}
	
	ArrayUtils.subtract = function(array1, array2) {
		var a1 = array1.slice(0);
		var a2 = array2.slice(0);
		for (var i=0;i<a1.length;i++){ 
			var found = false;
	        for (var j=0;j<a2.length;j++) if (a1[i]==a2[j]) {
				//a2.splice(j--, 1);
				found = true;
				break;
			}
			if (found) {
				a1.splice(i--, 1);
			}
	    }
		return a1;
	}
	
	/**
	 * checks if the array contains the specified value
	 * @static
	 * @method contains
	 * @param {Array} array
	 * @param {Object} value
	 */
	ArrayUtils.contains = function(array, value) {
		for (var i = 0; i < array.length; i++) if (array[i] == value) return true;
		return false;
	}
	
	ArrayUtils.indexOf = function(array, value) {
		for (var i=0;i<array.length;i++) if (array[i]==value) return i;
		return -1;
	}
	
	ArrayUtils.remove = function(a, value) {
		for (var i = 0; i < a.length; i++) if (a[i] == value) a.splice(i--, 1);
		return a;
	}
	
	ArrayUtils.unique = function(a) {
		var result = typeof a == "array" ? [] : {};
		for (var x in a) {
			if (!ArrayUtils.contains(result, a[x])) {
				result[x] = a[x];
			}
		}
		return result;
	}
	
	ArrayUtils.merge = function(a1, a2) {
		var result = [];
		for (var i = 0; i < arguments.length; i++) {
			var a = arguments[i];
			for (var x in a) {
				if (parseInt(x)) {
					result.push(a[x]);
				} else {
					result[x] = a[x];
				}
			}
		}
		return result;
	}
	
	ArrayUtils.concat = function(a1, a2) {
		return a1.concat(a2);
	}
	
	ArrayUtils.equals = function(a1, a2) {
		var result = [];
		if (typeof(a1) != typeof(a2)) return false;
		if (typeof(a1) == "object" || typeof(a1) == "array") {
			for (var x in a1) {
				var res = ArrayUtils.equals(a1[x], a2[x]);
				if (!res) return false;
			}
			for (var x in a2) {
				var res = ArrayUtils.equals(a2[x], a1[x]);
				if (!res) return false;
			}
			return true;
		}
		return (a1 == a2);
	}
	
	ArrayUtils.clone = function(a) {
		var result = [];
		for (var x in a) {
			var child = a[x];
			if (typeof(child) == "object" || typeof(child) == "array") {
				result[x] = ArrayUtils.clone(child);
			} else {
				result[x] = child;
			}
		}
		return result;
	}
	
	ArrayUtils.fill = function(a, len, fill) {
		var result = [];
		for (var i = 0; i < len; i++) {
			result[i] = i < a.length ? a[i] : fill ? fill : a[i % a.length];
		}
		return result;
	}
	
	ArrayUtils.filter = function(array, func) {
		var result = [];
		for (var i = 0; i < array.length; i++) {
			var obj = array[i]
			if (func(obj)) {
				result.push(obj);
			}
		}
		return result;
	}
	
	return ArrayUtils;
	
})();