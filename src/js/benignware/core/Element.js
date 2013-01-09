(function() {
	
	// class imports
	var Class = benignware.core.Class;
	var Event = Class.require('benignware.core.Event');
	var EventDispatcher = Class.require('benignware.core.EventDispatcher');
	var StringUtils = Class.require('benignware.util.StringUtils');
	
	// init parent
	var _parent;
	
	// private helper methods
	
	function startsWith(string, sequence) {
		return (string.indexOf(sequence) == 0);
	}
	
	function toCamelCase(name) {
		var split = name.split("-");
		var result = "";
		for (var i = 0; i < split.length; i++) {
			var word = split[i];
			result+= i == 0 || !word.length ? word : word.substring(0, 1).toUpperCase() + word.substring(1);
		}
		return result;
	}
	
	/**
	 * Base class for all ui elements
	 * @package benignware.core
	 * @class Element
	 * @extends benignware.core.EventDispatcher
	 */
	
	function Element() {
		var __parent = _parent.apply(this, arguments);
	}
	
	Class.register('benignware.core.Element', Element);
	
	Class.extend(EventDispatcher, Element);
	_parent = Class.getParent(Element);

	/**
	 * points to the clazz the object has been initialized with
	 * @property __constructor
	 */
	Element.prototype.__constructor = Element;
	
	
	/**
	 * the _construct method is called when the object is initialized.
	 * @protected
	 * @method _construct
	 */
	Element.prototype.__construct = function() {
	}
	
	/**
	 * creates an element of the specified class
	 * @static
	 * @method create
	 * @param {Document} document the owner document of the element.
	 * @param {benignware.core.Class} clazz the element class
	 * @return {Element} the created element.
	 */
	Element.create = function(doc, clazz, args) {
		
		if (arguments.length == 1) {
			clazz = arguments[0];
			doc = document;
		}
		
		if (arguments.length == 0) {
			clazz = Element;
			doc = document;
		}

		// 
		var tagName = "div";
		
		if (typeof(clazz) == "string") {
			var c = Class.getClass(clazz);
			if (c) {
				clazz = c;
			} else {
				tagName = clazz;
			}
		}
		
		if (typeof(clazz) == "function" && clazz.prototype.tagName) {
			tagName = clazz.prototype.tagName;
		}
		
		var elem = doc.createElement(tagName);
		if (typeof(clazz) == "function") {
			Element.initialize(elem, clazz, args);
		}
		return elem;
	}
	
	/**
	 * initializes an element with the specified class
	 * @static
	 * @method initialize
	 * @param element the existing element.
	 * @param clazz the class of the element. 
	 * @return {Element} the initialized element.
	 */
	Element.initialize = function(element, clazz, args) {

//		console.log("Element::initialize(", element, clazz, args, ")");
		
		if (!element) {
			return;
		}
		
		if (element.__constructor) {
			return element;
		}
		
		doc = document;
		element = typeof(element) == "string" ? doc.getElementById(element) : element;
		
		if (!element || typeof(element) != "object") {
			// element is not defined
			return null;
		}

		clazz = typeof(clazz) == "string" ? Class.getClass(clazz) : clazz;
		
		if (!clazz) {
			return null;
		}
		
		// Object.initialize
		var object = element;
			
		if (typeof object == "object" && typeof clazz == "function") {
			
			if (object.constructor != clazz && object.__constructor != clazz) {
				
				// copy the prototype
				for (var x in clazz.prototype) {
//					if (typeof(object[x]) == "undefined" || typeof(object[x]) == "function") {
						try {
							object[x] = clazz.prototype[x];
						} catch (e) {
							
						}
//					}
				}
			}
	
			object.__constructor = clazz;
			
			// call the constructor
			clazz.apply(object, args);
			
			// call _construct
			var _construct = object.__construct ? object.__construct : object._construct && object._construct.__protected ? object._construct : null;
			if (_construct) {
				_construct.apply(object, args);
			}


		}
		
		return object;
	}
	
	
	/**
	 * registers an event listener for the specified event type on an element.
	 * @static
	 * @method addEventListener
	 * @param {Element} element the element
	 * @param {String} whichEvent the type of the event
	 * @param {Function} handler the listener function
	 * @param {Boolean} useCapture
	 */
	Element.addEventListener = (function() {
		if (window.addEventListener) {
			return function(element, whichEvent, handler, useCapture) {
				element.addEventListener(whichEvent, handler, useCapture);
			}
		} else if (window.attachEvent) {
			return function (element, whichEvent, handler, useCapture) {
				element.attachEvent('on' + whichEvent, handler);
			}
		}
	})();
	 
	/**
	 * unregisters an event listener for the specified event type on an element.
	 * @static
	 * @method removeEventListener
	 * @param {Element} element the element
	 * @param {String} whichEvent the type of the event
	 * @param {Function} handler the listener function
	 * @param {Boolean} useCapture 
	 */
	Element.removeEventListener = (function() {
		if (window.removeEventListener) {
			return function(element, whichEvent, handler, useCapture) {
				element.removeEventListener(whichEvent, handler, useCapture);
			}
		} else if (window.detachEvent) {
			return function (element, whichEvent, handler, useCapture) {
				element.detachEvent('on' + whichEvent, handler);
			}
		}
	})()
	
	/**
	 * dispatches the specified event on an element. 
	 * @static
	 * @method dispatchEvent
	 * @param {Element} element the element on which the event should be dispatched. 
	 * @param {benignware.core.Event} event an event object.
	 */
	Element.dispatchEvent = (function() {
		if (window.dispatchEvent) {
			return function (element, event) {
				return element.dispatchEvent(event);
			}
		} else if (window.fireEvent) {
			return function (element, event) {
				return element.fireEvent(event.type, event);
			}
		}
	})();
	
	
	/**
	 * Cross-browser implementation of the getComputedStyle method.
	 * @static
	 * @method getComputedStyle
	 * @param {benignware.core.Element} element
	 * @param {String} styleName
	 * @return {String} the style value
	 */
	Element.getComputedStyle = function(element, styleName) {
		styleName = StringUtils.toCamelCase(styleName);
		var doc = element.ownerDocument || document;
		if (doc != null) {
			if (doc.defaultView && doc.defaultView.getComputedStyle) {
				var style = doc.defaultView.getComputedStyle(element, "");
				if (style) {
					return style[styleName];
				}
			}
			if (element.currentStyle) {
				return element.currentStyle[styleName];
			}
		}
		
		return null;
	}
	
	
	/**
	 * returns dataset object
	 * @static
	 * @method getDataset
	 * @param {Element} elem
	 */
	Element.getDataset = function(element) {
		
		
		var dataset = {}
		var attributes = element.attributes;
		for (var i = 0; i < attributes.length; i++) {
			
			var attribute = attributes[i];
			if (attribute.name.indexOf("data-") == 0) {
				var name = toCamelCase(attribute.name.substring(5));
				var value = attribute.value;
				var numValue = parseFloat(value);
				value = !isNaN(numValue) ? numValue : value;
				dataset[name] = value;
			}
			
		}

		return dataset;
	}
	
	
	/**
	 * sets a global flag whether to parse the dom on document ready.
	 * @sta
	 */
	
	Element.parseOnReady = true;
	
	/**
	 * traverse the dom for data-type attributes and initializes registered classes 
	 * @static
	 * @method parseDOM
	 * @param {Element} elem
	 */

	Element.parseDOM = function(element) {
		
		element = element.documentElement ? element.documentElement : element;
		
		var attributes = element.attributes;
		var type = null;

		for (var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];
			if (attribute.name.indexOf("data-") == 0) {
				var name = attribute.name.substring("data-".length);
				if (name == 'type') {
					type = attribute.value;
					break;
				}
			}
		}	
			
			
		var children = element.childNodes;
		
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.nodeType == 1) {
				Element.parseDOM(child);
			}
		}
		
		if (type) {
			
			// get class
			var clazz = Class.require(type);
			if (clazz) {
				// initialize
				element.removeAttribute("data-type");
				Element.initialize(element, clazz);
			}
		}
	}
	
	
	
	
	Element.getPosition = function (element, parent) {
//		console.log("GET POSITION", element)
		var pos = null;
		if (element && element == window) {
			pos = {x: 0, y: 0};
		}
		if (!element || !element.ownerDocument) {
			return null;
		}
		if (!pos) {
			var doc = element.ownerDocument;
			var docElem = doc.documentElement;
			var pos = {x:0, y:0}
//			if (docElem) {
//				pos = {x: -docElem.scrollLeft, y: -docElem.scrollTop}
//			}

			
			if (element) {
				var elem = element;
				do {
//					console.log("POS: ", pos, elem, elem.offsetLeft, elem.scrollLeft, elem.offsetTop, elem.scrollTop);
					pos.x += elem.offsetLeft;
					pos.y += elem.offsetTop;
	
//					pos.x -= elem.parentNode.scrollLeft;
//					pos.y -= elem.parentNode.scrollTop;
					
//					pos.x -= elem.scrollLeft;
//					pos.y -= elem.scrollTop;
					
//					console.log("POS: ", pos, elem, elem.offsetLeft, elem.scrollLeft, elem.offsetTop, elem.scrollTop);
					
				} while (elem = elem.offsetParent);
			}
			if (!parent) {
//				console.log(">> POS: ", pos);
				return pos;
			}
		}
		
		if (parent && parent != element) {
			var ppos = Element.getPosition(parent);
//			console.log("ADD PARENT POS: ", pos, ppos);
			pos = {x: pos.x - ppos.x, y: pos.y - ppos.y}
		}
//		console.log("RETURN POS: ", pos);
		return pos;
	} 
	
	
	/**
	 * returns an object with border metrics.
	 * @static
	 * @method getBorderMetrics
	 * @param {benignware.core.Element} element
	 * @param {String} metricType
	 * @return {Object} an object containing the properties 'top', 'left', 'right' and 'bottom'
	 */
	Element.getBorderMetrics = function (element, metricType) {
		var result = {top:0, left:0, right:0, bottom:0}
		var metricTypes = [];
		for (var i = 1; i < arguments.length; i++) {
			if (arguments[i] != undefined) metricTypes.push(arguments[i]);
		}
		if (metricTypes.length == 0) {
			metricTypes = ["border"];
		}
		for (var i = 0; i < metricTypes.length; i++) {
			var metricsType = metricTypes[i];
			if (metricsType) {
				var widthExt = (metricsType == "border") ? "-width" : "";
				for (var x in result) {
					var propName = metricsType + "-" + x + widthExt;
					var s = Element.getComputedStyle(element, propName);
					var v = parseFloat(s);
					v = (v) ? v : 0;
					result[x]+=v;
				}
			}
		}
		return result;
	}
	
	/**
	 * sets the size of the specified element.
	 * @static
	 * @method setSize
	 * @param {benignware.core.Element} element the target element
	 * @param {Number} width
	 * @param {Number} height
	 * @return {Object} An Object containing the width and height of the component as properties x and y.
	 */
	Element.setSize = function(element, width, height) {
		Element.setWidth(element, width); 
		Element.setHeight(element, height);
	}
	
	/**
	 * Retrieves width and height of the specified element.
	 * @static
	 * @method getSize
	 * @param {benignware.core.Element} element the target element
	 * @return {Object} An Object containing the width and height of the component as properties x and y.
	 */
	Element.getSize = function(element) {
		return {
			width: Element.getWidth(element), 
			height: Element.getHeight(element)
		}
	}
	
	/**
	 * sets width of the specified element.
	 * @static
	 * @method setWidth
	 * @param {Element} element
	 * @param {Number} width
	 */
	Element.setWidth = function(element, width) {
		var w = parseFloat(width);
		w = !isNaN(w) && w >= 0 ? w : 0;
		element.style.width = w + "px";
	}
	
	/**
	 * returns width of the specified element.
	 * @static
	 * @method getWidth
	 * @param {Element} element
	 * @return {Number} width
	 */
	Element.getWidth = function(element) {
//		if (typeof element.width != "undefined") {
//			return element.width;
//		}
		if (Element.getComputedStyle(element, 'display') == 'none') {
			return 0;
		}
		var ws = Element.getComputedStyle(element, 'width');
		var w = ws.indexOf("px") >= 0 ? parseFloat(ws) : 0;
		if (!w || isNaN(w)) {
			var m = Element.getBorderMetrics(element, "border", 'padding');
			w = element.offsetWidth - m.left - m.right;
		}
		return w > 0 ? w : 0;
	}
	
	/**
	 * sets height of the specified element.
	 * @static
	 * @method setHeight
	 * @param {Element} element
	 * @param {Number} height
	 */
	Element.setHeight = function(element, height) {
		var h = parseFloat(height);
		h = !isNaN(h) && h >= 0 ? h : 0;
		element.style.height = h + "px";
	}
	
	/**
	 * gets height of the specified element.
	 * @static
	 * @method getHeight
	 * @param {Element} element
	 * @return {Number} height
	 */
	Element.getHeight = function(element) {
//		if (typeof element.height != "undefined") {
//			return element.height;
//		}
		if (Element.getComputedStyle(element, 'display') == 'none') {
			return 0;
		}
		var hs = Element.getComputedStyle(element, 'height');
		
		var h = hs.indexOf("px") >= 0 ? parseFloat(hs) : 0;
		
		if (!h || isNaN(h)) {
			var m = Element.getBorderMetrics(element, 'border', 'padding');
			h = element.offsetHeight - m.top - m.bottom;
		}
		return h > 0 ? h : 0;
	}
	
	
	
	Element.setOuterWidth = function(element, width) {
		var b = Element.getBorderMetrics(element, 'margin', 'padding', 'border');
		Element.setWidth(element, width - b.left - b.right);
	}
	
	Element.getOuterWidth = function(element) {
		if (Element.getComputedStyle(element, 'display') == 'none') {
			return 0;
		}
		var width = Element.getWidth(element);
		var b = Element.getBorderMetrics(element, 'margin', 'padding', 'border');
		return width + b.left + b.right;
	}
	
	Element.setOuterHeight = function(element, height) {
		var b = Element.getBorderMetrics(element, 'margin', 'padding', 'border');
		Element.setHeight(element, height - b.top - b.bottom);
	}
	
	Element.getOuterHeight = function(element) {
		if (Element.getComputedStyle(element, 'display') == 'none') {
			return 0;
		}
		var height = Element.getHeight(element);
		var b = Element.getBorderMetrics(element, 'margin', 'padding', 'border');
		return height + b.top + b.bottom;
	}
	
	Element.getOuterSize = function(element) {
		return {
			width: Element.getOuterWidth(element), 
			height: Element.getOuterHeight(element)
		}
	}
	
	Element.getDocumentSize = function(doc) {
		doc = doc.document || doc.ownerDocument || document;
		var win = doc.defaultView;
		if (win) {
			if (typeof(win.innerWidth) != "undefined") {
				return {
					width: win.innerWidth, 
					height: win.innerHeight
				}
			} else if (doc.documentElement.clientWidth) {
				return {
					width: doc.documentElement.clientWidth, 
					height: doc.documentElement.clientHeight
				};
			} else {
				return {
					width: doc.getElementsByTagName('body')[0].clientWidth,
					height: doc.getElementsByTagName('body')[0].clientHeight
				};
			}
		}
		return {w: 0, h: 0};
	}
	
	
	Element.show = function(element) {
		element.style.display = "";
	}
	
	Element.hide = function(element) {
		element.style.display = "none";
	}
	
	
	/**
	 * adds a css selector to an element.
	 * @static
	 * @method addCSSName
	 * @param {Element} element an element
	 * @param {String} string a css selector
	 */
	Element.addCSSName = function(element, string) {
		if (element && typeof(element.className) == 'string' && string) {
			if (!Element.hasCSSName(element, string)) {
				element.className = element.className.length ? element.className + " " + string : string;
			}
		}
		
	}
	
	/**
	 * removes the specified css selector from an element.
	 * @static
	 * @method removeCSSName
	 * @param {Element} element an element
	 * @param {String} string a css selector
	 */
	Element.removeCSSName = function(element, string) {
		if (!element) return;
		var cssNames = Element.getCSSNames(element);
		for (var i = 0; i < cssNames.length; i++) {
			if (cssNames[i] == string) {
				cssNames.splice(i, 1);
				i--;
			}
		}
		element.className = cssNames.join(" ");
	}
	
	/**
	 * retrieves all css selectors of the element
	 * @static
	 * @method getCSSNames
	 * @param {Element} element an element
	 * @return {Array} an array containing css selectors
	 */
	Element.getCSSNames = function(element) {
		return element && element.className ? element.className.split(/\s+/) : [];
	}
	
	/**
	 * checks whether the element contains the specified css selector.
	 * @static
	 * @method hasCSSName
	 * @param {Element} element the element
	 * @return {Boolean} true, if the element contains the css selector.
	 */
	Element.hasCSSName = function(element, string) {
		var cssNames = Element.getCSSNames(element);
		for (var i = 0; i < cssNames.length; i++) {
			if (cssNames[i] == string) {
				return true;
			}
		}
		return false;
	}
	
	
	/**
	 * toggles the specified css selector on the element.
	 * @static
	 * @method toggleCSSName
	 * @param {Element} element
	 * @param {String} the css selector
	 */
	Element.toggleCSSName = function(element, string){
		if (Element.hasCSSName(element, string)) {
			Element.removeCSSName(element, string);
		} else {
			Element.addCSSName(element, string);
		}
	}
	
	var readyFlag = false;

	function ready() {
		if (!readyFlag) {
			readyFlag = true;
			// doc ready
			if (Element.parseOnReady) {
				Element.parseDOM(document);
			}
			
			Element.dispatchEvent(document, Event.create(document, 'ready', false, false));
		}
	}
	
	// TODO: check for duplicate imports

	Element.addEventListener(window, 'DOMContentLoaded', ready);
	Element.addEventListener(window, 'load', ready);
	
	return Element;
	
})();