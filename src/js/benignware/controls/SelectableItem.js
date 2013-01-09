(function() {
	
	/**
	 * the controls package contains various ui widgets.
	 * @package benignware.controls
	 */
	
	var Class = benignware.core.Class;
	
	var Component = Class.require("benignware.core.Component");
	var Element = Class.require("benignware.core.Element");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	var DOM = Class.require("benignware.util.DOM");
	
	var _parent;
	
	CSS.setDefaultStyle(".benignware-controls-SelectableItem", "cursor", "pointer");
	CSS.setDefaultStyle(".benignware-controls-SelectableItem.selected", "background", "#3399ff");
	CSS.setDefaultStyle(".benignware-controls-SelectableItem.selected", "color", "#ffffff");
	
	
	/**
	 * base class for all selectable elements.
	 * @class benignware.controls.SelectableItem
	 * @extends benignware.core.Component
	 */
	
	function SelectableItem(){
		
		var __parent = _parent.apply(this, arguments);
		
		// private variables
		var selected = false; 
		var selectable = true; 
		var touchstart = false;
		var touchmove = false; 
		
		// privileged methods
		
		
		function touchStartHandler(event) {
			Event.normalize(event);
			touchstart = true;
			if (event.type == "mousedown") {
				event.preventDefault();
			}
			if (this.selectEvent == "down") {
				if (this.isSelectable()) {
					this.toggleSelected();
				}
				// push event
				this.dispatchEvent(Event.create(this.ownerDocument, "push", false, false));
			}
		}
		
		function touchMoveHandler(event) {
			Event.normalize(event);
			if (touchstart) {
				touchmove = true;
			}
		}
		
		function touchEndHandler(event) {
			if (this.selectEvent == "up" && touchstart && !touchmove) {
				Event.normalize(event);
				if (event.target == this || DOM.isChildOf(event.target, this)) {
					if (this.isSelectable()) {
						this.toggleSelected();
					}
					// push event
					this.dispatchEvent(Event.create(this.ownerDocument, "push", false, false));
				}
			}
			touchstart = false;
			touchmove = false;
		}
		
		this.toggleSelected = function(bool) {
			this.setSelected(this.isSelected() ? false : true);
		}
		
		/**
		 * specifies if the item is selectable.
		 * @method setSelectable
		 */
		this.setSelectable = function(bool) {
			selectable = StringUtils.toBoolean(bool);
		}
		
		/**
		 * returns true if the item is selectable.
		 * @method isSelectable
		 * @return {Boolean} returns true, if item is selectable.
		 */
		this.isSelectable = function() {
			return selectable;
		}
		
		/**
		 * sets the item's selected state.
		 * @method setSelected
		 */
		this.setSelected = function(bool) {
			bool = StringUtils.toBoolean(bool);
			if (bool != selected) {
				selected = bool;
				if (bool) {
					this.addCSSName("selected"); 
					this.dispatchEvent(Event.create(this.ownerDocument, "select", false, false));
				} else {
					this.removeCSSName("selected");
					this.dispatchEvent(Event.create(this.ownerDocument, "unselect", false, false));
				}
				this.dispatchEvent(Event.create(this.ownerDocument, "selectionchange", false, false));
//				this.invalidate();
			}
		}
		
		/**
		 * retrieves item's selected state.
		 * @method isSelected
		 * @return {Boolean} true if item is selected
		 */
		this.isSelected = function() {
			return selected;
		}
		
		// configure listeners
		
		if ('ontouchstart' in window) {
			
			// touch support
			this.addEventListener('touchstart', Delegate.create(this, touchStartHandler), false);
			this.addEventListener('touchmove', Delegate.create(this, touchMoveHandler), false);
			Element.addEventListener(this.ownerDocument, 'touchend', Delegate.create(this, touchEndHandler), false);
			
		} else {
			
			// mouse support
			this.addEventListener('mousedown', Delegate.create(this, touchStartHandler), false);
			this.addEventListener('mousemove', Delegate.create(this, touchMoveHandler), false);
			Element.addEventListener(this.ownerDocument, 'mouseup', Delegate.create(this, touchEndHandler), false);
			
		}
		
		// end constructor
	}
	
	Class.register('benignware.controls.SelectableItem', SelectableItem);
	Class.extend(Component, SelectableItem);

	_parent = Class.getParent(SelectableItem);
	//
	
	SelectableItem.prototype.selectEvent = "up";
	
	return SelectableItem;
})();