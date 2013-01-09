(function() {
	
	var Class = benignware.core.Class;
	var Layout = Class.require('benignware.core.Layout');
	var Element = Class.require('benignware.core.Element');
	var CSS = Class.require("benignware.util.CSS");
	
	var _parent;
	
	
	// static helpers
	
	function fits(elem) {
		var size = typeof(elem.size) == "function" ? elem.size() : elem.childNodes.length;
		var mw = 0;
		for (var i = 0; i < size; i++) {
			var item = typeof(elem.get) == "function" ? elem.get(i) : elem.childNodes[i];
			mw+= parseInt(Element.getComputedStyle(item, 'min-width'));
//			iw+= Element.getOuterWidth(item);
		}
		var ew = Element.getWidth(elem);
		if (mw > ew) {
//			alert(iw + " - " + ew);
			return false;
		}
		return true;
	}
	
	
	/**
	 * layouts items to fit content size
	 * @class ContentFitLayout
	 */
	var ContentFitLayout = Class.create('benignware.layout.ContentFitLayout', function ClientFitLayout() {
		_parent.apply(this, arguments);
	});
	Class.extend(Layout, ContentFitLayout);
	_parent = Class.getParent(ContentFitLayout);
	
	/**
	 * layout identifier for content fit layout with horizontal orientation
	 * @field HORIZONTAL_CONTENT_FIT
	 * @return {String} the identifier string
	 */
	ContentFitLayout.HORIZONTAL_CONTENT_FIT = "horizontal-content-fit";
	
	/**
	 * layout identifier for content fit layout with vertical orientation
	 * @field VERTICAL_CONTENT_FIT
	 * @return {String} the identifier string
	 */
	ContentFitLayout.VERTICAL_CONTENT_FIT = "vertical-content-fit";
	
	
	Layout.register(ContentFitLayout.HORIZONTAL_CONTENT_FIT, ContentFitLayout, {orientation: Layout.ORIENTATION_HORIZONTAL});
	Layout.register(ContentFitLayout.VERTICAL_CONTENT_FIT, ContentFitLayout, {orientation: Layout.ORIENTATION_VERTICAL})
	
	/**
	 * returns the calculated content size
	 * @method getContentSize
	 * @return {Object} an object containing width and height properties
	 */
	ContentFitLayout.prototype.getContentSize = function() {
		var element = this.element;
		var items = Layout.getItems(element);
		if (!fits(element)) {
			return ItemLayout.prototype.getContentSize.call(this);
		}
		return {width: element.clientWidth, height: element.clientHeight}
	}

	
	/**
	 * applies the item layout
	 * @method perform
	 */
	
	ContentFitLayout.prototype.perform = function() {
		
		var element = this.element;
		var items = Layout.getItems(element);
		
		if (!fits(element)) {
			ItemLayout.prototype.perform.call(this, element);
			return;
			
		}
		
		
		var pw = 100 / items.length;
		var ph = 100 / items.length;
		
		var ew = Element.getWidth(element);
		var eh = Element.getHeight(element);
		
		var boxSizingStyle = CSS ? CSS.getVendorStyle('boxSizing') : null;
		
		for (var i = 0; i < items.length; i++) {
			
			var item = items[i];
			if (item.nodeType == 1) {
				item.style.position = "absolute";
				
				if (boxSizingStyle) {
					item.style[boxSizingStyle] = "border-box";
				}
				
				var is = Element.getSize(item);
				if (this.orientation == Layout.ORIENTATION_HORIZONTAL) {
					
					var xp = pw + is.width / ew;
					item.style.width = pw + "%";
					item.style.left = i * pw + "%";
					item.style.top = "0";
				} else {
					item.style.height = ph + "%";
					item.style.left = "0";
					item.style.top = i * ph + "%";
				}
			}
		}
		
		
	}
	
	return ContentFitLayout;
})();