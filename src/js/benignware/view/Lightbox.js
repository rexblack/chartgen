(function(){
	
	/**
	 * shows an activity indicator with status message
	 * @class benignware.view.Lightbox  
	 */
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Container = Class.require("benignware.core.Container");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	var DOM = Class.require("benignware.util.DOM");
	var ItemLayout = Class.require("benignware.layout.ItemLayout");
	
	var _parent;
	
	CSS.setDefaultStyle(".benignware-view-Lightbox", "margin", "30px");
//	CSS.setDefaultStyle(".benignware-view-Lightbox", "width", "320px");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "min-width", "240px");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "max-width", "420px");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "max-height", "100%");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "z-index", "10000");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "position", "fixed");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "top", "0");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "left", "0");
//	CSS.setDefaultStyle(".benignware-view-Lightbox", "border", "2px solid #a1a1a1");
	
	CSS.setDefaultStyle(".benignware-view-Lightbox.hidden", "opacity", "0");
//	CSS.setDefaultStyle(".benignware-view-Lightbox.hidden", "visibility", "inherit");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "opacity", "1");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "-moz-transition-property", "opacity, visibility");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "-moz-transition-duration", "0.15s");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "-moz-transition-timing-function", "ease-in");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "-webkit-transition-property", "opacity, visibility");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "-webkit-transition-duration", "0.15s");
	CSS.setDefaultStyle(".benignware-view-Lightbox", "-webkit-transition-timing-function", "ease-in");
	
	
	CSS.setDefaultStyle(".benignware-view-Lightbox-background", "position", "fixed");
	CSS.setDefaultStyle(".benignware-view-Lightbox-background", "top", "0");
	CSS.setDefaultStyle(".benignware-view-Lightbox-background", "left", "0");
	CSS.setDefaultStyle(".benignware-view-Lightbox-background", "width", "100%");
	CSS.setDefaultStyle(".benignware-view-Lightbox-background", "height", "100%");
	CSS.setDefaultStyle(".benignware-view-Lightbox-background", "background", "#6e6e6e");
	CSS.setDefaultStyle(".benignware-view-Lightbox-background", "opacity", "0.8");
	CSS.setDefaultStyle(".benignware-view-Lightbox-background", "z-index", "10000");
	
	CSS.setDefaultStyle(".benignware-view-Lightbox .lightbox-header", "position", "relative");
	CSS.setDefaultStyle(".benignware-view-Lightbox .lightbox-header", "background", "#adadad");
	
	CSS.setDefaultStyle(".benignware-view-Lightbox .lightbox-caption", "display", "block");
	CSS.setDefaultStyle(".benignware-view-Lightbox .lightbox-caption", "padding", "5px");
	CSS.setDefaultStyle(".benignware-view-Lightbox .lightbox-caption", "position", "relative");
	CSS.setDefaultStyle(".benignware-view-Lightbox .lightbox-caption", "float", "left");
	
	CSS.setDefaultStyle(".benignware-view-Lightbox .lightbox-close", "background", "url(" + Class.getPath('benignware.view.Lightbox', 'close.gif') + ") no-repeat center");
	CSS.setDefaultStyle(".benignware-view-Lightbox .lightbox-close", "width", "16px");
	CSS.setDefaultStyle(".benignware-view-Lightbox .lightbox-close", "height", "16px");
	CSS.setDefaultStyle(".benignware-view-Lightbox .lightbox-close", "float", "right");
	CSS.setDefaultStyle(".benignware-view-Lightbox .lightbox-close", "cursor", "pointer");
	
	CSS.setDefaultStyle(".benignware-view-Lightbox .content-layer", "clear", "both");
//	CSS.setDefaultStyle(".benignware-view-Lightbox .content-layer", "background", "#fff");
	CSS.setDefaultStyle(".benignware-view-Lightbox .content-layer", "overflow", "auto");
//	CSS.setDefaultStyle(".benignware-view-Lightbox .content-layer", "padding", "5px");
	CSS.setDefaultStyle(".benignware-view-Lightbox .content-layer", "position", "relative");
	CSS.setDefaultStyle(".benignware-view-Lightbox .content-layer", "-webkit-overflow-scrolling", "touch");
	
	CSS.setDefaultStyle(".benignware-view-Lightbox.maximized", "margin", "0");
	CSS.setDefaultStyle(".benignware-view-Lightbox.maximized", "max-width", "none");
	CSS.setDefaultStyle(".benignware-view-Lightbox.maximized", "max-height", "none");
	CSS.setDefaultStyle(".benignware-view-Lightbox.maximized", "width", "100%");
	CSS.setDefaultStyle(".benignware-view-Lightbox.maximized", "height", "100%");
	
	CSS.setDefaultStyle(".benignware-view-Lightbox.maximized .content-layer", "height", "100%");

	
	function Lightbox() {
		_parent.apply(this, arguments);
		
		var lightbox = this;
		
		var downEvent = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
		var upEvent = 'ontouchend' in window ? 'touchend' : 'click';
		
		function showHandler(event) {
			console.log('show handler');
			Element.addEventListener(lightbox.ownerDocument, downEvent, downHandler, false);
			lightbox.addEventListener('hide', hideHandler, false);
		}
		
		function hideHandler(event) {
			console.log('hide handler');
			Element.removeEventListener(lightbox.ownerDocument, downEvent, downHandler, false);
		}
		
		function downHandler(event) {
			var target = event.target || event.srcElement;
			console.log("down handler", target);
			Element.addEventListener(lightbox.ownerDocument, upEvent, clickHandler, false);
		}
		
		function clickHandler(event) {
			Element.removeEventListener(lightbox.ownerDocument, upEvent, clickHandler, false);
			var target = event.target || event.srcElement;
			if (target != lightbox && !DOM.isChildOf(target, lightbox)) {
				lightbox.hide();
				var backgroundDisplay = Element.getComputedStyle(lightbox.backgroundElem, 'display');
				if (backgroundDisplay != 'none') {
					var target = event.target || event.srcElement;
					if (target.nodeName.toLowerCase() == "a" && target.getAttribute('href')) {
						event.preventDefault();
						event.stopPropagation();
					}
					return false;
				}
			}
			
		}
		
		this.addEventListener('show', showHandler, false);
	}
	
	Class.register("benignware.view.Lightbox", Lightbox);
	
	Class.extend(Container, Lightbox);
	_parent = Class.getParent(Lightbox);
	
	Lightbox.prototype.backgroundElem = null;
	Lightbox.prototype.headerElem = null;
	Lightbox.prototype.captionElem = null;
	Lightbox.prototype.closeElem = null;
	Lightbox.prototype.originalParentElem = null;
	
	Lightbox.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
	}
	
	Lightbox.prototype._createChildren = function() {

		_parent._createChildren.apply(this, arguments);
		
		var backgroundElem = this.ownerDocument.createElement('div');
		backgroundElem.className = 'benignware-view-Lightbox-background';
		this.insertBefore(backgroundElem, this.contentElem);
		this.backgroundElem = backgroundElem;
		
		var headerElem = this.ownerDocument.createElement('div');
		headerElem.className = 'lightbox-header';
		this.insertBefore(headerElem, this.contentElem);
		this.headerElem = headerElem;
		
		var captionElem = this.ownerDocument.createElement('div');
		captionElem.className = 'lightbox-caption';
		this.headerElem.appendChild(captionElem);
		this.captionElem = captionElem;
		
		var closeElem = this.ownerDocument.createElement('div');
		var downEvent = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
		
		Element.addEventListener(closeElem, downEvent, Delegate.create(this, function(event) {
			this.hide();
			event.preventDefault();
		}), false);
		closeElem.className = 'lightbox-close';
		this.headerElem.appendChild(closeElem);
		this.closeElem = closeElem;
		
		var clearElem = this.ownerDocument.createElement('div');
		clearElem.style.clear = "both";
		this.headerElem.appendChild(clearElem);
		console.log('initial hide');
		this.hide();
	}
	
	Lightbox.prototype._update = function() {
		
//		document.body.height = "100%";
		
		var size = Element.getDocumentSize(this.ownerDocument);
//		console.log("win size: ", size.height, document.getElementsByTagName('body')[0].clientHeight);
//		
		Element.setSize(this.backgroundElem, size.width, size.height);
		
		this.backgroundElem.style.display = "none";
		var offsetParent = this.offsetParent || document.body;
		
		var b = Element.getBorderMetrics(this, 'border', 'margin');

		var styleHeight = this.contentElem.style.height;
		this.contentElem.style.height = "auto";
		
		var contentHeight = Element.getOuterHeight(this.contentElem);
		var headerHeight = Element.getOuterHeight(this.headerElem);
		
		if (size.height < contentHeight + headerHeight + b.top + b.bottom) {
			Element.setOuterHeight(this.contentElem, size.height - headerHeight - b.top - b.bottom);
		} else {
			this.contentElem.style.height = styleHeight;
		}
		
		var ws = this.style.width;
		this.style.width = "";
		var width = Element.getOuterWidth(this);
//		if (size.width < width) {
//			Element.setOuterWidth(this, size.width);
//		} else {
//			this.style.width = ws;
//		}
		
		var w = Element.getOuterWidth(this);
		var h = Element.getOuterHeight(this);
		var x = b.left + (size.width - w - b.right - b.left) * 0.5;
		var y = b.top + (size.height - h - b.bottom - b.top) * 0.5;
		x = x < 0 ? 0 : x;
		y = y < 0 ? 0 : y;
		
		this.style.left = x + "px";
		this.style.top = y + "px";

//		this.style.width = "auto";
//		this.style.height = "auto";
		
		
//		
//		var contentHeight = this.getContentSize().height;
//		console.log(size.height, captionHeight, contentHeight);
//		if (size.height <= captionHeight + contentHeight) {
//			Element.setHeight(this.contentElem, size.height - captionHeight);
//		} else {
//			this.contentElem.style.height = "auto";
//		}
//		this.contentElem.style.borderTop = captionHeight + "px";
		
//		
//		var contentHeight = Element.getOuterHeight(this.contentElem);
		
//		this.contentElem.style.display = "none";
//		console.log("size:", size.height, this.getHeight());
//		if (size.height < this.getHeight()) {
//			
//			Element.setHeight(this.contentElem, );
//		}
		
		this.backgroundElem.style.display = "";
//		this.contentElem.style.display = "";

		console.log('update lightbox');
	}
	
	Lightbox.prototype.setCaption = function(text) {
		this.captionElem.innerHTML = text;
	}
	
	Lightbox.prototype.getCaption = function() {
		return this.captionElem.innerHTML;
	}
	
	Lightbox.prototype.setMaximized = function(bool) {
		if (bool) {
			this.addCSSName('maximized');
		} else {
			this.removeCSSName('maximized');
		}
		this.invalidate();
	}
	
	Lightbox.prototype.getMaximized = function() {
		return Element.hasCSSName(this, 'maximized');
	}
	
	Lightbox.prototype.show = function() {
		console.log('show lightbox');
		this.originalParentElem = this.parentNode;
		this.ownerDocument.body.appendChild(this);
		this.ownerDocument.body.insertBefore(this.backgroundElem, this);
		_parent.show.apply(this, arguments);
	}
	
	Lightbox.prototype.hide = function() {
		console.log('hide lightbox');
		if (this.originalParentElem) {
			this.originalParentElem.appendChild(this);
		}
		this.insertBefore(this.backgroundElem, this.headerElem);
		_parent.hide.apply(this, arguments);
	}
	
	return Lightbox;
})();