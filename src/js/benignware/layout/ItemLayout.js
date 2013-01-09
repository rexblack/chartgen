(function() {
	
	// class imports
	var Class = benignware.core.Class;
	var Element = Class.require('benignware.core.Element');
	var Layout = Class.require('benignware.core.Layout');
	
	// init parent object
	var _parent;
	
	/**
	 * this package contains predefined layout classes. 
	 * @package benignware.layout
	 */
	
	/**
	 * a simple item layout
	 * @class ItemLayout
	 * @extends benignware.core.Layout
	 */
	function ItemLayout() {
		_parent.apply(this, arguments);
	}
	
	/**
	 * layout identifier for an item layout with horizontal orientation
	 * @field HORIZONTAL
	 * @return {String} the identifier string
	 */
	ItemLayout.HORIZONTAL = "horizontal";
	
	/**
	 * layout identifier for an item layout with vertical orientation
	 * @field VERTICAL
	 * @return {String} the identifier string
	 */
	ItemLayout.VERTICAL = "vertical";
	
	Layout.register(ItemLayout.HORIZONTAL, ItemLayout, {orientation: Layout.ORIENTATION_HORIZONTAL});
	Layout.register(ItemLayout.VERTICAL, ItemLayout, {orientation: Layout.ORIENTATION_VERTICAL});
	
	Class.extend(Layout, ItemLayout);
	
	_parent = Class.getParent(ItemLayout);
	
	Class.register('benignware.layout.ItemLayout', ItemLayout);
	
	/**
	 * returns the calculated content size
	 * @method getContentSize
	 * @return {Object} an object containing width and height properties
	 */
	ItemLayout.prototype.getContentSize = function() {
		
		var element = this.element;
		var items = Layout.getItems(element);

		var width = this.orientation == Layout.ORIENTATION_HORIZONTAL ? 0 : element.clientWidth;
		var height = this.orientation == Layout.ORIENTATION_VERTICAL ? 0 : element.clientHeight;
		
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			item.style.position = "absolute";
			if (item.nodeType == 1) {
				var itemWidth = Element.getOuterWidth(item);
				var itemHeight = Element.getOuterHeight(item);

				width+= this.orientation == Layout.ORIENTATION_HORIZONTAL ? itemWidth : 0;
				height+= this.orientation == Layout.ORIENTATION_VERTICAL ? itemHeight : 0;
			}
		}

		return {
			width: width, 
			height: height
		}
	}
	
	/**
	 * applies the item layout
	 * @method apply
	 */
	ItemLayout.prototype.perform = function() {
		
		var contentSize = this.getContentSize();

		var element = this.element;
		var clientWidth = element.clientWidth;
		var clientHeight = element.clientHeight;
		
		var items = Layout.getItems(element);
		
		var horizontalAlign = this.horizontalAlign == Layout.ALIGN_LEFT ? 0 : this.horizontalAlign == Layout.ALIGN_RIGHT ? 1 : 0.5;
		var verticalAlign = this.verticalAlign == Layout.ALIGN_TOP ? 0 : this.verticalAlign == Layout.ALIGN_BOTTOM ? 1 : 0.5;
		
		var x = Math.max(0, (clientWidth - contentSize.width) * horizontalAlign);
		var y = Math.max(0, (clientHeight - contentSize.height) * verticalAlign);
		
		var width = 0;
		var height = 0;
		
		
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.nodeType == 1) {
				
				var itemWidth = Element.getOuterWidth(item);
				var itemHeight =  Element.getOuterHeight(item);
				
				if (this.orientation == Layout.ORIENTATION_HORIZONTAL) {
					item.style.left = (x + width) + "px";
					item.style.top = (clientHeight - itemHeight) * verticalAlign + "px";
				} else {
					
					item.style.left = (clientWidth - itemWidth) * horizontalAlign + "px";
					item.style.top = (y + height) + "px";
				}
				
				width+= itemWidth;
				height+= itemHeight;
			}
		}
		
	}
	
	
})();
