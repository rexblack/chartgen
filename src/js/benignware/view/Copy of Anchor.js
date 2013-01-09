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
	var Transition = Class.require("benignware.core.Transition");
	
	var _parent;
	
	function Anchor() {
		_parent.apply(this, arguments);
	}
	
	
	Anchor.getByName = function(name) {
		name = name.replace('#', '');
		var doc = document;
		var anchors = doc.getElementsByTagName('a');
		for (var i = 0; i < anchors.length; i++) {
			var a = anchors[i];
			console.log("a: ", a, name);
			if (a.getAttribute("name") == name) {
				return a;
			}
		}
		return null;
	}
	
	Class.register("benignware.view.Anchor", Anchor);
	
	Class.extend(Component, Anchor);
	_parent = Class.getParent(Anchor);
	
	
	function getParentContainer(element) {
		var parent = element.parentNode;
		while(parent) {
			console.log('search for container', parent);
			if (parent.style) {
				var overflow = Element.getComputedStyle(parent, 'overflow');
				if (overflow == 'auto' || overflow == 'hidden') {
					return parent;
				}
			}
			
			parent = parent.parentNode;
		}
		return element.ownerDocument.body;
	}
	
	Anchor.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
		console.log('init anchor');
		
		var transition = new Transition();
		transition.element = this;
		
		this.addEventListener('click', Delegate.create(this, function(event) {
			
			Event.normalize(event);
			
			var href = this.getAttribute('href');
			var a = Anchor.getByName(href);
			
			Anchor.scrollToElement(a);
			
			event.preventDefault();
			
			return;
		}), false);
	}
	
	
	/**
	 * retrieves the nearest element to the viewport origin for the container of the specified element.
	 */
	Anchor.getViewportElement = function(element) {
		console.log("anchor get container: ", element);
		var container = getParentContainer(element);
		
		var pos = Element.getPosition(container);
		console.log("container: ", container, pos.x, pos.y);
		var border = Element.getBorderMetrics(container, 'margin', 'border', 'padding'); 
		var x = pos.x + border.left;
		var y = pos.y + border.top;
		var target = document.elementFromPoint(x, y);
		console.log("target: ", target);
		
		return target;
	}
	
	Anchor.getNextAnchor = function(element) {
		var current = Anchor.getViewportElement(element);
	}
	
	function nextInDOM(element, tagName, attrName, _previous, _searchParent) {
		
		_searchParent = typeof _searchParent == 'undefined' ? true : false;
		tagName = tagName.toLowerCase();
		var c = 0;
		var result = null;
		var siblingProp = _previous ? 'previousSibling' : 'nextSibling';
		console.log('find next', element, tagName, siblingProp);
		var child = element[siblingProp];
		while(child) {
			
			if (child.nodeType == 1) {
				
				if (child.nodeName.toLowerCase() == tagName && (!attrName || child.getAttribute(attrName) != null)) {
					return child;
				}
				
				if (child.childNodes.length > 0) {
					console.log('find in children');
					var first = _previous ? child.childNodes[0] : child.childNodes[child.childNodes.length - 1];
					if (first.nodeName.toLowerCase() == tagName && (!attrName || first.getAttribute(attrName) != null)) {
						return first;
					}
					
					result = nextInDOM(first, tagName, attrName, _previous, false);
					if (result) {
						return result;
					}
				}
				
				
				
				
			}
			
			child = child[siblingProp];
			
			if (c > 20) {
				console.log('break');
				break;
			}
			c++;
		}
		
		if (_searchParent && element.parentNode) {
			console.log('search parent: ', element.parentNode);
			result = nextInDOM(element.parentNode, tagName, attrName, _previous);
			if (result) {
				return result;
			}
		}
		
		console.log('end');
		
		return null;
	}
	
	function prevInDOM(element, tagName, attrName) {
		return nextInDOM(element, tagName, attrName, true);
	}
	
	
	Anchor.next = function(element) {
		console.log("next");
		var current = Anchor.getViewportElement(element);
		console.log("current", current);
		if (current) {
			var nextElem = nextInDOM(current, 'a', 'name');
			console.log("nextElem: ", nextElem);
			if (nextElem) {
				Anchor.scrollToElement(nextElem);
			}
		}
	}
	
	Anchor.previous = function(element) {
		console.log("previous");
		var current = Anchor.getViewportElement(element);
		console.log("current", current);
		if (current) {
			var prevElem = prevInDOM(current, 'a', 'name');
			if (prevElem) {
				Anchor.scrollToElement(prevElem);
			}
			console.log("prevElem: ", prevElem);
		}
	}
	
	var transition = new Transition();

	Anchor.scrollToElement = function(a, offset) {
		
		offset = offset || {x: 0, y: 0};

		var container = getParentContainer(a);
		var pos = Element.getPosition(a);
		
		
		
		var x = pos.x + offset.x;
		var y = pos.y + offset.y;
		
		console.log("scroll to: ", a, x, y);
		
		if (!transition.isPlaying() || (!transition.endValue || (x != transition.endValue[0] && y != transition.endValue[1]))) {
			
			
			if (transition) {
				transition.stop();
			}
			
			transition.element = container;
			transition.property = ['scrollLeft', 'scrollTop'];
			transition.endValue = [x, y];
			transition.duration = 0.5;
			transition.timingFunction = 'ease-in-out';
			
			transition.start();
		}
		
		
	}
	
	Anchor.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
	}
	
	Anchor.prototype._update = function() {
		_parent._update.apply(this, arguments);
	}
	
	return Anchor;
})();