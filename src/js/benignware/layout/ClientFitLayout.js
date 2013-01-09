(function() {
	
	var Class = benignware.core.Class;
	var Layout = Class.require('benignware.core.Layout');

	var _parent;
	
	/**
	 * layouts items to fit client size
	 * @class ClientFitLayout
	 */
	var ClientFitLayout = Class.create('benignware.layout.ClientFitLayout', function ClientFitLayout() {
		_parent.apply(this, arguments);
	});
	ClientFitLayout = Class.extend(Layout, ClientFitLayout);
	_parent = Class.getParent(ClientFitLayout);
	
	/**
	 * layout identifier for a client fit layout with horizontal orientation
	 * @field HORIZONTAL_CLIENT_FIT
	 * @return {String} the identifier string
	 */
	ClientFitLayout.HORIZONTAL_CLIENT_FIT = "horizontal-client-fit";
	
	/**
	 * layout identifier for an client fit layout with vertical orientation
	 * @field VERTICAL_CLIENT_FIT
	 * @return {String} the identifier string
	 */
	ClientFitLayout.VERTICAL_CLIENT_FIT = "vertical";
	
	
	Layout.register('horizontal-client-fit', ClientFitLayout, {orientation: Layout.ORIENTATION_HORIZONTAL});
	Layout.register('vertical-client-fit', ClientFitLayout, {orientation: Layout.ORIENTATION_VERTICAL})
	
	/**
	 * returns the calculated content size
	 * @method getContentSize
	 * @return {Object} an object containing width and height properties
	 */
	ClientFitLayout.prototype.getContentSize = function() {
		var element = this.element;
		var items = Layout.getItems(element);
		var width = this.orientation == Layout.ORIENTATION_HORIZONTAL ? items.length * element.clientWidth : element.clientWidth;
		var height = this.orientation == Layout.ORIENTATION_VERTICAL ? items.length * element.clientHeight : element.clientHeight;
		return {width: width, height: height}
	}

	
	/**
	 * applies the item layout
	 * @method perform
	 */
	
	ClientFitLayout.prototype.perform = function() {
		
		var element = this.element;
		var items = Layout.getItems(element);
		
		for (var i = 0; i < items.length; i++) {
			
			var item = items[i];
			if (item.nodeType == 1) {
				item.style.position = "absolute";
				if (this.orientation == Layout.ORIENTATION_HORIZONTAL) {
					
					item.style.left = i * 100 + "%";
					item.style.top = "0";
				} else {
					item.style.left = "0";
					item.style.top = i * 100 + "%";
				}
				
				item.style.width = "100%";
				item.style.height = "100%";
			}
		}
	}
	
	return ClientFitLayout;
})();