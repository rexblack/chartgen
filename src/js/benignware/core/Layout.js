(function() {
	
	var Class = benignware.core.Class;
	var Element = Class.require('benignware.core.Element');
	
	/**
	 * base layout class
	 * @class Layout
	 */
	function Layout(element, orientation, horizontalAlign, verticalAlign) {
		
		this.element = element;
		
		this.orientation = orientation || Layout.ORIENTATION_HORIZONTAL;
		this.verticalAlign = verticalAlign || Layout.ALIGN_CENTER;
		this.horizontalAlign = horizontalAlign || Layout.ALIGN_CENTER;

	}
	
	Class.register('benignware.core.Layout', Layout);
	
	/**
	 * string identifier for horizontal-oriented layout
	 * @field ORIENTATION_HORIZONTAL
	 * @return {String} horizontal
	 */
	Layout.ORIENTATION_HORIZONTAL = "horizontal";
	
	/**
	 * string identifier for vertical-oriented layout
	 * @field ORIENTATION_VERTICAL
	 * @return {String} vertical
	 */
	Layout.ORIENTATION_VERTICAL = "vertical";
	
	/**
	 * string identifier for left-aligned layout
	 * @field ALIGN_LEFT
	 * @return {String} left
	 */
	Layout.ALIGN_LEFT = "left";
	
	/**
	 * string identifier for top-aligned layout
	 * @field ALIGN_TOP
	 * @return {String} top
	 */
	Layout.ALIGN_TOP = "top";
	
	/**
	 * string identifier for center-aligned layout
	 * @field ALIGN_CENTER
	 * @return {String} center
	 */
	Layout.ALIGN_CENTER = "center";

	/**
	 * string identifier for right-aligned layout
	 * @field ALIGN_RIGHT
	 * @return {String} right
	 */
	Layout.ALIGN_RIGHT = "right";
	
	/**
	 * string identifier for bottom-aligned layout
	 * @field ALIGN_BOTTOM
	 * @return {String} bottom
	 */
	Layout.ALIGN_BOTTOM = "bottom";
	
	/**
	 * retrieves the content size of the specified container element
	 * @method getContentSize
	 * @param {benignware.core.Container} element
	 * @returns an object containing width and height properties
	 */
	Layout.prototype.getContentSize = function() {
//		console.log("Layout::getContentSize(", element, ")");
		var element = this.element;
		var items = Layout.getItems(element);
		var width = 0;
		var height = 0;
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var xmax, ymax;

			xmax = item.offsetLeft + Element.getWidth(item); 
			ymax = item.offsetTop + Element.getHeight(item); 

			width = xmax > width ? xmax : width;
			height = ymax > height ? ymax : height;

		}
		return {
			width: width, 
			height: height
		}
	}
	
	/**
	 * applies the layout to the specified container element
	 * @method perform
	 * @param {benignware.core.Element} element
	 * @returns an object containing width and height properties
	 */
	Layout.prototype.perform = function(element) {
//		console.log("Layout::perform(", element, ")");
	}
	
	/**
	 * the element to which the layout is applied
	 * @property element
	 * @return {benignware.core.Element} element
	 */
	Layout.prototype.element = null;
	
	/**
	 * the layout's orientation
	 * @property orientation
	 * @return {String} the orientation identifier
	 */
	Layout.prototype.orientation = Layout.ORIENTATION_VERTICAL;
	
	/**
	 * the layout's horizontal align
	 * @property horizontalAlign
	 * @return {String} the align identifier
	 */
	Layout.prototype.horizontalAlign = null;
	
	/**
	 * the layout's vertical align
	 * @property verticalAlign
	 * @return {String} the align identifier
	 */
	Layout.prototype.verticalAlign = null;
	

	/**
	 * returns an itemset for the specified element.
	 * @static
	 * @method getItems
	 */
	Layout.getItems = function(element) {
		var items = [];
		if (element.size && element.get) {
			for (var i = 0; i < element.size(); i++) {
				items.push(element.get(i));
			}
		} else {
			for (var i = 0; i < element.childNodes.length; i++) {
				var child = element.childNodes[i];
				if (isItem(child)) {
					items.push(child);
				}
			}
		}
		return items;
	}
	
	
	// TODO: remove helper methods
	
	function trim(string) {
		if (string) {
			string = string.replace(/^(?:\s+|\n+)|(?:\s+|\n+)$/gm, '');
			return string;
		}
		return "";
	}
	
	function contains(array, value) {
		for (var i = 0; i < array.length; i++) if (array[i] == value) return true;
		return false;
	}
	
	function isItem(item) {
		return item.nodeType == 1
			&& !contains(["br", "script", "link", "map"], item.nodeName.toUpperCase()) 
			|| item.nodeType == 3 && trim(item.nodeValue);
	}
	
	
	var layouts = [];
	
	/**
	 * registers a layout class with a string identifier
	 * @static
	 * @method register
	 * @param {String} id
	 * @param {benignware.core.Class} clazz
	 * @param {Object} options
	 */
	
	Layout.register = function(id, clazz, options) {
//		console.log("Layout::register(", id, clazz, options, ")");
		layouts[id] = {
			clazz: clazz, 
			options: options
		}
	}
	
	/**
	 * returns a layout instance registered with the specified identifier
	 * @static
	 * @method get
	 * @param {String} id the layout identifier
	 * @param {benignware.core.Element} element
	 * @return {benignware.core.Layout} the layout instance
	 */
	Layout.get = function(id, element) {
		
		var layoutItem = layouts[id];
		
		if (layoutItem && layoutItem.clazz) {
			var clazz = layoutItem.clazz;
			var options = layoutItem.options;
			var layout = new clazz(element);
			layout.element = element;
			for (var name in options) {
				Class.callSetter(layout, name, options[name]);
			}
			return layout;
		}
	}
	
	
})();
