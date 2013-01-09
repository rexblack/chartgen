(function() {
	
	var Class = benignware.core.Class;
	
	/**
	 * event handling implementation for non-ui classes
	 * @package benignware.core
	 * @class EventDispatcher
	 */
	
	var _parent;
	
	// helper methods
	
	function contains(array, value) {
		for (var i = 0; i < array.length; i++) if (array[i] == value) return true;
		return false;
	}
	
	function EventDispatcher() {
		
		var eventListeners = [];
		
		var __parent = _parent.apply(this, arguments);
		
		/**
		 * registers an event listener for the specified event
		 * @privileged
		 * @method addEventListener
		 * @param {String} type
		 * @param {Function} handler
		 */
		this.addEventListener = function(whichEvent, handler, useCapture) {
			if (__parent.addEventListener) {
				// native w3c
				__parent.addEventListener.apply(this, arguments);
			} else if (this.attachEvent) {
				// native ie
				this.attachEvent("on" + whichEvent, handler);
			} else {
				// implementation
				eventListeners[whichEvent] = eventListeners[whichEvent] || [];
				if (!contains(eventListeners[whichEvent], handler)) {
					eventListeners[whichEvent].push(handler);
				}
			}
		}
		
		/**
		 * unregisters an event listener for the specified event
		 * @privileged
		 * @method removeEventListener
		 * @param {String} type
		 * @param {Function} handler
		 */
		this.removeEventListener = function(whichEvent, handler, useCapture) {
			if (__parent.removeEventListener) {
				// native w3c
				__parent.removeEventListener.apply(this, arguments);
			} else if (this.detachEvent) {
				// native ie
				this.detachEvent("on" + whichEvent, handler);
			} else {
				// implementation
				if (eventListeners[whichEvent]) {
					for (var i = 0; i < eventListeners[whichEvent].length; i++) {
						if (eventListeners[whichEvent][i] == handler) {
							eventListeners[whichEvent].splice(i, 1);
							i--;
						}
					}
				}
			}
		}
		
		
		/**
		 * dispatches the specified event
		 * @privileged
		 * @method dispatchEvent
		 * @param {benignware.core.Event} event
		 */
		this.dispatchEvent = function(event) {
			
//			console.log("dispatch event: ", event, __parent.dispatchEvent);
			
			var canceled = false;
			if (__parent.dispatchEvent) {
				// native w3c
//				console.log("native");
				__parent.dispatchEvent.apply(this, arguments);
//				if (navigator.userAgent.match(/webkit/i)) {
//					console.log("return", navigator.userAgent);
//					return;
//				}
			} else if (this.fireEvent) {
//				console.log("native ie");
				// native ie
				this.fireEvent(event.type, event);
				return;
				
			} else if (!__parent.addEventListener) {
				
//				console.log("implementation")
				// implementation
				
				if (typeof(event.target) == "undefined") {
					try {
						event.target = this;
					} catch (e) {}
				}
				
				var whichEvent = event.type;
				
				if (eventListeners != null && eventListeners[whichEvent]) {
					for (var i = 0; i < eventListeners[whichEvent].length; i++) {
						// call the handler
						eventListeners[whichEvent][i](event);
					}
				}
				
				if (event.bubbles && !event.cancelBubble) {
					if (this.parentNode) {
						if (this.parentNode.dispatchEvent) {
							this.parentNode.dispatchEvent(event);
						}
					}
				}
			}

//			console.log("*** event", event.type);
			var eventProperty = 'on' + event.type.toLowerCase();
			
			//if (!(eventProperty in window)) {
				if (this.getAttribute && this.getAttribute(eventProperty)) {
					// fire on attribute
					eval(this.getAttribute(eventProperty));
				} else if (typeof(this[eventProperty]) == "function") {
					// fire on property
					
					this[eventProperty](event);
				}
			//}
			
//			this.handleEvent(event);
			
			
			return !(event.defaultPrevented || !event.returnValue);

		}
		
		
		// constructor end
	}
	
	// extend
	Class.extend(Object, EventDispatcher);
	_parent = Class.getParent(EventDispatcher);
	
	// register the class
	Class.register('benignware.core.EventDispatcher', EventDispatcher);
	
	/**
	 * called on dispatch
	 * @method handleEvent
	 * @param {benignware.core.Event} event
	 */
	EventDispatcher.prototype.handleEvent = function(event) {
		// no implementation here
	}
	
	return EventDispatcher;
	
})();