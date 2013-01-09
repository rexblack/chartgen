(function() {
	
	var Class = benignware.core.Class;
	
	var Event = Class.require('benignware.core.Event');
	var EventDispatcher = Class.require('benignware.core.EventDispatcher');
//
	var Delegate = Class.require('benignware.util.Delegate');
	var CSS = Class.require('benignware.util.CSS');
	var ArrayUtils = Class.require('benignware.util.ArrayUtils');
	var StringUtils = Class.require('benignware.util.StringUtils');
	var Element = Class.require('benignware.core.Element');
	var Timer = Class.require('benignware.util.Timer');
	// helper methods
	
	function toMilliseconds(timeString) {
		if (typeof timeString == "number") {
			// assume seconds
			return timeString;
		}
		// regex
		var up = /\s*(-?\d+\.?\d*)\s*(ms|s|m|h|d|M|y)?\s*/i;
		var match = up.exec(timeString);
		if (match) {
			var value = parseFloat(match[1]);
			var unit = parseFloat(match[2]);
			switch (unit) {
				case 'ms':
					return value;
				case 'm': 
					return value * 60 * 1000;
				case 'h': 
					return value * 60 * 60 * 1000;
				case 'd': 
					return value * 60 * 60 * 24 * 1000;
				case 'M': 
					// TODO: calendar year
					return value * 60 * 60 * 24 * 365.25 * 1000;
				case 'y': 
					return value * 60 * 60 * 24 * 365.25 * 12 * 1000;
				default: 
					// assume seconds
					return value * 1000;
				
			}
			if (!unit) {
				// no unit, assume seconds
				return parseFloat(value) * 1000;
			} else {
				
			}
		}
		return 0;
	}
	
	function parseUnit(string) {
		var match = /\s*(-?\d+\.?\d*)\s*(\w*|%)?\s*/i.exec(string);
		if (match && match[0]) {
			var value = parseFloat(match[0]);
			if (!isNaN(value)) {
				return {value: value, unit: match[2] ? match[2] : ""}
			}
		}
		return null;
	}
	
	function isElement(obj) {
		return obj && obj.tagName && typeof obj.style == "object";
	}
	
	function isStyle(obj, propertyName) {
		return obj.style && typeof obj.style[propertyName] == "string";
	}
	
	function getProperties(prop) {
		var propNames = [];
		if (typeof prop == 'string') {
			propNames = prop.split(",");
		} else if (typeof prop == 'object' && prop instanceof Array) {
			propNames = prop;
		}
		return propNames;
	}
	
	function setValues(obj, props, values, style) {
		style = typeof style != "undefined" ? style : true;
		values = ArrayUtils.fill(typeof values == 'object' && values instanceof Array ? values : [values], props.length);
		var isElem = isElement(obj);
		for (var i = 0; i < props.length; i++) {
			var name = props[i];
			var value = values[i];
			setValue(obj, name, value, style);
		}
	}
	
	function setValue(obj, name, value, style) {
		style = typeof style != "undefined" ? style : true;
		var isElem = isElement(obj);
		if (style && isElem && typeof obj.style[name] != "undefined") {
//			console.log("set style: ", name, value);
			obj.style[name] = value;
		} else if (typeof obj[name] != "undefined") {
			obj[name] = value;
		}
	}
	
	function getValues(obj, props) {
		var values = [];
		var isElem = isElement(obj);
		for (var i = 0; i < props.length; i++) {
			var prop = props[i];
			if (isElem && typeof obj.style[prop] != "undefined") {
				values[i] = Element.getComputedStyle(obj, prop);
			} else {
				values[i] = obj[prop];
			}
		}
		return values;
	}
	
	function getTransitionArguments(properties, startValue, endValue, duration, timingFunction) {
		var args = {
			startValue: ArrayUtils.fill(typeof startValue == 'object' && startValue instanceof Array ? startValue : [startValue], properties.length), 
			endValue: ArrayUtils.fill(typeof endValue == 'object' && endValue instanceof Array ? endValue : [endValue], properties.length), 
			duration: ArrayUtils.fill(typeof duration == 'object' && duration instanceof Array ? duration : [duration], properties.length, 0),  
			timingFunction: ArrayUtils.fill(typeof timingFunction == 'object' && timingFunction instanceof Array ? timingFunction : [timingFunction], properties.length)
		}
		// convert duration to milliseconds of type number 
		for (var i = 0; i < args.duration.length; i++) {
			var duration = args.duration[i];
			if (typeof duration == "number") {
				// assume seconds
				args.duration[i] = duration * 1000;
			} else if (typeof duration == "string") {
				args.duration[i] = toMilliseconds(duration);
			}
		}

		return args;
	}
	
	
	
	function getTransitionValues(args, time) {
		var values = [];
		for (var i = 0; i < args.propertyName.length; i++) {
			values[i] = getTransitionValue(args.startValue[i], args.endValue[i], time, args.duration[i], args.timingFunction[i]);
		}
		return values;
	}
	
	function getTransitionValue(startValue, endValue, time, duration, timingFunction) {
		
		if (time >= duration) {
			return endValue;
		}
		
		var func = getTimingFunction(timingFunction);

		var p = 0;
		if (typeof(func) == "function") {
			p = func(time, 0, 1, duration);
		} else {
			p = time / duration;
		}
		
		p = p < 0 ? 0 : p > 1 ? 1 : p;
		
		var result = null;
		
		if (typeof endValue == 'number') {
			
			// number
			startValue = parseFloat(startValue);
			result = startValue + (endValue - startValue) * p;
			
			
			
		} else if (typeof endValue == 'string') {
			
			// perform regex replace on digit sequences
			var up = /\s*(-?\d+\.?\d*)\s*(px|%|em)?\s*/i;

			var search = "(-\?[\\d\\.\?]+\(\?\:px\|%\|em\)\?)";
			var regexp = new RegExp(search, "g");
			
			var pattern = startValue;
			pattern = pattern.replace(/\(/g, "\\(");
			pattern = pattern.replace(/\)/g, "\\)");
			pattern = pattern.replace(regexp, search);
			pattern = pattern.replace(/,\s+/g, ",\\s*");
			
			result = pattern;

			var ma = new RegExp(pattern).exec(startValue);
			var mb = new RegExp(pattern).exec(endValue);
			
			if (mb) {
				for (var i = 1; i < mb.length; i++) {
					
					var amu = up.exec(ma[i]);
					var bmu = up.exec(mb[i]);
					
					var av = amu ? parseFloat(amu[1]) : 0;
					var bv = bmu ? parseFloat(bmu[1]) : 0;
					
					var au = amu && amu[2] ? amu[2] : "";
					var bu = bmu && bmu[2] ? bmu[2] : "";
					var u = au ? au : bu;
					
					var value = av + (bv - av) * p;
					result = result.replace(search, value + u);
				}
			}
			
			
			result = result.replace(/,\\s\*/g, ",");
			result = result.replace(/\\\(/g, "(");
			result = result.replace(/\\\)/g, ")");

		}
		
		
		return result;
	}
	
	function getTimingFunction(func) {
		
		var timingFunction = null;
		if (typeof(this.timingFunction) == "function") {
			timingFunction = this.timingFunction;
		} else if (typeof(this.timingFunction) == "string") {
			timingFunction = timingFunctions[this.timingFunction];
		}
		return timingFunction;
	}

	
	/**
	 * class for transition and animation
	 * @class benignware.core.Transition
	 * @extends benignware.core.EventDispatcher
	 */
	
	/**
	 * dispatched when a property has been finished.
	 * @event end
	 */
	
	/**
	 * dispatched when all properties have been finished.
	 * @event complete
	 */
	
	Class.create('benignware.core.Transition', (function() {
		
		var _parent;
		
		// private static 
		var transitionCount = 0;

		// we use a global timer
		var timer = new Timer(25);
		
		var transitionStyle = CSS.getVendorStyle('transition');
		var isFirefox = navigator.userAgent.match(/Firefox/);
		
		var transitionEndEvent = transitionStyle ? isFirefox ? 'transitionend' : transitionStyle.substring(0, 1).toLowerCase() + transitionStyle.substring(1) + "End" : '';

		if (transitionStyle) {
//			alert("css transitions supported");
		}
		
		
		/**
		 * @constructor
		 * @param {Element} element an element or object to apply the transition on.
		 */
		function Transition(element) {
			
			var __parent = _parent.apply(this);
			
			this.element = element;
			
			// private variables
			
			var isPlaying = false;
			var finished = {};
			var cssTimeouts = [];
			
			var initialValues = [];
			
			var time;
			
			var startTime;
			
			var elem = element;
			var isElem = isElement(elem);
			
			var properties = [];
			
			var timerArgs = {};
			var cssArgs = {}
			
			var transition = this;

			
			// private privileged methods
			
			function timerHandler(event) {

				time+= timer.getInterval();
				
				for (var i = 0; i < timerArgs.propertyName.length; i++) {
					
					var name = timerArgs.propertyName[i];
					
					var t = time;
					var d = timerArgs.duration[i];
					if (t >= d) {
						t = d;
					}

					var value = getTransitionValue(timerArgs.startValue[i], timerArgs.endValue[i], t, d, timerArgs.timingFunction[i]);

					setValue(elem, name, value);

//					transitionChange.call(this);
					
					if (t == d) {
						transitionEndHandler({propertyName: name});
					}
				}
			}
			
			function transitionEndHandler(event) {

				propertyName = event.propertyName;
				
//				console.log("transition end: ", propertyName);
				
				if (!isPlaying) {
					return;
				}
				
				if (!propertyName && properties.length == 1) {
//					propertyName = StringUtils.hyphenatedToCamelCase(props[0]);
				}

				window.clearTimeout(cssTimeouts[propertyName]);
				
//				console.log("transition prop finish? ", propertyName, finished[propertyName]);
				
				if (typeof(finished[propertyName]) == 'undefined' || !finished[propertyName]) {
					
					finished[propertyName] = true;
					
					var doc = elem && elem.ownerDocument ? elem.ownerDocument : document;
					
					var event = Event.create(doc, 'end', false, false);
					event.propertyName = propertyName;
					transition.dispatchEvent(event);
					// test for complete
					
					var complete = (properties.length == 1);
					
					
					if (!complete) {
						
						complete = true;
						for (var i = 0; i < properties.length; i++) {
							if (!finished[properties[i]]) {
								// incomplete
								complete = false;
								break;
							}
						}
					}

					if (complete) {
						transition.stop();
						var doc = elem && elem.ownerDocument ? elem.ownerDocument : document;
						transition.dispatchEvent(Event.create(doc, 'transitioncomplete', false, false));
						
						// deprecated:
						transition.dispatchEvent(Event.create(doc, 'complete', false, false));
						
					}
					
				}
				
			}
			
			function transitionChange() {
				var doc = elem && elem.ownerDocument ? elem.ownerDocument : document;
				this.dispatchEvent(Event.create(doc, Transition.TRANSITION_CHANGE, false, false));
			}
			
			
			this.isPlaying = function() {
				return isPlaying;
			} 
			
			// public privileged methods
			
			/**
			 * starts the transition
			 * @method start
			 */
			this.start = function() {
				
				// start
				if (!this.isPlaying()) {

					elem = this.element;

					isElem = isElement(elem);

					isPlaying = true;
					finished = [];
					cssTimeouts = [];

					properties = getProperties(this.property);
					
					// get args
					var startValue = this.startValue || getValues(elem, properties);
					var args = getTransitionArguments(properties, startValue, this.endValue, this.duration, this.timingFunction);
					
					// css arguments
					cssArgs = {
						propertyName: [], 
						startValue: [], 
						endValue: [], 
						duration: [], 
						timingFunction: []
					};
					
					// timer args
					timerArgs = {
						propertyName: [], 
						startValue: [], 
						endValue: [], 
						duration: [], 
						timingFunction: []
					};
					
					
					for (var i = 0; i < properties.length; i++) {
						
						var name = properties[i];

						if (this.useCSS && transitionStyle && isStyle(elem, name)) {
							
							// css
							//
							
							cssArgs.propertyName.push(name);
							cssArgs.duration.push(args.duration[i] / 1000 + "s");
							cssArgs.timingFunction.push(args.timingFunction[i]);
							cssArgs.startValue.push(args.startValue[i]);
							cssArgs.endValue.push(args.endValue[i]);
							
							
							// init timeout
							var duration = args.duration[i];
							(function() {
								var propertyName = name;
								cssTimeouts[name] = window.setTimeout(function() {
									console.warn('css transition timeout', propertyName);
									transitionEndHandler({propertyName: propertyName});
								}, args.duration[i] + 1000);
							})();
							
							
						} else {
			
							//if (typeof elem[name] != "undefined")
							
							
							// timer
							timerArgs.propertyName.push(name);
							timerArgs.duration.push(args.duration[i]);
							timerArgs.timingFunction.push(args.timingFunction[i]);
							timerArgs.startValue.push(args.startValue[i]);
							timerArgs.endValue.push(args.endValue[i]);
							
							// init timer
						}
						
					}

					setValues(elem, properties, args.startValue);
					
					
					if (cssArgs.propertyName.length > 0) {

						window.setTimeout(function() {

						var propName = cssArgs.propertyName.join(",");

						elem.style[transitionStyle + "Property"] = StringUtils.hyphenate(propName);
						elem.style[transitionStyle + "TimingFunction"] = cssArgs.timingFunction.join(",");
						elem.style[transitionStyle + "Duration"] = cssArgs.duration.join(",");
						
						setValues(elem, cssArgs.propertyName, cssArgs.endValue);
						
							
						}, 50); 
							
							
						elem.addEventListener(transitionEndEvent, transitionEndHandler);
						
					}

					
					if (timerArgs.propertyName.length > 0) {
						transitionCount++;
						timer.addEventListener('tick', timerHandler);
						if (!timer.isRunning()) {
							timer.start();
						}
					}
					
					time = 0;
				}
			}
			
			
			
			/**
			 * stops the transition
			 * @method stop
			 */
			this.stop = function() {
				
				// stop
				if (isPlaying) {

					isPlaying = false;
					
					if (cssArgs.propertyName.length > 0) {
						
						elem.style[transitionStyle + "Duration"] = "0s";
						
						// css
						
						// clear timeouts
						for (var x in cssTimeouts) {
							window.clearTimeout(cssTimeouts[x]);
						}
						
						// remove listener
						elem.removeEventListener(transitionEndEvent, transitionEndHandler);
						
						// apply current values
						if (isElem && this.useCSS && transitionStyle) {
							setValues(elem, properties, getValues(elem, properties));
						}
					} 
					
					
					// timer
					if (timerArgs.propertyName.length > 0) {
						// remove listener
						timer.removeEventListener('tick', timerHandler);
						// decrease transition count
						transitionCount--;
						
						// stop timer if no transition running
						if (timer.isRunning()) {
							if (transitionCount <= 0) {
								timer.stop();
							}
						}
					}
					
				}
			
			}
		}
		
		
		Class.extend(EventDispatcher, Transition);
		
		_parent = Class.getParent(Transition);
		
		
		/**
		 * the target element or other object to apply the transition on.
		 * @property element
		 * @return {Object} the target object
		 */
		Transition.prototype.element = null;
		
		/**
		 * start value(s) of the transition
		 * @property startValue
		 * @return {Array} the start value(s)
		 */
		Transition.prototype.startValue = null;
		
		
		/**
		 * end value(s) of the transition
		 * @property endValue
		 * @return {Array} the end value(s)
		 */
		Transition.prototype.endValue = null;
		
		/**
		 * the duration of the transition.
		 * @property duration
		 * @return {Number} the duration in seconds
		 */
		Transition.prototype.duration = null;
		
		/**
		 * the timing-function
		 * @property timingFunction
		 * @return {String} the direction
		 */
		Transition.prototype.timingFunction = "linear";

		
		
		/**
		 * specifies if css transitions should be used. defaults to true
		 * @property useCSS
		 * @return {Boolean} true or false
		 */
		Transition.prototype.useCSS = true;

		return Transition;
		
	})());
})();