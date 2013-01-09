(function() {
	// import classes
	var Class = benignware.core.Class;
	var EventDispatcher = Class.require("benignware.core.EventDispatcher");
	var Event = Class.require("benignware.core.Event");
	var Element = Class.require("benignware.core.Element");
	var UserAgent = Class.require("benignware.util.UserAgent");
//	var Component = Class.require("benignware.core.Component");
	
//	var Delegate = Class.require("benignware.util.Delegate");
//	var CSS = Class.require("benignware.util.CSS");
//	var DOM = Class.require("benignware.util.DOM");
//	var Loader = Class.require("benignware.util.Loader");
//	
//	var Element = Class.require("benignware.core.Element");
//	var StringUtils = Class.require("benignware.util.StringUtils");
//	var ArrayUtils = Class.require("benignware.util.ArrayUtils");
	
	// define super
	var _parent;
	var brokenImages = [];

	/**
	 * Constructs a new ImageLoader element
	 * @constructor
	 */
	function ImageLoader(elem) {
		
		_parent.apply(this, arguments);
		
		var items = [];
		var isLoading = false;
		var imageLoader = this;
		
		function errorHandler(event) {
			
			var img = event.target;

			Element.addCSSName(img, 'error');
			
			Element.removeEventListener(img, 'complete', loadHandler);
			Element.removeEventListener(img, 'load', loadHandler);
			Element.removeEventListener(img, 'error', errorHandler);
			
			var errorEvent = new Event(ImageLoader.ERROR);
			errorEvent.element = img;
			imageLoader.dispatchEvent(errorEvent);
			
			if (imageLoader.isLoading() && imageLoader.isComplete()) {
				// complete
				isLoading = false;
				complete.call(imageLoader);
			}
		}
		
		function loadHandler(event) {
			
			event = Event.normalize(event);
			
			var img = event.target;

			
			Element.removeEventListener(img, 'load', loadHandler);
			Element.removeEventListener(img, 'error', errorHandler);
			
			window.setTimeout(function() {
				
				loaded.call(imageLoader, img);
				
				Element.removeCSSName(img, 'error');
				
				if (imageLoader.isLoading() && imageLoader.isComplete()) {
					Element.removeEventListener(img, 'complete', loadHandler);
					// complete
					isLoading = false;
					complete.call(imageLoader);
				}
			}, 1);
			
		}
		
		function loadElement(elem) {
			
			
			
			var lazy = false;
			var img = null;
			
			if (elem.isLoadable && elem.isLoadable()) {
				img = elem;
			} else if (elem.nodeName.toLowerCase() == 'img') {
				img = elem;
				
				
			} else {
				img = getCSSLoaderImageElem(elem);
			}

			Element.removeEventListener(img, 'load', loadHandler, false);
			Element.removeEventListener(img, 'complete', loadHandler, false);
			Element.removeEventListener(img, 'error', errorHandler, false);

			if (!img) {
				return;
			}
			
			if (elem.nodeName.toLowerCase() == 'img') {
				
				var src = img.getAttribute("src");

				
				
//				if (this.urlCaching) {
//					
//					if (urlCache[src]) {
//						// src was loaded before
//						return;
//					} else {
//						urlCache[src] = true;
//					}
//					
//				}
				
//				console.log("load elem", src);
				
				// image
				if (!src) {
					
					
					
					// lazy load image
					var src = ImageLoader.getResolutionSource(img);
//					console.log("lazy load loadElement: ", src);
					img.removeAttribute("data-source");
					if (src) {
						lazy = true;
						img.setAttribute("src", src);
					} else {
						// url is empty
						return;
					}
					
				} else {
					// image is already loading
					
				}

			}
			
			if (!ImageLoader.isComplete(img)) {
				
				Element.addEventListener(img, 'load', loadHandler, false);
				Element.addEventListener(img, 'complete', loadHandler, false);
				Element.addEventListener(img, 'error', errorHandler, false);
				
			} else {
//				console.log('is complete');
				
				if (lazy) {
					loaded.call(imageLoader, img);
				}
			}
			 
			
			if (!isLoading) {
				isLoading = true;
				loadStart.call(this);
			}
		}
		

		/**
		 * returns true if load is in progress
		 * @method isLoading
		 */
		this.isLoading = function() {
			return isLoading;
		}
		
		/**
		 * returns true if all items have been loaded.
		 */
		this.isComplete = function() {
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (!ImageLoader.isComplete(item)) {
					return false;
				}
			}
			return true;
		}
		
		
		this.add = function(item, index) {

//			console.log("ImageLoader::add() ", item, items);
			
			index = typeof(index) != "undefined" ? index : items.length;

			var start = false;
			
//			for (var e = 0; e < itemsToAdd.length; e++) {
				
//				item = itemsToAdd[e];
				
				items.splice(index, 0, item);
				
				// get loadable elements
				var elements = getLoadableElements(item);
				
				for (var i = 0; i < elements.length; i++) {
					
					var elem = elements[i];
					
//					console.log("ImageLoader::add() elem: ", elem, isElementLoaded.call(this, elem));
					
					if (!isElementLoaded.call(this, elem)) {
						
						loadElement.call(this, elem);

					} else {
						
						// complete
						// find error images
						
						
					}
				}
//			}
		}
		
		this.remove = function(item) {
			if (items && items.length) {
				for (var i = 0; i < items.length; i++) {
					if (item == items[i]) {
						items.splice(i, 1);
						i--;
					}
				}
			}
		}

		// end constructor
	}

	Class.register("benignware.util.ImageLoader", ImageLoader);

	Class.extend(EventDispatcher, ImageLoader);
	
	_parent = Class.getParent(ImageLoader);
	
	ImageLoader.LOAD = "load";
	ImageLoader.ERROR = "error";
	ImageLoader.LOAD_START = "loadStart";
	ImageLoader.COMPLETE = "complete";
	
	var urlCache = [];
	var resolutions = [];
	
	ImageLoader.prototype.errors = null;
	ImageLoader.prototype.urlCaching = true;
	
	ImageLoader.registerResolution = function(name, res) {
		if (typeof(res) == "string") {
			var sp = res.split("x");
			res = {
				name: name, 
				width: parseInt(sp[0]), 
				height: parseInt(sp[1])
			}
			resolutions.push(res);
		}
	}
	
	ImageLoader.registerResolution('small', '320x480');
	ImageLoader.registerResolution('medium', '768x1024');
	ImageLoader.registerResolution('large', '1680x1050');
	ImageLoader.registerResolution('big', '1920x1200');
	
	ImageLoader.getResolutionProfile = function() {
		var userAgent = UserAgent.getInstance();
		var screen = userAgent.pixelResolution;
		
		// TODO: order resolutions
		var res = null;
		for (var i = 0; i < resolutions.length; i++) {
//			console.log("resolutions[x]: ", screen.width, screen.height, resolutions[x].width, resolutions[x].height);
			if (screen.width <= resolutions[i].width && screen.height <= resolutions[i].height) {
				res = resolutions[i];
				break;
			}
		}
		if (res == null) {
			res = resolutions[resolutions.length - 1];
		}
		if (res) {
			return res;
		}
		return null;
	}
	
	ImageLoader.getResolutionSource = function(elements) {
		
		elements = elements.length ? elements : [elements];
		
		var userAgent = UserAgent.getInstance();
	
		
		var attrName = null;

//		alert("screen: " + screen.width + ", " + screen.height + "\n" 
//				+ "rec: " + res.width + ", " + res.height + ", " + resName);
		
		var value = null;
		
		var res = ImageLoader.getResolutionProfile();
		if (res && res.name) {
			// get data-source resolution
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];
				
				if (typeof(element[res.name]) != 'undefined') {
					value = element[res.name];
					break;
				}
				if (element.nodeType == 1) {
					value = element.getAttribute("data-source-" + res.name);
					
					if (value) {
						break;
					}
				}
				
			}
		}

		if (!value) {
			// get data-source
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];
				
				if (typeof(element['source']) != 'undefined') {
					value = element['source'];
					break;
				}
				if (element.nodeType == 1) {
					var attrValue = element.getAttribute("data-source");
					
					if (attrValue) {
						value = attrValue;
						break;
					}
				}
			}
		}
		
		if (!value) {
			// get src
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];
				if (element.nodeType == 1) {
					var attrValue = element.getAttribute("src");
					if (attrValue) {
						value = element.getAttribute(attrName);
						break;
					}	
				}
			}
		}
		return value;
	}
	
	function isLoadable(elem) {
		
		if (elem.nodeType != 1) return false;
		
		// image
		if (elem.nodeName.toLowerCase() == "img") {
			return true;
		}
		
		// css-image
		if (getCSSImage(elem)) {
			return true;
		}

		// loadable component
		if (elem.isLoadable && elem.isLoadable()) {
			return true;
		}
		

		return false;
	}
	
	function getLoadableElements(elem) {
		var result = [];
		if (elem) {
			if (isLoadable(elem)) {
				result.push(elem);
			} else {
				for (var i = 0; i < elem.childNodes.length; i++) {
					var child = elem.childNodes[i];
					result = result.concat(getLoadableElements.call(this, child));
				}
			}
		}
		return result;
	}
	
	
	function getCSSImage(elem) {
		var bgImgStyle = Element.getComputedStyle(elem, 'background');
		if (!bgImgStyle && elem.style) {
			bgImgStyle = elem.style.backgroundImage;
		}
		if (bgImgStyle && bgImgStyle != 'none') {
			var match = /url\(["]?([^"]*)["]?\)/g.exec(bgImgStyle);
			if (match != null) {
//				console.log("LOAD ELEM: ", elem, bgImgStyle);
				return match[1];
			}
		}
		return null;
	}
	
	function getCSSLoaderImageElem(elem) {
		var url = getCSSImage(elem);
		var img = null;
		if (url) {
			var doc = elem.ownerDocument;
			for (var i = 0; i < doc.body.childNodes.length; i++) {
				var child = doc.body.childNodes[i];
				if (child.nodeName.toLowerCase() == 'img' 
					&& child.getAttribute('src') == url) {
					img = child;
					break;
				}
			}
			if (!img) {
				img = doc.createElement('img');
				img.setAttribute('src', url);
				img.style.display = "none";
				doc.body.appendChild(img);
			}	
		}
		return img;
	}
	
	function isElementLoaded(elem) {
		
		var img = null;
		
		// css image

		if (elem.nodeName.toLowerCase() == 'img') {
			img = elem;
		} else {
			img = getCSSLoaderImageElem(elem);
		}
		
		if (!img) {
			return true;
		}
		
		var src = img.getAttribute('src');
		
		if (src == null && img.getAttribute("data-source") != null) {
			
			return false;
			
		} else if (typeof(img.complete) != "undefined") {
			
			return img.complete === true;
			
	    } else if (img.naturalHeight && img.naturalWidth) {
	    	return true;
		}
	    
	    return true;

	}
	
	function loadStart(elem) {
		var loadStartEvent = new Event(ImageLoader.LOAD_START, false, false);
		this.dispatchEvent(loadStartEvent);
	}
	
	function loaded(elem) {
		var loadEvent = new Event(ImageLoader.LOAD, false, false);
		loadEvent.element = elem;
		this.dispatchEvent(loadEvent);
	}
	
	function complete() {
		this.dispatchEvent(new Event(ImageLoader.COMPLETE, false, false));
	}
	
	ImageLoader.hasErrors = function(img) {
		return (img.getAttribute('src') && img.complete && img.naturalWidth == 0);
	}
	
	ImageLoader.isComplete = function(elem) {
		
		if (elem.nodeType == 1) {
			
			var images = getLoadableElements(elem);
			
			if (images.length) {
				var result = true;
				for (var i = 0; i < images.length; i++) {
					var img = images[i];
					
					if (!isElementLoaded.call(this, img)) {
						return false;
					} else {
						// complete
					}
				}
				
				return result;
			}
			return true;
		}
		return true;
	}
	
	return ImageLoader;
})();