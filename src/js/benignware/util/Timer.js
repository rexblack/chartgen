(function() {
	
	var Class = benignware.core.Class;
	
	var EventDispatcher = Class.require('benignware.core.EventDispatcher');
	var Event = Class.require('benignware.core.Event');
	
	
	/**
	 *  an event-dispatching timer class
	 *  @class benignware.util.Timer
	 *  @extends benignware.core.EventDispatcher
	 */
	
	return Class.create('benignware.util.Timer', (function() {
		
		var _parent;
		
		/**
		 * @constructor
		 * @param interval
		 */
		function Timer(interval) {
			
			var __parent = _parent.apply(this, arguments);
			
			var _interval = interval || 1000;
			
			var timerId = null;
			
			var timer = this;
			
			function timerCallback() {
				var event = Event.create('tick', false, false);
				timer.dispatchEvent(event);
			}
			
			/**
			 * sets the timer interval
			 * @privileged
			 * @method setInterval
			 * @param {int} the interval in milliseconds
			 */
			this.setInterval = function(interval) {
				if (interval != _interval) {
					_interval = interval;
					if (this.isRunning()) {
						window.clearInterval(timerId);
						timerId = window.setInterval(timerCallback, this.getInterval());
					}
				}
			}
			
			/**
			 * returns the timer interval
			 * @privileged
			 * @method getInterval
			 * @return {int} the interval in milliseconds
			 */
			this.getInterval = function(interval) {
				return _interval;
			}
			
			/**
			 * starts the timer
			 * @privileged
			 * @method start
			 */
			this.start = function() {
//				console.log("Timer::start()", this.getInterval());
				if (this.isRunning()) {
					this.stop();
				}
				timerId = window.setInterval(timerCallback, this.getInterval());
			}
			
			/**
			 * stops the timer
			 * @privileged
			 * @method stop
			 */
			this.stop = function() {
//				console.log("Timer::stop()");
				if (timerId) {
					window.clearInterval(timerId);
					timerId = null;
				}
			}
			
			/**
			 * returns true, if the timer is running
			 * @privileged
			 * @method isRunning
			 * @return {Boolean} true, if timer is running
			 */
			this.isRunning = function() {
				return (timerId != null);
			}
		}
		
		Class.extend(EventDispatcher, Timer);
		
		_parent = Class.getParent(Timer);
		
		/**
		 * timer event.
		 * @event tick
		 */

		return Timer;
		
	})());
	
})();