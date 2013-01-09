(function(){
	
	/**
	 * shows an activity indicator with status message
	 * @class benignware.view.Slideshow  
	 */
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Container = Class.require("benignware.core.Container");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	var Transition = Class.require("benignware.core.Transition");
	var ActivityView = Class.require("benignware.view.ActivityView");
	var ImageView = Class.require("benignware.view.ImageView");
	var ImageLoader = Class.require("benignware.util.ImageLoader");
	var DOM = Class.require("benignware.util.DOM");
	
	var _parent;
	
	CSS.setDefaultStyle(".benignware-view-Slideshow", "overflow", "hidden");
	
	CSS.setDefaultStyle(".benignware-view-Slideshow", "position", "relative");
	CSS.setDefaultStyle(".benignware-view-Slideshow", "width", "420px");
	CSS.setDefaultStyle(".benignware-view-Slideshow", "height", "380px");
	CSS.setDefaultStyle(".benignware-view-Slideshow", "-user-select", "none");
	CSS.setDefaultStyle(".benignware-view-Slideshow", "-moz-user-select", "none");
	CSS.setDefaultStyle(".benignware-view-Slideshow", "-webkit-user-select", "none");
//	CSS.setDefaultStyle(".benignware-view-Slideshow", "-webkit-backface-visibility", "hidden");
//	CSS.setDefaultStyle(".benignware-view-Slideshow", "-webkit-transform", "translateZ(0)");
//	CSS.setDefaultStyle(".benignware-view-Slideshow", "-webkit-backface-visibility", "hidden");
//	CSS.setDefaultStyle(".benignware-view-Slideshow img", "-webkit-backface-visibility", "hidden");
	
	CSS.setDefaultStyle(".benignware-view-Slideshow", "-webkit-text-size-adjust", "none");
	
//	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "border-radius", "10px");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "position", "absolute");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "z-index", "100");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "width", "40px");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "height", "40px");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "top", "50%");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "left", "50%");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "margin", "-20px");
	
//	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "display", "none");
	
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView.error", "display", "none");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView.warn", "display", "none");

	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView.overlay", "background", "#fff");
	
	function Slideshow() {
		
		_parent.apply(this, arguments);
		
		var slideshow = this;
		
		var isPlaying = false;
		var _position = 0;
		var currentItem = null;
		var imageLoader = new ImageLoader();
		imageLoader.addEventListener('load', imageLoadHandler);
		imageLoader.addEventListener('error', imageErrorHandler);
		
		var nextTimeoutId = null;
		
		var transitionIn = new Transition();
		transitionIn.startValue = ["0"];
		transitionIn.endValue = ["1"];
		transitionIn.property = ["opacity"];
		transitionIn.timingFunction = ["ease-in"];
		transitionIn.addEventListener('complete', transitionInCompleteHandler);
		
		var transitionOut = new Transition();
		transitionOut.timingFunction = ["ease-in"];
//		transitionOut.startValue = ["1"];
		transitionOut.endValue = ["0"];
		transitionOut.property = "opacity";
		transitionOut.addEventListener('complete', transitionOutCompleteHandler);
		
		var calledByNextTimeout = false;
		
		this.start = function() {
//			console.log("slideshow start", isPlaying);
			if (!isPlaying) {
//				console.log("** slideshow start");
				this.stop();
				this.setPosition(0);
				this.dispatchEvent(Event.create(this.ownerDocument, 'start', false, false));
				this.play();
			}
		}

		this.play = function() {
			if (!isPlaying) {
				console.log("slideshow play");
				initNextTimeout.call(this);
				isPlaying = true;
				this.dispatchEvent(Event.create(this.ownerDocument, 'play', false, false));
			}
		}
		
		this.pause = function() {
			if (isPlaying) {
				console.log("slideshow pause");
				window.clearTimeout(nextTimeoutId);
				isPlaying = false;
				this.dispatchEvent(Event.create(this.ownerDocument, 'pause', false, false));
			}
		}
		
		this.stop = function() {
			if (!isPlaying) {
//				console.log("slideshow stop");
				window.clearTimeout(nextTimeoutId);
				isPlaying = false;
				this.dispatchEvent(Event.create(this.ownerDocument, 'stop', false, false));
			}
		}
		
		this.togglePlay = function() {
			if (this.isPlaying()) {
				this.pause();
			} else {
				this.play();
			}
		}
		
		this.setPosition = function(position) {
			
			if (_position != position || !currentItem) {
				
				
//				clearNextTimeout.call(this);
				var item = this.get(position);
				_position = position;
				
				var positionEvent = Event.create(this.ownerDocument, 'position', false, false);
//				console.log('dispatch position event', positionEvent);
				this.dispatchEvent(positionEvent);
				
//				console.log("set pos", position, _position);
				
				slide.call(this);
				
			}
		}
		
		this.getPosition = function() {
			return _position;
		}
		
		this.getContentSize = function() {
			return {
				width: this.clientWidth, 
				height: this.clientHeight
			}
		}
		
		this.getLayout = function() {
			return null;
		}
		
		this.isPlaying = function() {
			return isPlaying;
		}

		function initNextTimeout() {
			clearNextTimeout.call(this);
			var d = parseFloat(slideshow.duration) * 1000;
			nextTimeoutId = window.setTimeout(function() {
//				console.log("slide timeout", slideshow.isPlaying());
				if (slideshow.isPlaying()) {
					calledByNextTimeout = true;
					slideshow.next();
					calledByNextTimeout = false;
				}
			}, d);
		}
		
		function clearNextTimeout() {
			window.clearTimeout(nextTimeoutId);
		}
		
		function transitionInCompleteHandler(event) {
//			console.log("transition in complete");
			slide.call(slideshow);
			transitionInComplete.call(slideshow);
		}
		
		function transitionInComplete() {
			console.log('transition in complete');
			if (slideshow.isPlaying()) {
				initNextTimeout.call(slideshow);
			}
			// preload next
			var pos = slideshow.getPosition();
			
			var next = pos < slideshow.size() - 1 ? pos + 1 : 0;
			var prev = pos > 0 ? pos - 1 : slideshow.size() - 1;
//			console.log("trans in complete preload: ", next, prev);
			imageLoader.add(slideshow.get(next));
			imageLoader.add(slideshow.get(prev));
			slideshow.invalidate();
		}
		
		
		function transitionOutCompleteHandler(event) {
//			console.log("transition out complete");
			slide.call(slideshow);
		}
		
		function imageLoadHandler(event) {
			console.log("image load handler", event.element);
			
			var item = slideshow.get(slideshow.getPosition());
			if (item == event.element) {
				console.log("call slide item after load ", item);
//				item.style.visibility = "visible";
				slide.call(slideshow);
			}
		}
		
		function imageErrorHandler(event) {
			console.log("image error handler", event.element);
			var item = slideshow.get(slideshow.getPosition());
			if (item == event.element) {
//				console.log("next due to error: ");
				slideshow.next();
			}
		}
		
		function slide() {
			
			clearNextTimeout.call(this);
			
			var pos = this.getPosition();
			var item = this.get(this.getPosition());

			if (item != null && item != currentItem) {

				var isItemComplete = ImageLoader.isComplete(item);
				if (!isItemComplete) {			
					this.activityView.setStatus('progress');
					item.style.visibility = "hidden";
//					item.style.display = "none";
					
					if (!calledByNextTimeout) {
						this.activityView.show();
						if (currentItem) {
							this.activityView.addCSSName('overlay');
						} else {
							this.activityView.removeCSSName('overlay');
						}
						imageLoader.add(item);
					}
					
					
				} else if (!transitionIn.isPlaying() && !transitionOut.isPlaying()) {
					
//					console.log("transition not playing show", isItemComplete);
					
					for (var i = 0; i < slideshow.size(); i++) {
						var child = slideshow.get(i);
						var v = Element.getComputedStyle(child, 'visiblility');
						
						
						
						if ((child == item || child == currentItem) ) {
							
//							console.log("show: ", item == child, child.getAttribute('data-content-id'), child);
							
//							child.style.display = '';
							
//							if (ImageLoader.isComplete(child) && v != 'visible') {
//								child.style.visibility = 'visible';
//							}
							
							child.style.visibility = 'visible';
							
						} else {
//							console.log("hide: ", item == child, child.getAttribute('data-content-id'));
//							child.style.display = 'none';
							child.style.visibility = 'hidden';
//							child.style.zIndex = "";
							item.style.zIndex = "";
						}
						
					}
					
					
					slideshow.activityView.hide();
					
					item.style.zIndex = "1";
//					item.style.visibility = "visible";
					
					if (currentItem) {
						console.log('reset old item', currentItem.style.zIndex);
						currentItem.style.zIndex = "";
//						currentItem.style.visibility = "";
//						child.style.display = '';
//						transitionOut.element = currentItem;
//						transitionOut.duration = this.transitionDuration;
//						console.log("start trans out: ", currentItem);
//						transitionOut.start();
//						updateItem.call(this, currentItem);
					}
					
					

//					updateItem.call(this, item);
					
					if (currentItem) {
						console.log('start transition in', item.style.zIndex);
						transitionIn.element = item;
						transitionIn.duration = this.transitionDuration;
						transitionIn.start();
					} else {
						console.log("first item complete");
						transitionInComplete.call(this);
					}
					
					// update current item
					currentItem = item;
					

					var slideEvent = Event.create(this.ownerDocument, 'slide', false, false);
//					console.log('dispatch slide event', slideEvent, this.activityView);
					this.dispatchEvent(slideEvent);
					
					this.invalidate();
					
				} else {
					console.log('transition playing');
				}
				
				
				
				

			}
			
		}
		
		
		
//		window.setTimeout(function() {
//			console.log('timeoutstart');
//			slideshow.start();
//		}, 1)
//		
		
	}
	
	Class.register("benignware.view.Slideshow", Slideshow);
	
	Class.extend(Container, Slideshow);
	_parent = Class.getParent(Slideshow);
	//
	Slideshow.prototype.activityView = null;
	Slideshow.prototype.autoPlay = true;
	
	Slideshow.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
		if (StringUtils.toBoolean(this.autoPlay)) {
			this.start();
		} else {
			this.setPosition(0);
		}
	}
	
	Slideshow.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);

		this.activityView = Element.create(this.ownerDocument, ActivityView);
		this.activityView.hide();
		this.appendChild(this.activityView);
		
	}
	
	Slideshow.prototype.duration = 3;
	Slideshow.prototype.transitionDuration = 1;
	Slideshow.prototype.scaleMode = 'contain';
	
	Slideshow.prototype._update = function() {
		
		
		
		for (var i = 0; i < this.size(); i++) {
			
			var item = this.get(i);
			updateItem.call(this, item);

		}
		

	}
	
	function updateItem(item) {
		
		var maxWidth = Math.round(this.getWidth());
		var maxHeight = Math.round(this.getHeight());
		
		item.style.position = "absolute";

		var deepestAncestor = DOM.getDeepestElement(item);
		var componentParent = DOM.getParentByClass(deepestAncestor, Component);
		
		if (deepestAncestor.tagName.toLowerCase() == "img" && !(componentParent && DOM.isChildOf(componentParent, this))) {
			
			elem = deepestAncestor;
			// scale image
			ImageView.scale(item, maxWidth, maxHeight, this.scaleMode, null);

		} else {
			
			Element.setWidth(elem, maxWidth);
			Element.setHeight(elem, maxHeight);

		}
		
		// align
		item.style.left = Math.floor((maxWidth - Element.getOuterWidth(item)) * 0.5) + "px";
		item.style.top = Math.floor((maxHeight - Element.getOuterHeight(item)) * 0.5) + "px";
	}
	
	Slideshow.prototype.next = function() {
		var pos = this.getPosition();
		if (pos + 1 < this.size()) {
			pos++;
		} else {
			pos = 0;
		}
		this.setPosition(pos);
	}
	
	Slideshow.prototype.previous = function() {
		var pos = this.getPosition();
		if (pos - 1 >= 0) {
			pos--;
		} else {
			pos = this.size() - 1;
		}
		this.setPosition(pos);
	}
	
	
	return Slideshow;
})();