(function(){
	
	/**
	 * shows an activity indicator with status message
	 * @class benignware.view.Anchor  
	 */
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	var DOM = Class.require("benignware.util.DOM");
	var UserAgent = Class.require("benignware.util.UserAgent");
	var Transition = Class.require("benignware.core.Transition");
	
	var _parent;
	
	function Anchor() {
		_parent.apply(this, arguments);
	}
	
	// static
	
	Anchor.duration = 0.5;
	Anchor.offset = {x: 0, y:0}
	
	Anchor.getByName = function(name) {
		name = name.replace('#', '');
		var doc = document;
		var anchors = doc.getElementsByTagName('a');
		for (var i = 0; i < anchors.length; i++) {
			var a = anchors[i];
			if (a.getAttribute("name") == name) {
				return a;
			}
		}
		return null;
	}
	
	Class.register("benignware.view.Anchor", Anchor);
	
	Class.extend(Component, Anchor);
	_parent = Class.getParent(Anchor);
	
	function getOverflowContainer(element) {
		var containers = getOverflowContainers(element);
		return containers[0];
	}
	
	function getOverflowContainers(element) {
		var elem = element;
		var result = [];
		
		while(elem) {
			
			var container = null;
			
			if (elem.style) {
				
				var display = Element.getComputedStyle(elem, 'display');
				
				if (elem.scrollTo) {
					container = elem;
				} else {
					var overflow = Element.getComputedStyle(elem, 'overflow');
					if ((overflow == "scroll" || overflow == "auto") && elem.scrollHeight > 0) {
						if (elem.parentNode && elem.parentNode.scrollTo && elem.parentNode.contentElem == elem) {
							// content element of a scrollview
						} else {
							container = elem;
						}
					}
				}
				
				
				
				
				
				if (container) {
					result.push(container);
				}
			}
			
			
			elem = elem.parentNode;
		}
		
		if (result.length) {
			return result;
		}
		
		return [UserAgent.getInstance().firefox ? element.ownerDocument.documentElement : element.ownerDocument.body];
	}
	
	Anchor.prototype.duration;
	Anchor.prototype.offset;
	
	Anchor.initialize = function(element) {
		
		element = element || document;
		
		var touchStartEvent = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
		var touchMoveEvent = 'ontouchmove' in window ? 'touchmove' : 'mousemove';
		var touchEndEvent = 'ontouchend' in window ? 'touchend' : 'mouseup';
		var clickEvent = 'click';
		
		var down = false;
		var dragging = false;
		var dispatched = false;
		
		function startHandler(event) {
			down = true;
			dispatched = false;
			element.addEventListener(touchMoveEvent, moveHandler, false);
		}
		
		element.addEventListener(touchStartEvent, startHandler, false);
		
		function moveHandler(event) {
			if (down) {
				dragging = true;
			}
		}
		
		
		
		function upHandler(event) {
			Event.normalize(event);
			var element = event.target;
			var anchor = element.tagName && element.tagName.toLowerCase() == "a" ? element : DOM.getParentByTagName(element, 'a');
			if (anchor) {
				
				if (dragging) {
					element.addEventListener(clickEvent, clickHandler, false);
				} else {
					var href = anchor.getAttribute('href');
					if (href) {
						var a = Anchor.getByName(href);
						if (a) {
							Anchor.scrollTo(a);
							element.addEventListener(clickEvent, clickHandler, false);
						} else {
//							console.log("ANCHOR NOT FOUND", href);
						}
					}
				}
			}
			dragging = false;
			down = false;
			element.removeEventListener(touchMoveEvent, moveHandler, false);
		}
		
		element.addEventListener(touchEndEvent, upHandler, false);
		

		function clickHandler(event) {
			event.preventDefault();
			element.removeEventListener(clickEvent, clickHandler, false);
		}
		
		
	}

	Anchor.initialize(document);
	
	
	Anchor.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
		
		var transition = new Transition();
		transition.element = this;
	
		this.addEventListener('click', Delegate.create(this, function(event) {
			
//			Event.normalize(event);
//			
//			var href = this.getAttribute('href');
//			var a = Anchor.getByName(href);
//			
//			Anchor.scrollToElement(a);
//			
//			event.preventDefault();
			
			return;
			
		}), false);	
		
		this.addEventListener('click', Delegate.create(this, function(event) {
			
//			Event.normalize(event);
//			
//			var href = this.getAttribute('href');
//			var a = Anchor.getByName(href);
//			
//			Anchor.scrollToElement(a);
//			
//			event.preventDefault();
			
			return;
		}), false);
	}
	

	/**
	 * retrieves the nearest element to the viewport origin for the container of the specified element.
	 */
	Anchor.getViewportElement = function(container, offset) {
		
		var pos = Element.getPosition(container);

		var border = Element.getBorderMetrics(container, 'margin', 'border', 'padding'); 
		
		// traverse the dom to find element
		var current = container;
		var c = 0;
		while(child = DOM.next(current)) {
			if (child.nodeType == 1) {
				var hasChildElems = hasChildElements(child);
				if (!hasChildElems && inViewport(child, offset)) {
					return child;
				}
			}

			current = child;
		}

		
		return null;
	}
	
	function hasChildElements(element) {
		if (element.nodeType == 1) {
			if (element.childNodes.length == 0) {
				return false;
			}
			for (var i = 0; i< element.childNodes.length; i++) {
				if (element.childNodes[i].nodeType == 1) {
					return true;
				}
			}
		}
		return false;
	}
	
	function inViewport (el, offset) {
		
		offset = typeof offset != 'undefined' ? offset : Class.instanceOf(el, Anchor) ? el.offset : Anchor.offset;

		var r, html;
	    if ( !el || 1 !== el.nodeType ) { return false; }
	    html = document.documentElement;
	    r = el.getBoundingClientRect();
	    return ( !!r 
	      && r.bottom > offset.y
	      && r.right > offset.x
	      && r.top < html.clientHeight + offset.y
	      && r.left < html.clientWidth + offset.x
	    );

	}
	
	function isVisible(element) {
		var elem = element;
		while (elem) {
			if (elem.style) {
				
				var position = Element.getComputedStyle(elem, 'position');
				if (position == 'fixed' || position == 'absolute') {
					return false;
				}
				
				var display = Element.getComputedStyle(elem, 'display');
				if (display == 'none') {
					return false;
				}
				var height = Element.getHeight(elem);
				if (height == 0) {
					return false;
				}
			}
			elem = elem.parentNode;
		}
		return true;
	}
	
	
	Anchor.getNextAnchor = function(element) {
		var child = null;
		var current = element;
		while(child = DOM.next(current)) {
			if (child.tagName && child.tagName.toLowerCase() == 'a' && child.getAttribute('name')) {
				return child;
			}
			current = child;
		}
	}
	
	Anchor.getPreviousAnchor = function(element) {
		var child = null;
		var current = element;
		while(child = DOM.previous(current)) {
			
			if (child.tagName && child.tagName.toLowerCase() == 'a' && child.getAttribute('name')) {
				return child;
			}
			current = child;
		}
	}
	
	Anchor.next = function(element, container, duration, offset) {
		var current = Anchor.getViewportElement(container, offset);
		if (current) {
			var a = Anchor.getNextAnchor(current);
			if (a) {
				Anchor.scrollTo(a, duration, offset);
			}
			return a;
		}
	}
	
	Anchor.previous = function(element, container, duration, offset) {
		var current = Anchor.getViewportElement(container, offset);
		if (current) {
			var a = Anchor.getPreviousAnchor(current);
			if (a) {
				Anchor.scrollTo(a, duration, offset);
			}
			return a;
		}
		return null;
	}
	
	var transition = new Transition();

	function userInteractionHandler(event) {
		transition.stop();
	}
	var mouseWheelEvent = 'onmousewheel' in window ? 'mousewheel' : 'DOMMouseScroll';
	Element.addEventListener(document, mouseWheelEvent, userInteractionHandler, false);
	var downEvent = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
	Element.addEventListener(document, downEvent, userInteractionHandler, false);
		
	Anchor.isAnchor = function(element) {
		return element.nodeName.toLowerCase() == 'a' && element.name;
	}
	
	var isScrolling = false;
	
	Anchor.scrollToHash = function(name, duration, offset) {
		var anchor = Anchor.getByName(name);
		if (anchor) {
			Anchor.scrollTo(anchor, duration, offset);
		}
		return anchor;
	}
	
	Anchor.scrollTo = function(element, duration, offset) {
		
		duration = typeof duration == 'number' ? duration : Class.instanceOf(element, Anchor) ? element.duration : Anchor.duration;
		offset = typeof offset != 'undefined' ? offset : Class.instanceOf(element, Anchor) ? element.offset : Anchor.offset;

		var containers = getOverflowContainers(element);	
		
		if (isScrolling) {
			// can only handle one scroll at a time
//			return;
		}
		
		isScrolling = true;
		
		var transitionViewCount = 0;
		var transitionEndCount = 0;
		
		for (var i = 0; i < containers.length; i++) {
			
			var container = containers[i];
			var elementInView = inViewport(element, offset);
			var containerInView = inViewport(container, offset);
			
			var pos = Element.getPosition(element, container);
			
			var x = pos.x - offset.x;
			var y = pos.y - offset.y;

			x = x < 0 ? 0 : x;
			y = y < 0 ? 0 : y;
			
			var transitionCompleteHandler = function(event) {
				transitionEndCount++;
				if (transitionViewCount == transitionEndCount) {
					var page = container.getPage ? container.getPageAt(x, y) : -1;
					if (Anchor.isAnchor(element)) {
						Anchor.setHash(element.name);
					}
					isScrolling = false;
				}
				container.removeEventListener('transitioncomplete', transitionCompleteHandler, false);
				container.removeEventListener('scrollend', transitionCompleteHandler, false);
			}
			
			var d = duration;
			if (!containerInView) {
				// if the current container is not in view, don't animate
				d = 0;
			}
			
			if (container.scrollTo) {
				
				// scroll view
				
				if (container.getScrollerMethod() == benignware.view.ScrollView.SCROLLER_METHOD_POSITION) {
					// workaround for position scroll method
					var s = container.getScrollPosition();
					var cls = container.getClientSize();
					container.setScrollPosition(0, 0);
					pos = Element.getPosition(element, container);
					container.setScrollPosition(s.x, s.y);
					x = pos.x - offset.x;
					y = pos.y - offset.y;
					x = x < 0 ? 0 : x;
					y = y < 0 ? 0 : y;
				}
				
				container.addEventListener('scrollend', transitionCompleteHandler, false);
				
				if (container.scrollToPage && container.getPaging() && container.getPageAt) {
					
					var page = container.getPageAt(x, y);
					container.scrollToPage(page, d);
					
				} else {
					container.scrollTo(x, y, d);
				}
				
				if (container.isScrolling()) {
					transitionViewCount++;
				}
				
			} else {
				
				// other container
				
				if (!transition.isPlaying() || (!transition.endValue || (x != transition.endValue[0] && y != transition.endValue[1]))) {
					
					if (transition) {
						transition.stop();
					}
					
					transition.addEventListener('transitioncomplete', transitionCompleteHandler, false);
					transition.element = container;
					transition.property = ['scrollLeft', 'scrollTop'];
					transition.endValue = [x, y];
					transition.duration = d == 0 ? d : duration;
					transition.timingFunction = 'ease-in-out';
					
					transitionViewCount++;
					
					transition.start();
				}
				
				
			}
		}

		if (transitionViewCount == transitionEndCount) {
			if (Anchor.isAnchor(element)) {
				Anchor.setHash(element.name);
			}
//			window.location.hash = element.name;
			isScrolling = false;
		}
		
	}
	
	
	var updateHashTimeout = null;
	
	Anchor.setHash = function(hash) {
		
		var locHash = window.location.hash.slice(1);
		
		if (updateHashTimeout) {
			window.clearTimeout(updateHashTimeout);
			updateHashTimeout = null;
		}
		updateHashTimeout = window.setTimeout(function() {
			var sx = document.body.scrollLeft;
			var sy = document.body.scrollTop;
			var overflowElems = getOverflowElements(document);
			if (hash != locHash) {
				window.location.hash = hash;
				// restore positions
				for (var i = 0; i < overflowElems.length; i++) {
					var item = overflowElems[i]; 
					item.element.scrollTop = item.scrollTop;
					item.element.scrollLeft = item.scrollLeft;
				}
			}
			
		}, 100);
	}
	
	
	
	function getOverflowElements(elem) {
		var result = [];

		for (var i = 0; i < elem.childNodes.length; i++) {
			var child = elem.childNodes[i];
			
			
			if (child.nodeType == 1) {
				var overflow = Element.getComputedStyle(child, 'overflow');
				
				if (typeof child.scrollTop != 'undefined' && (overflow == 'auto' || overflow == 'scroll' || overflow == 'hidden')) {
					result.push({
						element: child,
						scrollTop: child.scrollTop, 
						scrollLeft: child.scrollLeft
					})
				}

				// traverse if no scrollview
				if (!child.scrollTo) {
					var m = getOverflowElements(child);
					if (m.length > 0) {
						result = result.concat(m);
					}	
				}
				
				
				
			}
		}
		return result;
	}
	
	Anchor.removeHash = function () { 
	    var scrollV, scrollH, loc = window.location;
	    if ("pushState" in history)
	        history.pushState("", document.title, loc.pathname + loc.search);
	    else {
	        // Prevent scrolling by storing the page's current scroll offset
	        scrollV = document.body.scrollTop;
	        scrollH = document.body.scrollLeft;

	        loc.hash = "";

	        // Restore the scroll offset, should be flicker free
	        document.body.scrollTop = scrollV;
	        document.body.scrollLeft = scrollH;
	    }
	}
	
	window.onhashchange = function(event) {
		event.preventDefault();
		return null;
	}
	
	Element.addEventListener(window, 'hashchange', function(event) {
		event.preventDefault();
	}, false);
	
	Anchor.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
	}
	
	Anchor.prototype._update = function() {
		_parent._update.apply(this, arguments);
	}
	
	
	return Anchor;
})();