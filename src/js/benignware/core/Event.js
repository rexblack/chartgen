(function() {
	
	var Class = benignware.core.Class;

	/**
	 * cross browser event
	 * @class Event
	 * @param {String} type
	 * @param {Boolean} bubbles
	 * @param {Boolean} cancelable
	 */
	
	function Event(type, bubbles, cancelable) {
		var doc, event = this;
		if (arguments.length == 4) {
			doc = arguments[0];
			type = arguments[1];
			bubbles = arguments[2];
			cancelable = arguments[3];
		}
		doc = doc && !doc.documentElement ? doc : document;
		if (typeof bubbles == 'undefined') bubbles = typeof bubbles != 'undefined' ? bubbles :false;
		if (typeof cancelable == 'undefined') cancelable = typeof cancelable != 'undefined' ? cancelable :false;

		if (typeof(doc.createEvent) == "function") {
			event = doc.createEvent("Event");
			if (type) {
				event.initEvent(type, bubbles, cancelable);		
			}
		} else {
			if (document.createEventObject) {
				event = document.createEventObject();
			}
			event.type = type;
			event.bubbles = bubble;
			event.cancelable = cancelable;
		}
		event.constructor = Event;
		return event;
	}
	
	// register the class
	Class.register('benignware.core.Event', Event);
	
	/**
	 * @property target
	 * @return {Object} the event target
	 */
	Event.prototype.target = null;
	
	/**
	 * @property type
	 * @return {String} the event type
	 */
	Event.prototype.type = null;
	
	/**
	 * @property bubbles
	 * @return {Boolean} specifies if the event should bubble up the dom tree
	 */
	Event.prototype.bubbles = false;
	
	/**
	 * @property cancelable
	 * @return {Boolean} specifies if the event is cancelable
	 */
	Event.prototype.cancelable = false;
	
	
	/**
	 * creates a new event with the specified type and options
	 * @static
	 * @method create
	 * @param {Event} event
	 * @return {Event} the normalized event
	 */
	Event.create = function(type, bubbles, cancelable) {
		return Event.apply(this, arguments);
	}
	
	/**
	 * complements the specified event object with w3c compliant methods and properties
	 * @static
	 * @method normalize
	 * @param {Event} event
	 * @return {Event} the normalized event
	 */
	Event.normalize = function(event) {
		// TODO: implement
		if (typeof(event) == "undefined") {
			// no event
			event = window.event;
		}
		if (!event) return;
		if (typeof(event.preventDefault) == "undefined") {
			event.preventDefault = Event.prototype.preventDefault;
		}
		if (typeof(event.stopPropagation) == "undefined") {
			event.stopPropagation = Event.prototype.stopPropagation;
		}
		
		if (typeof(event.target) == "undefined" && typeof(event.srcElement) != "undefined") {
			event.target = event.srcElement;
		}
		
		if (typeof(event.which) == "undefined" && typeof(event.keyCode) != "undefined") {
			event.which = event.keyCode;
		}
		
		if (typeof(event.timeStamp) == "undefined") {
			event.timeStamp = new Date().getTime();
		}
		
		if (typeof(event.relatedTarget) == "undefined") {
			if (event.fromElement) {
					event.relatedTarget = event.fromElement;
			} else if (event.toElement) {
				event.relatedTarget = event.toElement;
			}
		}
		
		/*
		if (typeof(event.clientX) != "undefined") {
			event.pageX = event.clientX;
		}
		
		if (typeof(event.clientY) != "undefined") {
			event.pageY = event.clientY;
		}
		*/
		
		
		if ('wheelDeltaX' in event) {
			event.wheelDeltaX = -event.wheelDeltaX;
			event.wheelDeltaY = -event.wheelDeltaY;
		} else if ('detail' in event) {
		    if (event.axis === 2) { 
		    	// Vertical
		    	event.wheelDeltaY = event.detail * 12;
		    	event.wheelDeltaX = 0;
		    } else { 
		    	// Horizontal
		    	event.wheelDeltaX = event.detail * 12;
		    	event.wheelDeltaY = 0;
		    }
		} else if ('wheelDelta' in event) {
			event.wheelDeltaX = event.wheelDeltaX = event.wheelDelta;
		}
		
		
		return event;
	}
	
	return Event;
	
})();