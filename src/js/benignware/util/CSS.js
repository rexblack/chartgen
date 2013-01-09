(function() {
	
	
	
	var Class = benignware.core.Class;
	var StringUtils = Class.require('benignware.util.StringUtils');
	var Element = Class.require("benignware.core.Element");
	
	var vendorPrefixes = ['Webkit', 'Moz', 'O', 'Ms'];
	
	/**
	 * CSS utility methods
	 * @class benignware.util.CSS
	 */
	
	function CSS() {
	}

	Class.register("benignware.util.CSS", CSS);
	
	var defaultStylesheet = null;
	
	/**
	 * registers a default style by inserting at the beginning of the document's head
	 * @static
	 * @method setDefaultStyle
	 * @param {String} cssSelector
	 * @param {String} styleName
	 * @param {String} styleValue
	 */
	CSS.setDefaultStyle = function(cssSelector, styleName, styleValue) {
		
		
		if (!defaultStylesheet) {
			
			// create default stylesheet
			var doc = document;
			var styleElement = doc.createElement("style");
			styleElement.setAttribute("type", "text/css");
			var headElement = doc.getElementsByTagName("head")[0];
			if (headElement != null) {
				if (headElement.childNodes.length) {
					headElement.insertBefore(styleElement, headElement.firstChild);
				} else {
					headElement.appendChild(styleElement);
				}
			}
			
			defaultStylesheet = styleElement.sheet;
		}
		
		
		if (styleName == "float") {
			styleName = document.documentElement.style.styleFloat ? 'styleFloat' : 'cssFloat';
		}
		
		CSS.setStyle(defaultStylesheet, cssSelector, styleName, styleValue);
	}
	
	
	CSS.setStyle = function(stylesheet, cssSelector, styleName, styleValue) {
		
		
		var camelCaseName = StringUtils.toCamelCase(styleName);
		var hyphenatedName = StringUtils.hyphenate(styleName);
		var cssRule = CSS.getRule(stylesheet, cssSelector);
		
		if (!cssRule) {
			
			var cssText = "" + hyphenatedName + ": " + styleValue + ";";
			CSS.addRule(stylesheet, cssSelector, cssText);
			cssRule = CSS.getRule(stylesheet, cssSelector);
			
		}

		
		if (!cssRule) return;
		
//		if (!cssRule.style[hyphenatedName]) {
//			cssRule.style[hyphenatedName] = styleValue;
//
//		}
//		if (!cssRule.style[camelCaseName]) {	

			cssRule.style[camelCaseName] = styleValue;
//		}
	}
	
	CSS.getRules = function (stylesheet) {
		// TODO: cache function
		try {
			if (stylesheet.rules) {
				return stylesheet.rules;
			} else if (stylesheet.cssRules) {
				return stylesheet.cssRules;
			}
		} catch (e) {}
		return null;
	}
	
	CSS.addRule = function (stylesheet, cssSelector, cssText) {
		// TODO: cache function
		
		try {
			if (stylesheet.addRule) {
				
				stylesheet.addRule(cssSelector, cssText);
			} else if (stylesheet.insertRule) {
				stylesheet.insertRule(cssSelector+" {"+cssText+"}", stylesheet.cssRules.length);
			}
		} catch (e) {
			
		}

	}
	
	CSS.getRule = function (stylesheet, cssSelector) {
		var rules = CSS.getRules(stylesheet);
		
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i];
			
			if (rule.selectorText.toLowerCase() == cssSelector.toLowerCase()) {
				
				return rule;
			}
		}
		return null;
	}
	
	
	
	CSS.matchSelector = function(element, selector) {
		
	}
	
	/**
	 * retrieves a vendor style name. 
	 * returns null, if the style isn't supported.
	 * @static
	 * @method getVendorStyle
	 * @param {String} styleName the style name
	 * @param {Boolean} hyphenated specifies whether the result should be hyphenated
	 * @return {String} the vendor style name
	 */
	CSS.getVendorStyle = (function() {
		
		
		var cache = [];
		
		var elem = document.createElement('div');
		document.documentElement.appendChild(elem);
		
		function getVendorStyle (styleName) {

			styleName = StringUtils.toCamelCase(styleName);
			
			result = null;
			
			if (typeof cache[styleName] != 'undefined') {
				result = cache[styleName];
			}
			
			if (!result) {
				if (typeof (elem.style[styleName]) == 'string') {
					cache[styleName] = styleName;
					result = styleName;
				}
			}
			
			if (!result) {
				var capitalized = styleName.substring(0, 1).toUpperCase() + styleName.substring(1);
				for (var i = 0; i < vendorPrefixes.length; i++) {
					var prop = vendorPrefixes[i] + capitalized;
					if (typeof elem.style[prop] == 'string') {
						cache[styleName] = prop;
						result = prop;
						break;
					}
				}
			}
			
			cache[styleName] = result;
			
			return result;
		}

		return getVendorStyle;
	})();
	
	CSS.isSupported = function(styleName) {
		return typeof CSS.getVendorStyle(styleName) == 'string';
	}

	CSS.getTransformMatrix = function(string) {
		var p = ['a', 'b', 'c', 'd', 'x', 'y'];
		if (typeof string == "string") {
			var re = new RegExp(/^matrix\(\s*(-?\d*),?\s*(-?\d*),?\s*(-?\d*),?\s*(-?\d*),?\s*(-?[\d\.]*)(?:px)?,?\s*(-?[\d\.]*)(?:px)?/);
			var match = string.match(re);
			if (match) {
				var result = {}
				for (var i = 0; i < p.length; i++) {
					result[p[i]] = parseInt(match[i + 1]);
				}
				return result;
			}
		}
		return {
			a: 1, b: 0, c: 0, d: 1, x: 0, y: 0
		}
	}
	
	CSS.getTextSize = function(element, text) {
		console.log("get text size", Element.getComputedStyle);
		var doc = element.ownerDocument;
		var testElem = doc.createElement("div");
		testElem.style.position = "absolute";
		testElem.style.fontSize = Element.getComputedStyle(element, "font-size");
		testElem.style.fontFamily = Element.getComputedStyle(element, "font-family");
		testElem.style.padding = "0px";
		testElem.style.margin = "0px";
		testElem.style.border = "1px solid black";
		doc.body.appendChild(testElem);
		testElem.innerHTML = text;
		var offsetWidth = testElem.offsetWidth - 2;
		var offsetHeight = testElem.offsetHeight - 2;
		doc.body.removeChild(testElem);
		return {
			width: offsetWidth, 
			height: offsetHeight
		}
	}
	
	return CSS;
	
})();