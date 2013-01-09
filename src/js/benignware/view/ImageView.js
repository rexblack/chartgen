(function() {
	
	
	/**
	 * image view component
	 * @class benignware.view.ImageView
	 */
	
	var Class = benignware.core.Class;
	var Component = Class.require("benignware.core.Component");
	var Element = Class.require("benignware.core.Element");
	var Event = Class.require("benignware.core.Event");
	var CSS = Class.require("benignware.util.CSS");
	var Delegate = Class.require("benignware.util.Delegate");
	
	var ImageLoader = Class.require("benignware.util.ImageLoader");
	var ActivityView = Class.require("benignware.view.ActivityView");
	
	var _parent;
	
	function ImageView() {
		_parent.call(this);
		
		//this.resizeDelay = 0.5;
		
		var _useCSS = true;
		var _scaleMode = ImageView.SCALE_MODE_CONTAIN;
		var _verticalAlign = ImageView.ALIGN_CENTER;
		var _horizontalAlign = ImageView.ALIGN_CENTER;
		
		this.setUseCss = function(useCSS) {
			if (useCSS != _useCSS) {
				_useCSS = useCSS;
				this.invalidate();
			}
		}
		
		this.getUseCss = function() {
			return _useCSS && CSS.isSupported('background-size');
		}
		
		this.setScaleMode = function(scaleMode) {
			if (scaleMode != _scaleMode) {
				_scaleMode = scaleMode;
				this.invalidate();
			}
		}
		
		this.getScaleMode = function() {
			return _scaleMode;
		}
		
		this.setHorizontalAlign = function(align) {
			if (align != _horizontalAlign) {
				_horizontalAlign = align;
				this.invalidate();
			}
		}
		
		this.getHorizontalAlign = function() {
			return _horizontalAlign;
		}
		
		this.setVerticalAlign = function(align) {
			if (align != _verticalAlign) {
				_verticalAlign = align;
				this.invalidate();
			}
		}
		
		this.getVerticalAlign = function() {
			return _verticalAlign;
		}
	}
	
	Class.extend(Component, ImageView);
	
	_parent = Class.getParent(ImageView);
	
	Class.register("benignware.view.ImageView", ImageView);
	
	
	CSS.setDefaultStyle(".benignware-view-ImageView", "position", "relative");
//	CSS.setDefaultStyle(".benignware-view-ImageView", "-webkit-transform", "translateZ(0px)");
	CSS.setDefaultStyle(".benignware-view-ImageView", "overflow", "hidden");
//	CSS.setDefaultStyle(".benignware-view-ImageView img", "margin", "0px");
//	CSS.setDefaultStyle(".benignware-view-ImageView img", "max-width", "100%");
//	CSS.setDefaultStyle(".benignware-view-ImageView img", "max-height", "none");
//	CSS.setDefaultStyle(".benignware-view-ImageView", "background", "green");
//	CSS.setDefaultStyle(".benignware-view-ImageView", "border", "1px solid green");
	
//	CSS.setDefaultStyle(".benignware-view-ImageView img", "display", "none");
	
	ImageView.ALIGN_LEFT = "left"; 
	ImageView.ALIGN_RIGHT = "right"; 
	ImageView.ALIGN_CENTER = "center";
	ImageView.ALIGN_TOP = "top"; 
	ImageView.ALIGN_BOTTOM = "bottom"; 
	
	ImageView.SCALE_MODE_STRETCH = "stretch"; 
	ImageView.SCALE_MODE_CONTAIN = "contain"; 
	ImageView.SCALE_MODE_COVER = "cover";

	
	ImageView.prototype.activityViewElem = null;
	ImageView.prototype.imageElem = null;
	ImageView.prototype.cssImageElem = null;
	
	ImageView.prototype._createChildren = function() {
		_parent._createChildren.call(this);
		
		var activityView = Element.create(ActivityView);
		this.activityViewElem = activityView;
		this.appendChild(this.activityViewElem);
		
		
		var img = this.getElementsByTagName("img")[0];
		if (!img) {
			img = this.ownerDocument.createElement("img");
			this.appendChild(img);
		}
		
		Element.addEventListener(img, 'load', Delegate.create(this, loadHandler), false);
		Element.addEventListener(img, 'error', Delegate.create(this, errorHandler), false);

		this.imageElem = img;
		
		var src = ImageLoader.getResolutionSource([img, this]);
		if (src) {
			this.load(src);
		}
		
	}
	
	ImageView.prototype.load = function(src) {
		
		console.log("ImageView::load( ", src, ")");
		if (src) {
			var img = this.imageElem;
			img.setAttribute("src", src);
			if (!ImageLoader.isComplete(img)) {
				img.style.display = "none";
				this.activityViewElem.setStatus('progress');
				this.activityViewElem.show();
			} else {
				console.log('is complete');
//				loadHandler.call(this);
			}
		}
		
	}
	
	function loadHandler(event) {
		console.log('loaded');
		var imageView = this;
		this.activityViewElem.hide();
		if (this.getUseCss()) {
			cssLayout.call(this);
		} else {
			var img = imageView.imageElem;
			img.style.display = "";
			imageView.invalidate();
		}
		this.addCSSName('loading');
		this.dispatchEvent(Event.create('load', false, false));
		complete.call(this);
	}
	
	function errorHandler(event) {
		console.log("error", this.imageElem.getAttribute('src'));
		this.activityViewElem.setStatus('error');
		this.imageElem.style.visibility = "hidden";
		this.dispatchEvent(Event.create('error', false, false));
		complete.call(this);
	}
	
	function complete() {
		console.log('imageview complete');
		this.removeCSSName('loading');
		this.dispatchEvent(Event.create('complete', false, false));
	}
	
	ImageView.prototype._update = function() {
		
		console.log("update image view", this.getUseCss());
		
		_parent._update.call(this);
		
		var img = this.imageElem;
		
		if (this.getUseCss()) {
			cssLayout.call(this);
			return;
		}
	
		if (!img.getAttribute('src') || img.width === 0 || img.height === 0) {
			return;
		}

//		this.style.width = "";
//		this.style.height = "";
		
		img.style.display = "none";
		var width = this.clientWidth;
		var height = this.clientHeight;
		img.style.display = "";
		//
		if (!height) {
			this.style.height = Element.getOuterHeight(img) + "px";
		}
		if (!width) {
			this.style.width = Element.getOuterWidth(img) + "px";
		}
		width = this.clientWidth;
		height = this.clientHeight;
		if (width && height) {
			ImageView.scale(img, width, height, this.getScaleMode());
		}

		// layout
		
		var verticalAlign = this.getVerticalAlign();
		var va = verticalAlign == ImageView.ALIGN_TOP ? 0 : verticalAlign == ImageView.ALIGN_BOTTOM ? 1 : 0.5;
		var horizontalAlign = this.getHorizontalAlign();
		var ha = horizontalAlign == ImageView.ALIGN_LEFT ? 0 : horizontalAlign == ImageView.ALIGN_RIGHT ? 1 : 0.5;

		width = this.getWidth();
		height = this.getHeight();

		var iw = Element.getOuterWidth(img);
		var ih = Element.getOuterHeight(img);
		
		var x = (width - iw) * ha;
		var y = (height - ih) * va;
		
		img.style.position = "absolute";
		img.style.left = Math.round(x) + "px";
		img.style.top = Math.round(y) + "px";
		
	}
	
	function cssLayout() {
		
		var img = this.imageElem;
		var cssImageElem = this.cssImageElem;
		
		if (this.getUseCss()) {
			console.log('css layout');
			
			img.style.display = "none";
			
			if (!cssImageElem) {
			
				var div = this.ownerDocument.createElement('div');
				cssImageElem = this.appendChild(div);
				cssImageElem.style.backgroundPosition = "center center";
				cssImageElem.style.backgroundRepeat = "no-repeat";
				cssImageElem.style.width = "100%";
				cssImageElem.style.height = "100%";

				this.cssImageElem = cssImageElem;
			}
			if (img.getAttribute('src') && img.width > 0 && img.height > 0) {
				cssImageElem.style.backgroundImage = "url(" + img.getAttribute('src') + ")";
				cssImageElem.style.backgroundSize = this.getScaleMode();
			}
			
		} else {
			
			img.style.display = "";
			if (cssLayoutElem) {
				this.removeChild(cssLayoutElem);
				this.cssImageElem = null;
			}
			
			this.invalidate();
		}
	}

	function getScaledSize(originalWidth, originalHeight, width, height, scaleMode, bounds) {

		scaleMode = typeof(scaleMode) != "undefined" ? scaleMode : ImageView.SCALE_MODE_CONTAIN;
		
		if (typeof(bounds) == "undefined" || bounds == null) {
			bounds = scaleMode == ImageView.SCALE_MODE_COVER ? false : true;
		}
		if (typeof(bounds) == "string") {
			bounds = bounds == "false" || bounds == "0" ? false : true;
		}
		if (typeof(bounds) == "boolean") {
			bounds = bounds ? {width: originalWidth, height: originalHeight} : {width:0, height: 0};
		}
		
		if (!height) {
			var ratio = originalWidth > originalHeight ? originalWidth / originalHeight : originalWidth < originalHeight ? originalHeight / originalWidth : 1;
			height = width * ratio;
		}

		var r1 = originalWidth / width;
		var r2 = originalHeight / height;
		var w, h;
		
		switch (scaleMode) {

			case ImageView.SCALE_MODE_CONTAIN: 
			case ImageView.SCALE_MODE_COVER:
				
				var largestRatio;
				if (scaleMode == ImageView.SCALE_MODE_CONTAIN) {
					// contain
					largestRatio = Math.max(r1, r2);
				} else {
					// cover
					
					largestRatio = Math.min(r1, r2);
				}
				w = originalWidth * (1 / largestRatio);
				h = originalHeight * (1 / largestRatio);
				
				break;
				
			case ImageView.SCALE_MODE_STRETCH:

				w = width;
				h = height;
				
				break;
		}

		if (bounds) {
			w = w < bounds.width || bounds.width == 0 ? w : bounds.width;
			h = h < bounds.height || bounds.height == 0 ? h : bounds.height;
		}
		
		w = Math.ceil(w);
		h = Math.ceil(h);
		
		return {
			width: w, 
			height: h
		}
	}
	
	ImageView.scale = function(elem, width, height, scaleMode, maxBounds) {

		elem.style.width = "auto";
		elem.style.height = "auto";
		
		var originalWidth = Element.getOuterWidth(elem); 
		var originalHeight = Element.getOuterHeight(elem); 
		
		if (originalWidth && originalHeight) {
			var size = getScaledSize(originalWidth, originalHeight, width, height, scaleMode, maxBounds);
			elem.style.width = Math.ceil(size.width) + "px";
			elem.style.height = Math.ceil(size.height) + "px";
		}
	}
	
	function isImageLoaded(img) {

		if (typeof(img.complete) != "undefined") {
			
			return img.complete === true;
			
	    } else if (img.naturalHeight && img.naturalWidth) {
	    	
	    	return true;
		}
	    
	    return true;

	}
	
	return ImageView;
})();