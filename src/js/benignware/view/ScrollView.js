(function() {
	
	/**
	 * the view package contains screen-building container classes.
	 * @package benignware.view
	 */
	
	var Class = benignware.core.Class;
	var Element = Class.require('benignware.core.Element');
	var Event = Class.require('benignware.core.Event');
	var Container = Class.require('benignware.core.Container');
	var Transition = Class.require('benignware.core.Transition');
	var Delegate = Class.require('benignware.util.Delegate');
	var StringUtils = Class.require('benignware.util.StringUtils');
	var CSS = Class.require('benignware.util.CSS');
	
	var Layout = Class.require('benignware.core.Layout');
	var ClientFitLayout = Class.require('benignware.layout.ClientFitLayout');
	
	CSS.setDefaultStyle(".benignware-view-ScrollView", "overflow", "hidden");
	CSS.setDefaultStyle(".benignware-view-ScrollView", "height", "240px");

	CSS.setDefaultStyle(".benignware-view-ScrollView .content-layer", "height", "100%");
	
	/**
	 * a scroll view component
	 * @package benignware.view
	 * @class ScrollView
	 * @extends benignware.core.Container
	 */
	
	Class.create('benignware.view.ScrollView', (function() {
		
		var _parent; 
		
		var transformStyle = CSS.getVendorStyle('transform');
		
		// private helpers

		function abs(a) {
			return a < 0 ? -a : a;
		}
		
		// TODO: change
		function momentum (dist, time, maxDistUpper, maxDistLower) {

			var friction = 2.5,
				deceleration = 1.2,
				speed = Math.abs(dist) / time * 1000,
				newDist = speed * speed / friction / 1000,
				newTime = 0;

			// Proportinally reduce speed if we are outside of the boundaries 
			
			if (dist > 0 && newDist > maxDistUpper) {
				speed = speed * maxDistUpper / newDist / friction;
				newDist = maxDistUpper;
			} else if (dist < 0 && newDist > maxDistLower) {
				speed = speed * maxDistLower / newDist / friction;
				newDist = maxDistLower;
			}
			
			newDist = newDist * (dist < 0 ? -1 : 1);
			
			newTime = speed / deceleration;

			return { dist: Math.round(newDist), time: Math.round(newTime) };
		}
		
		/**
		 * @constructor
		 */
		function ScrollView() {
			
			var __parent = _parent.apply(this, arguments);
			
			// init scroller method
			var _scrollerMethod = null;
			
			var scrollTransition = new Transition();
			scrollTransition.addEventListener('complete', scrollTransitionCompleteHandler);
			
			var page = 0;
			
			// touch vars
			var touchStartPos = null;
			var touchCurrentPos = null;
			var touchStartTime = 0;
			var touchInitialVector = null;
			
			// mouse vars
			var mouseOverElement = null;
			
			// mouse wheel
			var mouseWheelDelta = null;
			var mouseWheelVelocity = {};
			var mouseWheelEndTimeoutId;
			
			var scrollView = this;
			
			var scrollPosition = {x: 0, y: 0}
			
			var displayManagementTimerID = null;
			
			var _displayManagement = true;
			
			var scrollView = this;
			
			function updatePage() {
				var pages = this.getPages();
				console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", pages);
				var currentPage = getPageAt.call(this, this.getScrollPosition());
				if (pages > 0) {
					if (currentPage != page) {
						page = currentPage;
						var pageEvent = Event.create(scrollView.ownerDocument, 'page', false, false);
						if (_displayManagement == 'auto' && !displayManagementTimerID) {
							displayManagementTimerID = window.setTimeout(function() {
								updateDisplayedItems.call(scrollView);
								displayManagementTimerID = null;
								scrollView.dispatchEvent(pageEvent);
							}, 1);
						} else {
							scrollView.dispatchEvent(pageEvent);
						}
					}
				}
			}
			
			function scrollToBounds(duration) {
				
				duration = typeof(duration) == "number" ? duration : 0.25;
				// scroll to bounds
				var s = this.getScrollPosition();
				var n = getScrollPosInBounds.call(this, s.x, s.y);

				if (n.x != s.x || n.y != s.y) {
					console.log("scroll to bounds");
					this.scrollTo(n.x, n.y, duration);
				} else {
					console.log("scroll finish");
					updatePage.call(scrollView);
					scrollEnd.call(this);
				}
				
			}
			
			// touch handlers
			
			function touchStartHandler(event) {
//				console.log("touch start handler");
				touchStartPos = touchCurrentPos = {x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY};
				touchStartTime = new Date().getTime();
				touchInitialVector = null;
				touchStart.call(this, event);
				//event.preventDefault();
			}
			
			function touchMoveHandler(event) {
//				console.log("touch move handler", touchCurrentPos);
				var touchX = event.touches[0].clientX;
				var touchY = event.touches[0].clientY;
				if (touchCurrentPos != null) {
					var dx = (touchX - touchCurrentPos.x) * -1;
					var dy = (touchY - touchCurrentPos.y) * -1;
					touchCurrentPos = {x: touchX, y: touchY}
					touchMove.call(this, event, dx, dy);
				}
				
				//event.preventDefault();
			}
			
			function touchEndHandler(event) {
//				console.log("touch end handler");
				
				if (touchStartPos != null && touchCurrentPos != null) {
					var dx = touchCurrentPos.x - touchStartPos.x;
					var dy = touchCurrentPos.y - touchStartPos.y;
					touchEnd.call(this, event, dx, dy);
					touchCurrentPos = touchStartPos = null;
					
				}
			}
			
			
			// mouse handlers
			
			function mouseDownHandler(event) {
//				console.log("mouse down handler", event);
				//event = Event.getEvent(event);
				 //
				var pos = {x: event.clientX, y: event.clientY}
				touchStartPos = touchCurrentPos = pos;
				touchStartTime = new Date().getTime();
				touchInitialVector = null;
				touchStart.call(this, event);
				//
//				if (!event.target.focus) {
					event.preventDefault();
//				}
				
			}
			
			function mouseMoveHandler(event) {
				
				if (touchCurrentPos) {
					var touchX = event.clientX;
					var touchY = event.clientY;
					var dx = (touchX - touchCurrentPos.x) * -1;
					var dy = (touchY - touchCurrentPos.y) * -1;
					touchCurrentPos = {x: touchX, y: touchY}
					touchMove.call(this, event, dx, dy);
				}
				
			}
			
			function mouseUpHandler(event) {
				if (touchCurrentPos && (touchCurrentPos.x != touchStartPos.x || touchCurrentPos.y != touchStartPos.y)) {
					var dx = touchCurrentPos.x - touchStartPos.x;
					var dy = touchCurrentPos.y - touchStartPos.y;
					
					touchEnd.call(this, event, dx, dy);
			//		event.preventDefault();
				}
				touchCurrentPos = touchStartPos = null;
			}
			
			function mouseOutHandler(event) {
				//event = Event.getEvent(event);
				if (event.relatedTarget == null) {
					mouseOverElement = null;
					if (touchCurrentPos != null) {
						touchEndHandler.call(this, event);
					}
				}
			}
			
			function mouseWheelHandler(event) {
				
				//var event = Event.getEvent(event);
				
				var scrollerMethod = this.getScrollerMethod();
				
				var cs = this.getContentSize();
				var cl = this.getClientSize();
				
				
				var s = this.getScrollPosition(this);
				
//				var sw = cs.width - cl.width;
//				var sh = cs.height - cs.height;
				
				var ss = this.getScrollSize();
				var sw = ss.width;
				var sh = ss.height;
				
				var wheelDeltaX;
				var wheelDeltaY;
				if ('wheelDeltaX' in event) {
//					console.log("webkit");
					wheelDeltaX = event.wheelDeltaX;
					wheelDeltaY = event.wheelDeltaY;
					
				} else if ('detail' in event) {
//					console.log("mozilla");
				    if (event.axis === 2) { 
				    	// Vertical
				    	wheelDeltaY = -event.detail * 12;
				    	wheelDeltaX = 0;
				    } else { 
				    	// Horizontal
				    	wheelDeltaX = -event.detail * 12;
				    	wheelDeltaY = 0;
				    }
				} else if ('wheelDelta' in event) {
					// ie / opera
					wheelDeltaX = 0;
					wheelDeltaY = event.wheelDelta;
				}

				var dx = - wheelDeltaX / 12;
				var dy = - wheelDeltaY / 12;
				
				
				if (!this.getPaging() && scrollerMethod == ScrollView.SCROLLER_METHOD_OVERFLOW) {
					if (!event.axis && !event.wheelDeltaX) {
						event.stopPropagation();
					}
					return;
				}
				
				
				if (!mouseWheelDelta) {
					// mousewheel start
					mouseWheelDelta = {x: 0, y: 0};
					mouseWheelVelocity = {x: 0, y: 0};
					touchStartTime = new Date().getTime();
					touchStartPos = s;
					touchInitialVector = {x: dx, y: dy}
//					touchStart.call(this, event);
					
				}
				
				// mousewheel move
				mouseWheelDelta.x+= dx;
				mouseWheelDelta.y+= dy;
//				var velocity = Math.sqrt(dx * dx + dy * dy);
				
				var v = {x: dx, y: dy};
				
				var o = (abs(v.x) > abs(v.y));
				
				if (sw > 0 && sh > 0 || sw > 0 && v.x != 0 && o || sh > 0 && v.y != 0 && !o) {
					event.stopPropagation();
					
					if (scrollerMethod != ScrollView.SCROLLER_METHOD_OVERFLOW) {
						event.preventDefault();
					}

					var time = new Date().getTime();
					
					if (this.getPaging()) {
						
						
						
						var velocity = Math.sqrt(dx * dx + dy * dy);
						var m = 1;

						dx*= 50;
						dy*= 50;
						
						var nx = s.x + dx;
						var ny = s.y + dy;

						if (dx > 0) {
							nx+= cl.width;
						} else if (dx < 0) {
							nx-= cl.width;
						}
						
						var n = getScrollPosInBounds.call(this, nx, ny);
						
						var p = getPageAt.call(this, nx, ny);
						
						if (n.x != s.x || n.y != s.y) {
							var touchTime = (time - touchStartTime) * 5;
							touchTime = Math.min(touchTime, 249);
							touchEnd.call(this, event, -dx, -dy, touchStartPos, touchTime);
							
							
						}
					} else {
						touchMove.call(this, event, dx, dy);
					}

					var target = this;
					window.clearTimeout(mouseWheelEndTimeoutId);
					mouseWheelEndTimeoutId = window.setTimeout(function() {
						// mousewheel end
						mouseWheelDelta = null;
						touchInitialVector = null;
//						__private.velocity = 0;
						touchStartPos = null;
						//interactionEnd.call(this);
						if (!scrollTransition.isPlaying()) {
							interactionEnd.call(this);
							scrollEnd.call(target);
						}
					}, 1);
					
					touchStartTime = time;

					var sw = cs.width - cl.width;
					var sh = cs.height - cl.height	
					
					if (dx != 0 && sw > 0 || dy != 0 && sh > 0) {
						//event.preventDefault();
					}
				}
				
				
				
				//return false;
			}
			
			
			
			// touch scrolling implementation 
			
			function touchStart(event) {
				mouseWheelDelta = null;
				touchInitialVector = null;
				
				scrollEnd.call(this);
				scrollTransition.stop();
				scrollPosition = getComputedScrollPosition.call(this); 
				
			}
			
			function touchMove(event, dx, dy) {

				if (dx != 0 || dy != 0) {

					if (touchInitialVector == null) {
						touchInitialVector = {x: dx, y: dy}
					}

					var s = this.getScrollPosition();
					
					var sx = s.x;
					var sy = s.y;
					
					var ss = this.getScrollSize();
					
					var sw = ss.width;
					var sh = ss.height;

					var bd = 0;
					if (StringUtils.toBoolean(this.bounces)) {
						bd = event.type != "mousewheel" && event.type != "DOMMouseScroll" ? parseFloat(this.bounceDistance) : 0;
					}
					
					var nx = sx;
					var ny = sy;

					var v = touchInitialVector;
					

					var o = (abs(v.x) > abs(v.y));
					
					

					if (sw > 0 && sh > 0 || sw > 0 && v.x != 0 && o || sh > 0 && v.y != 0 && !o) {
						
						if (sw > 0) {
							nx = sx + dx;
							var bx = bd;
							if (nx < -bx) {
								nx = -bx;
							} else if (nx > sw + bx) {
								nx = sw + bx;
							}
						}
						
						if (sh > 0) {
							ny = sy + dy;
							var by = bd;
							if (ny < -by) {
								ny = -by;
							} else if (ny > sh + by) {
								ny = sh + by;
							}
						}

						if (nx != sx || ny != sy) {
							
							interactionStart.call(this);
							scrollStart.call(this);
							
							if (!isNativeTouchScrolling.call(this)) {
								this.setScrollPosition(nx, ny);
								event.preventDefault();
//								event.stopPropagation();
							}

						} 

					}
					
				}
				
			}
			
			
			function touchEnd(event, dx, dy, s, touchTime) {
				
				
				var maxTouchTime = 250;
//				maxTouchTime = event.type != "mousewheel" && event.type != "DOMMouseScroll" ? maxTouchTime : 0; 
				var durationX = 0.25;
				var durationY = 0.25;
				
				touchTime = touchTime ? touchTime : new Date().getTime() - touchStartTime;
				
				var touchDistX = dx;
				var touchDistY = dy;

				var cls = this.getClientSize();
				var clw  = cls.width;
				var clh = cls.height;
				
				var cs = this.getContentSize();
				var cw = cs.width;
				var ch = cs.height;

				var sw = cw - clw;
				var sh = ch - clh;
				
				var bd = event.type != "mousewheel" && event.type != "DOMMouseScroll" ? parseFloat(this.bounceDistance) : 0; 
				
				var bouncing = StringUtils.toBoolean(this.bounces);
				
				var paging = this.getPaging();

				var horizontalPaging = paging;
				var verticalPaging = paging;

				s = s ? s : this.getScrollPosition();

				var sx = s.x;
				var sy = s.y;

				var n = getScrollPosInBounds.call(this, s.x, s.y);

				var nx = n.x;
				var ny = n.y;
				
				var v = touchInitialVector;

				if (v) {
					
					var o = (abs(v.x) > abs(v.y));

					
					if (sw > 0 && sh > 0 || sw > 0 && v.x != 0 && o || sh > 0 && v.y != 0 && !o) {

						// X
						if (sw > 0 && touchDistX != 0) {
							
							
							if (s.x < 0 || s.x > sw) {
								
								nx = s.x < 0 ? 0 : sw;
							} else {
								
								if (touchTime > 0 && touchTime < maxTouchTime) {
									// momentum scroll

									var x1, x2;
									if (horizontalPaging) {
										var px = Math.floor(s.x / clw) * clw;
										x1 = px - clw < 0 ? 0 : s.x == px ? px - clw : px;
										x2 = px + clw > sw ? sw : px + clw;
									} else {
										x1 = 0;
										x2 = sw;
									}
									maxDistX1 = s.x - x1;
									maxDistX2 = x2 - s.x;
									maxDistX1+= bouncing && x1 > 0 ? bd : 0;
									maxDistX2+= bouncing && x2 < sw ? bd : 0;

									var mx = momentum(touchDistX, touchTime, maxDistX1, maxDistX2);
									
									durationX = Math.max(mx.time / 1000, 0.25);
									nx = s.x - mx.dist;
									
									if (horizontalPaging) {
										if (touchDistX > 0 && nx > x1) {
											nx = x1;
										} else if (touchDistX < 0 && nx < x2) {
											nx = x2;
										}
									}
									
									
									
								}
							}
						}
						
						// Y
						if (sh > 0) {
							
							if (s.y < 0 || s.y > sh) {
								ny = s.y < 0 ? 0 : sh;
							} else {
								if (touchTime > 0 && touchTime < maxTouchTime) {
									// momentum scroll

									var y1, y2;
									
									if (verticalPaging) {
										var py = Math.floor(s.y / clh) * clh;
										y1 = py - clh < 0 ? 0 : s.y == py ? py - clh : py;
										y2 = py + clh > sh ? sh : py + clh;
									} else {
										y1 = 0;
										y2 = sh;
									}
									
									maxDistY1 = s.y - y1;
									maxDistY2 = y2 - s.y;
									
									maxDistY1+= bouncing && y1 > 0 ? bd : 0;
									maxDistY2+= bouncing && y2 < sh ? bd : 0;
									
				
									
									var my = momentum(touchDistY, touchTime, maxDistY1, maxDistY2);
									durationY = Math.max(my.time / 1000, 0.25);
									ny = s.y - my.dist;
									
									if (verticalPaging) {
										if (touchDistY > 0 && ny > y1) {
											ny = y1;
										} else if (touchDistY < 0 && ny < y2) {
											ny = y2;
										}
									}
								}
							}
						}
					}
				}
			

				if (nx != sx || ny != sy) {
					
					if (!isNativeTouchScrolling.call(this)) {
						this.scrollTo(nx, ny, Math.max(durationX, durationY));	
						event.preventDefault();
					}
				}

				// prevent default click execution
				if (typeof "touchstart" in window == "undefined") {
					
					if (touchDistX != 0 || touchDistY != 0) {
						var touchElem = event.type == "touchend" ? document.elementFromPoint(touchStartPos.x, touchStartPos.y) : event.target;
						
						if ((touchElem == this || DOM.isChildOf(touchElem, this))) {
							
//							if (!__private.clickDelegate) {
//								__private.clickDelegate = Delegate.create(this, clickHandler);
//							}
							
//							var click = 'click';
//							Element.addEventListener(touchElem, click, __private.clickDelegate, false);
//
//							if (typeof(touchElem['on' + click]) == "function" && touchElem['on' + click] != __private.clickDelegate) {
//								touchElem.__originalClickHandler = touchElem['on' + click];
//								touchElem['on' + click] = __private.clickDelegate;
//							}

						}
					}

				}

				
//				event.preventDefault();
				
				interactionEnd();
			}
			
			function scrollTransitionCompleteHandler(event) {
				scrollPosition = getComputedScrollPosition.call(scrollView);
				scrollToBounds.call(scrollView);
			}
			
			
			function windowResizeHandler(event) {
				if (this.getPaging()) {
					var page = this.getPage();
					var pos = getScrollPositionAtPage.call(this, page);
					this.setScrollPosition(pos.x, pos.y);
				}
			}
			
			
			var _paging = false;
			
			/**
			 * enables paging
			 * @privileged
			 * @method setPaging
			 * @param {Boolean} bool
			 */
			this.setPaging = function(bool) {
				bool = StringUtils.toBoolean(bool);
				if (bool != _paging) {
					_paging = bool;
					updateScrollerMethod.call(this);
					this.invalidate();
				}
			}
			
			/**
			 * returns true if paging is enabled.
			 * @privileged
			 * @method getPaging
			 * @return {Boolean} true if paging is enabled
			 */
			this.getPaging = function() {
				return _paging;
			}
			
			
			/**
			 * with paging enabled returns horizontal-client layout if not explicitly set
			 * @privileged
			 * @method getLayout
			 * @return {Layout} layout the layout.
			 */
			this.getLayout = function() {
				var layout = __parent.getLayout();
				if (this.getPaging() && !layout) {
					layout = new ClientFitLayout();
					layout.orientation = Layout.ORIENTATION_HORIZONTAL;
					layout.element = this;
				}
				return layout;
			}
			
			
			/**
			 * sets the scroller method
			 * @privileged
			 * @method setScrollerMethod
			 * @param {String} scrollerMethod the scroller method identifier
			 */
			this.setScrollerMethod = function(scrollerMethod) {
				console.log("set scroller method", scrollerMethod);
				if (scrollerMethod != _scrollerMethod) {
					var s = this.getScrollPosition();
					_scrollerMethod = scrollerMethod;
					updateScrollerMethod.call(this);
					this.setScrollPosition(s.x, s.y);
				}
			}
			
			/**
			 * gets the scroller method
			 * @privileged
			 * @method getScrollerMethod
			 * @return {String} the scroller method identifier
			 */
			this.getScrollerMethod = function() {
				if (_scrollerMethod) {
					return _scrollerMethod;
				}
//				if (this.getPaging()) {
//					return ScrollView.SCROLLER_METHOD_TRANSFORM;
//				}
				return ScrollView.SCROLLER_METHOD_OVERFLOW;
			}
			
			/**
			 * sets the scroll position
			 * @privileged
			 * @method setScrollPosition
			 * @param {Number} x the horizontal scroll position
			 * @param {Number} y the vertical scroll position
			 */
			this.setScrollPosition = function(x, y) {
				setScrollPosition.call(this, x, y);
				updatePage.call(this);
			}
			
			
			function setScrollPosition(x, y) {
				
				scrollPosition.x = x;
				scrollPosition.y = y;

				scrollTransition.stop();
				
				var scrollerMethod = this.getScrollerMethod();
				
				switch (scrollerMethod) {
				
					case ScrollView.SCROLLER_METHOD_OVERFLOW: 

						this.contentElem.scrollLeft = x;
						this.contentElem.scrollTop = y;

						break;
					
					case ScrollView.SCROLLER_METHOD_POSITION: 

						this.contentElem.style.left = -x + "px";
						this.contentElem.style.top = -y + "px";

						break;
						
					case ScrollView.SCROLLER_METHOD_TRANSFORM: 
					case ScrollView.SCROLLER_METHOD_TRANSFORM_3D: 
						
						var _3d = scrollerMethod == ScrollView.SCROLLER_METHOD_TRANSFORM_3D;
						var tr = _3d ? 'translate3d(' + (-x) + 'px, ' + (-y) + 'px, 0)' : 'translate(' + (-x) + 'px, ' + (-y) + 'px)';
						this.contentElem.style[transformStyle] = tr;
						
						break;
				}
				
				scrollEnd.call(this);
			}
			
			/**
			 * specifies whether the component should manage displayed items.
			 * @privileged
			 * @method setDisplayManagement
			 * @param {String} bool 
			 */
			this.setDisplayManagement = function(bool) {
				if (bool != _displayManagement) {
					_displayManagement = bool;
					updateDisplayedItems.call(this);
					//this.invalidate();
				}
			}
			
			/**
			 * gets the value of display management
			 * @privileged
			 * @method getScrollerMethod
			 * @return {String} true, if display management is enabled
			 */
			this.getDisplayManagement = function() {
				return _displayManagement;
			}
			
			
			function getComputedScrollPosition() {
				var x = 0; 
				var y = 0;

				var scrollerMethod = this.getScrollerMethod();
				
				switch (scrollerMethod) {
				
					case ScrollView.SCROLLER_METHOD_OVERFLOW: 
						
						x = this.contentElem.scrollLeft; 
						y = this.contentElem.scrollTop;
					
						break;
						
					case ScrollView.SCROLLER_METHOD_TRANSFORM:
					case ScrollView.SCROLLER_METHOD_TRANSFORM_3D: 
						
						var styleValue = Element.getComputedStyle(this.contentElem, transformStyle);

						var matrix = CSS.getTransformMatrix(styleValue);
						
						if (matrix) {
							
							x = -matrix.x; 
							y = -matrix.y;

						}

						break;
						
					case ScrollView.SCROLLER_METHOD_POSITION: 
						
						x = -parseInt(Element.getComputedStyle(this.contentElem, 'left'));
						y = -parseInt(Element.getComputedStyle(this.contentElem, 'top'));
						
						break;
						
					default: 
						
						x = y = 0;
				}
				
				x = isNaN(x) ? 0 : x;
				y = isNaN(y) ? 0 : y;
				
				return { x: Math.floor(x), y: Math.floor(y) }
			}
			
			/**
			 * gets the scroll position
			 * @privileged
			 * @method getScrollPosition
			 * @return {Object} an object containing the scroll position as x and y
			 */
			this.getScrollPosition = function() {
				return getComputedScrollPosition.call(this);
			}
			
			
			/**
			 * scrolls animated
			 * @privileged
			 * @method scrollTo
			 * @param {Number} x horizontal scroll position
			 * @param {Number} y vertical scroll position
			 * @param {Number} duration the duration in milliseconds. defaults to 0.5.
			 */
			this.scrollTo = function (x, y, duration) {

				console.log("scroll to: ", x, y, this.getPaging(), this.getScrollerMethod());
				
				duration = typeof duration != 'undefined' ? duration : 0.5;
				
				var s = this.getScrollPosition();
				var cs = this.getContentSize();
				
				x = Math.floor(x);
				y = Math.floor(y);

				if (x != s.x || y != s.y) {
					
					// scroll position changed.
					
					if (duration <= 0) {
						
						// if duration is 0 don't use a transition.
						this.setScrollPosition(x, y);
						
					} else {
						
						// init the transition
						var props = [];

						var startValue = [], endValue = [];

						var scrollerMethod = this.getScrollerMethod();
						
						switch (scrollerMethod) {
						
							case ScrollView.SCROLLER_METHOD_OVERFLOW: 
								
								if (x != s.x) {
									props.push('scrollLeft');
									startValue.push(s.x);
									endValue.push(x);
								}
									
								if (y != s.y) {
									props.push('scrollTop');
									startValue.push(s.y);
									endValue.push(y);
								}

								break;
								
							case ScrollView.SCROLLER_METHOD_TRANSFORM:
							case ScrollView.SCROLLER_METHOD_TRANSFORM_3D: 
								
								props = [transformStyle];
								var _3d = scrollerMethod == ScrollView.SCROLLER_METHOD_TRANSFORM_3D;
			
								var str = _3d ?  'translate3d(' + (-s.x) + 'px, ' + (-s.y) + 'px, 0)' : 'translate(' + (-s.x) + 'px, ' + (-s.y) + 'px)';
								startValue = [str];
								var etr = _3d ?  'translate3d(' + (-x) + 'px, ' + (-y) + 'px, 0)' : 'translate(' + (-x) + 'px, ' + (-y) + 'px)';
								endValue = [etr];
								break;
								
							case ScrollView.SCROLLER_METHOD_POSITION: 
								
								if (x != s.x) {
									props.push('left');
									startValue.push(-s.x + "px");
									endValue.push(-x + "px");
								}
									
								if (y != s.y) {
									props.push('top');
									startValue.push(-s.y + "px");
									endValue.push(-y + "px");
								}
								
								break;
							
						}
						
						
						if (!scrollTransition.element) {
							scrollTransition.element = this.contentElem;
						}
						
						scrollTransition.timingFunction = "ease-out";
						scrollTransition.property = props;
						scrollTransition.startValue = startValue;
						scrollTransition.endValue = endValue;
						scrollTransition.duration = duration;
						scrollTransition.start();
						
						// scroll start
						scrollStart.call(this);
					}				
				}
			}
			
			var isScrolling = false;
			
			
			function scrollStart() {
				if (!isScrolling) {
//					console.log("scroll start", this);
					isScrolling = true;
				}
			}
			
			function scrollEnd() {
				if (isScrolling) {
//					console.log("scroll end", this);
					isScrolling = false;
					this.dispatchEvent(Event.create('scrollend', false, false));
				}
			}

			
			this.isScrolling = function() {
				return isScrolling;
			}
			
			var isInteractive = false;
			var interactionTimeout = null;
			
			function interactionStart() {
				window.clearTimeout(interactionTimeout);
				interactionTimeout = null;
				if (!scrollView.isInteractive()) {
					isInteractive = true;
				}
			}
			
			function interactionEnd() {

				if (!interactionTimeout) {
					
					interactionTimeout = window.setTimeout(function() {
						if (scrollView.isInteractive()) {
							interactionTimeout = null;
							isInteractive = false;
						}
					}, 0);
				}
				
			}
			
			this.isInteractive = function() {
				return isInteractive;
			}
			
			/**
			 * gets the current page
			 * @privileged
			 * @method getPage
			 * @return {Number} the current page number
			 */
			this.getPage = function() {
				if (scrollTransition.isPlaying()) {
					return getPageAt.call(this, this.getScrollPosition());
				}
				return page || 1;
			}
			
			/**
			 * sets the current page
			 * @privileged
			 * @method setPage
			 * @param {Number} index the current page number
			 */
			this.setPage = function(index) {
				this.scrollToPage(index, 0);
			}
			
			/**
			 * gets the page at the specfied position
			 * @privileged
			 * @method getPageAt
			 * @return {Number} the page number
			 */
			this.getPageAt = function(x, y) {
				return getPageAt.call(this, {x: x, y: y});
			}
			
			
			// initialize
			
			 // configure listeners
			
			if ("ontouchstart" in window) {

				// touch support
				this.addEventListener("touchstart", Delegate.create(this, touchStartHandler), false);
				this.addEventListener("touchmove", Delegate.create(this, touchMoveHandler), false);
				//this.addEventListener("touchend", Delegate.create(this, touchEndHandler), false);
				
				// interaction end
				Element.addEventListener(this.ownerDocument, "touchend", Delegate.create(this, touchEndHandler), false);
			} else {
				// no touch support

				
//				this.addEventListener("mousedown", Delegate.create(this, mouseDownHandler), false);
				Element.addEventListener(this, "mousedown", Delegate.create(this, mouseDownHandler), false);
				Element.addEventListener(this.ownerDocument, "mouseup", Delegate.create(this, mouseUpHandler), false);
				Element.addEventListener(this, "mousemove", Delegate.create(this, mouseMoveHandler), false);
				// can't detect mouseup events from outside the window
				Element.addEventListener(this.ownerDocument, "mouseout", Delegate.create(this, mouseOutHandler), false);
//				
				var mouseWheelEvent = 'onmousewheel' in window ? 'mousewheel' : 'DOMMouseScroll';
				Element.addEventListener(this, mouseWheelEvent, Delegate.create(this, mouseWheelHandler), false);
				
				
//				Element.addEventListener(this.ownerDocument, "keydown", Delegate.create(this, keyDownHandler), false);
//				Element.addEventListener(this.ownerDocument, "keyup", Delegate.create(this, keyUpHandler), false);
				
			}
			
			Element.addEventListener(window, 'resize', Delegate.create(this, windowResizeHandler), false);
			
			// end constructor
		}
		
		
		
		
		
		
		
		
		// prototype
		
		Class.extend(Container, ScrollView);
		
		_parent = Class.getParent(ScrollView);

		
		/**
		 * position scroller method identifier
		 * @field SCROLLER_METHOD_POSITION
		 * @return {String} position
		 */
		ScrollView.SCROLLER_METHOD_POSITION = "position";
		
		/**
		 * transform scroller method identifier
		 * @field SCROLLER_METHOD_TRANSFORM
		 * @return {String} transform
		 */
		ScrollView.SCROLLER_METHOD_TRANSFORM = "transform"; 
		
		/**
		 * transform3d scroller method identifier
		 * @field SCROLLER_METHOD_TRANSFORM_3D
		 * @return {String} transform3d
		 */
		ScrollView.SCROLLER_METHOD_TRANSFORM_3D = "transform3d"; 
		
		/**
		 * overflow scroller method identifier
		 * @field SCROLLER_METHOD_OVERFLOW
		 * @return {String} overflow
		 */
		ScrollView.SCROLLER_METHOD_OVERFLOW = "overflow"; 

		function updateScrollerMethod() {
			//console.log("update scroller method");
			this.contentElem.style.position = "relative";
			var scrollerMethod = this.getScrollerMethod(); 
			switch (scrollerMethod) {
				case ScrollView.SCROLLER_METHOD_OVERFLOW: 
					this.contentElem.style.WebkitOverflowScrolling = "touch";
					this.contentElem.style.overflow = "auto";
					this.contentElem.style.minWidth = "";
					this.contentElem.style.minHeight = "";
					this.contentElem.style.width = "100%";
					this.contentElem.style.height = "100%";
					break;
				default: 
					
					this.contentElem.style.overflow = "visible";
					this.contentElem.style.minWidth = "";
					this.contentElem.style.minHeight = "";
					this.contentElem.style.width = "100%";
					this.contentElem.style.height = "100%";
					break;
			}
		}
		
		function isNativeTouchScrolling() {
			
			var scrollerMethod = this.getScrollerMethod();
			if (scrollerMethod == ScrollView.SCROLLER_METHOD_OVERFLOW) {
				if (!this.getPaging()) {
					var overflowScrollStyle = CSS.getVendorStyle('overflow-scrolling', true);
					if (overflowScrollStyle) {
						var overflowScrolling = Element.getComputedStyle(this.contentElem, overflowScrollStyle);
						return overflowScrolling == "touch";
					}
				}
			}
			return false;
		}
		
		function getPageAt(p) {
			
			if (p.x == 0 && p.y == 0) {
				return 1;
			}
			
			var s = getScrollPosInBounds.call(this, p.x, p.y);

			var clw, clh, cw, ch, cols, rows, col, row;

			var cs = this.getContentSize();
			cw = cs.width;
			ch = cs.height;
			
			var cls = this.getClientSize();
			clw = cls.width;
			clh = cls.height;
			//
			if (clw > 0 && clh > 0 && (cw > clw || ch > clh)) {
				
				if (cw <= clw) {
					return Math.floor(s.y / clh) + 1;
				} else if (ch <= clh){
					return Math.floor(s.x / clw) + 1;
				} else {
					cols = Math.ceil(cw / clw);
					rows = Math.ceil(ch / clh);
					col = Math.floor(s.x / clw);
					row = Math.floor(s.y / clh);
					p = row * cols + col + 1;
				}
				
				return p;
			}

			return 1;
		}
		
		function getScrollPositionAtPage(page) {
			
			if (page <= 1) {
				return {x: 0, y: 0}
			}
			var cls = this.getClientSize();
			var clw = cls.width;
			var clh = cls.height
			
			var cs = this.getContentSize();
			var cw = cs.width;
			var ch = cs.height;
			
			sw = cw - clw;
			sh = ch - clh;
			
			if (page > this.getPages()) {
				return {x: sw, y: sh}
			}
			
			var cols = Math.ceil(cw / clw);
			
			var px = (page - 1) % cols;
			var py = Math.floor((page - 1) / cols);
			
			var x = px * clw;
			var y = py * clh;
			
			x = x < sw ? x : sw;
			y = y < sh ? y : sh;
			
			x = x < 0 ? 0 : x;
			y = y < 0 ? 0 : y;
			
			return {x: Math.floor(x), y: Math.floor(y)}
			
		}

		function getScrollPosInBounds(sx, sy) {
			
			var nx = sx;
			var ny = sy;
			
			var paging = this.getPaging();
		
			var cls = this.getClientSize();
			var clw = cls.width;
			var clh = cls.height;
			
			var cs = this.getContentSize();
			var sw = cs.width - clw;
			var sh = cs.height - clh;

			if (paging) {

				var px = Math.floor(sx / clw) * clw;
				nx = sx - px >= px + clw - sx ? px + clw : px;
				
				
				var py = Math.floor(sy / clh) * clh;
				ny = sy - py >= py + clh - sy ? py + clh : py;
			}
			
			nx = nx <= 0 ? 0 : nx > sw ? sw : nx;
			ny = ny <= 0 ? 0 : ny > sh ? sh : ny;
			
			return {x: nx, y: ny}
		}
		
		
		
		function updateDisplayedItems() {
			
			var displayManagement = this.getDisplayManagement();
			
			if (displayManagement == "auto" && this.getPaging()) {
				
				console.log('update displayed items');
				
				var p = this.getPage() - 1;
				var s = this.getScrollPosition();
				var cls = this.getClientSize();
				var ss = this.getScrollSize();
				
				for (var i = 0; i < this.size(); i++) {
					var item = this.get(i);
					
					if (item.style) {
						var w = Element.getWidth(item);
						var h = Element.getHeight(item);
		
						if (i > p - 2 && i < p + 2) {
//							item.style.visibility = 'visible';
							item.style.display = '';
						} else {
//							item.style.visibility = 'hidden';
							item.style.display = 'none';
						}
					}
					
					
					
				}
			} else {
				for (var i = 0; i < this.size(); i++) {
					var item = this.get(i);
					if (item.style) {
						item.style.display = '';
					}
				}
			}
			
		}
		
		
		
		
		/**
		 * specifies the bouncing distance. defaults to 30.
		 * @property bounceDistance
		 * @return {Number} value in pixels
		 */
		ScrollView.prototype.bounceDistance = 30;
		
		/**
		 * specifies whether scrolling should bounce.
		 * @property bounces
		 * @return {Boolean} true or false
		 */
		ScrollView.prototype.bounces = false;
		
		ScrollView.prototype._createChildren = function() {
			_parent._createChildren.apply(this, arguments);
		}
		
		ScrollView.prototype._initialize = function() {
			_parent._initialize.apply(this, arguments);
			updateScrollerMethod.call(this);
		}
		
		ScrollView.prototype._update = function() {
			
			_parent._update.apply(this, arguments);
			
//			this.style.paddingLeft = "";
//			this.style.paddingTop = "";
//			this.style.paddingRight = "";
//			this.style.paddingBottom = "";
//			
//			var p = Element.getBorderMetrics(this, 'padding');
//			console.log("PPPPPP", this, p);
//			
			this.contentElem.style.WebkitBoxSizing = "border-box";
			this.contentElem.style.MozBoxSizing = "border-box";
//			this.contentElem.style.paddingLeft = p.left + "px";
//			this.contentElem.style.paddingTop = p.top + "px";
//			this.contentElem.style.paddingRight = p.right + "px";
//			this.contentElem.style.paddingBottom = p.bottom + "px";
//			this.style.padding = "0";
			
			
			
			updateDisplayedItems.call(this);
		}
		
		
		ScrollView.prototype.getScrollSize = function() {
			var cls = this.getClientSize();
			var cs = this.getContentSize();
			var sw = cs.width - cls.width;
			var sh = cs.height - cls.height;
			sw = sw > 0 ? sw : 0;
			sh = sh > 0 ? sh : 0;
			return {
				width: sw, 
				height: sh
			}
		}
		
		ScrollView.prototype.getPages = function() {
			var s = this.getScrollPosition();
			var cs = this.getContentSize();
			var cls = this.getClientSize();
			var px = Math.ceil(cs.width / cls.width);
			var py = Math.ceil(cs.height / cls.height);
			return px * py;
		}
		
		ScrollView.prototype.scrollToPage = function (page, duration) {		

			var currentPage = this.getPage();

			console.log("scroll to page: ", page, ", current: ", currentPage, duration);
			
			var d = duration >= 0 ? duration : 0.25;
			
			var p = getScrollPositionAtPage.call(this, page);
			
			var s = this.getScrollPosition();
			
			if (p.x != s.x || p.y != s.y) {
				if (d == 0) {
					
					this.setScrollPosition(p.x, p.y);
				} else {
					
					if (Math.abs(page - currentPage) == 1) {
						console.log("page is next, animate: ", page, d, p.x, p.y);
						this.scrollTo(p.x, p.y, d);
					} else {
						console.log("page is not next, not animate: ", page, d);
						this.setScrollPosition(p.x, p.y);
					}
				}
				
			}
			
		}
		
		return ScrollView;
	
	})());
	
})();