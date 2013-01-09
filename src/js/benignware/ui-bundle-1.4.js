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
(function(){
	
	
	/**
	 * base class for list components
	 * @class benignware.controls.SelectableList
	 * 
	 */
	// import classes
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Container = Class.require("benignware.core.Container");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var CSS = Class.require("benignware.util.CSS");
	var StringUtils = Class.require("benignware.util.StringUtils");
	// define super
	var _parent;
	
	/**
	 * Constructs a new SelectableList.
	 * @constructor
	 */
	function SelectableList() {
		_parent.apply(this, arguments);
	}
	
	Class.register("benignware.controls.SelectableList", SelectableList);
	// extend
	Class.extend(Container, SelectableList);
	// get super
	_parent = Class.getParent(SelectableList);
	//
	
	SelectableList.prototype._initialize = function() {
		_parent._initialize.call(this);

	}
	
	// protected methods
	SelectableList.prototype._createChildren = function() {
//		console.log("SelectableList::_createChildren()");
		var selectDelegate = Delegate.create(this, function(event) {
			this.setSelectedItem(event.target);
		});
		
		this.addEventListener('itemadded', function(event) {
			var item = event.item;
			if (item.isSelected && item.isSelected()) {
				this.setSelectedItem(item);
			}
			Element.addEventListener(item, 'select', selectDelegate);
		});
		
		this.addEventListener('itemremoved', function(event) {
			var item = event.item;
			if (this.getSelectedItem() == item) {
				this.setSelectedItem(null);
			}
			Element.removeEventListener(item, 'select', selectDelegate);
		});
		
		_parent._createChildren.call(this);
	}
	
	SelectableList.prototype.setSelectedItem = function(elem) {
//		console.log("SelectableList::setSelectedItem");
//		if (elem != this.getSelectedItem()) {
			for (var i = 0; i < this.size(); i++) {
				var item = this.get(i);
				
				if (item.setSelected) {
					item.setSelected(elem == item);
					
					if (item.setSelectable) {
						item.setSelectable(!(elem == item));
					}
				}		
			}
			this.dispatchEvent(Event.create(this.ownerDocument, 'change', false, false));
//		}
	}
	
	SelectableList.prototype.getSelectedItem = function() {
		for (var i = 0; i < this.size(); i++) {
			var item = this.get(i);
			if (item.isSelected && item.isSelected()) {
				return item;
			}
		}
	}
	
	SelectableList.prototype.getSelectedIndex = function() { 
		var selectedItem = this.getSelectedItem();
		for (var i = 0; i < this.size(); i++) {
			var item = this.get(i);
			if (item == selectedItem) {
				return i;
			}
		}
		return -1;
	}

	SelectableList.prototype._update = function() {
		_parent._update.call(this);
	}
	
	return SelectableList;
})();
(function(){
	var Class = benignware.core.Class;
	var Component = Class.require("benignware.core.Component");
	var Element = Class.require("benignware.core.Element");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var SelectableItem = Class.require("benignware.controls.SelectableItem");
	
	var _parent;
	
	var addIcon = Class.getPath("benignware.controls.EditableItem", "add.png");
	var removeIcon = Class.getPath("benignware.controls.EditableItem", "delete.png");
	
	CSS.setDefaultStyle(".benignware-controls-EditableItem .action-indicator", "cursor", "pointer");
	CSS.setDefaultStyle(".benignware-controls-EditableItem .action-indicator", "visibility", "hidden");
	CSS.setDefaultStyle(".benignware-controls-EditableItem .action-indicator", "width", "16px");
	CSS.setDefaultStyle(".benignware-controls-EditableItem .action-indicator", "height", "16px");
	CSS.setDefaultStyle(".benignware-controls-EditableItem .action-indicator", "background-repeat", "no-repeat");
	CSS.setDefaultStyle(".benignware-controls-EditableItem .action-indicator", "background-position", "center");
	CSS.setDefaultStyle(".benignware-controls-EditableItem .action-indicator", "background-size", "contain");
	
	
	CSS.setDefaultStyle(".benignware-controls-EditableItem.editing .action-indicator", "visibility", "visible");
	CSS.setDefaultStyle(".benignware-controls-EditableItem.editing .action-indicator.remove", "background-image", "url('" + removeIcon + "')");
	CSS.setDefaultStyle(".benignware-controls-EditableItem.editing .action-indicator.add", "background-image", "url('" + addIcon + "')");
	
	CSS.setDefaultStyle(".benignware-controls-EditableItem.selected", "color", "#ffffff");
	
	
	/**
	 * base class for editable items
	 * @class benignware.core.EditableItem
	 */
	
	function EditableItem(){
		
		var __parent = _parent.apply(this, arguments);
		
		var action = null;
		var editable = true;
		var editing = true;
		
		/**
		 * specifies whether the item can be edited
		 * @method setEditable
		 * @param {Boolean} bool
		 */
		this.setEditable = function(bool) {
			bool = StringUtils.toBoolean(bool);
			if (bool != editable) {
				editable = bool;
				invalidateEditing.call(this);
				this.invalidate();
			}
		}
		
		
		/**
		 * retrieves if the item is editable
		 * @method getEditable
		 * @return {Boolean} true, if item is editable
		 */
		this.isEditable = function() {
			return typeof editable == "boolean" ? editable : true;
		}
		
		
		/**
		 * sets the item's editing mode
		 * @method setEditing
		 * @param {Boolean} bool
		 */
		this.setEditing = function(bool) {
			bool = StringUtils.toBoolean(bool);
			if (bool != editing) {
				editing = bool;
				invalidateEditing.call(this);
				this.invalidate();
			}
		}
		
		/**
		 * retrieves the item's editing mode
		 * @method getEditing
		 * @return {Boolean} bool
		 */
		this.isEditing = function() {
			return typeof editing == "boolean" ? editing : true;
		}
		
		/**
		 * sets an accessory action on this item
		 * @method setAction
		 * @param {String} actionName
		 */
		this.setAction = function(actionName) {
			if (actionName != action) {
				if (action) {
					Element.removeCSSName(this.actionIndicatorElem, action);
				}
				action = actionName;
				invalidateEditing.call(this);
				this.invalidate();
			}
		}
		
		/**
		 * returns accessory action
		 * @method getAction
		 * @return {String} actionName the action identifier
		 */
		this.getAction = function() {
			return action;
		}
		
		this.isSelectable = function() {
			if (this.isEditing()) {
				return false;
			}
			return __parent.isSelectable.call(this);
		}

		function invalidateEditing() {
			var action = this.getAction();
			if (action) {
				if (this.isEditable() && this.isEditing()) {
					this.addCSSName("editing"); 
					Element.addCSSName(this.actionIndicatorElem, action);
				} else {
					this.removeCSSName("editing");
					Element.removeCSSName(this.actionIndicatorElem, action);
				}
			}
		}

		invalidateEditing.call(this);
	}
	
	Class.register("benignware.controls.EditableItem", EditableItem);

	Class.extend(SelectableItem, EditableItem);
	_parent = Class.getParent(EditableItem);
	
	
	/**
	 * the action identifier for remove action
	 * @field ACTION_REMOVE
	 * @return {String} 'remove'
	 */
	EditableItem.ACTION_REMOVE = "remove";
	
	
	/**
	 * the action identifier for add action
	 * @field ACTION_ADD
	 * @return {String} 'add'
	 */
	EditableItem.ACTION_ADD = "add";
	
	
	/**
	 * the item's accessory view element
	 * @property actionIndicatorElem
	 * @return {Element} the accessory view element 
	 */
	EditableItem.prototype.actionIndicatorElem = null;
	
	
	EditableItem.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
		this.actionIndicatorElem = Element.create(this.ownerDocument, 'div');
		this.actionIndicatorElem.className = "action-indicator";
		Element.addEventListener(this.actionIndicatorElem, 'ontouchend' in window ? 'touchend' : 'click', Delegate.create(this, function(event) {
			this.dispatchEvent(Event.create("change", true, false));
		}));
		this.appendChild(this.actionIndicatorElem);
	}
	
	EditableItem.prototype.initialize = function(options) {
		_parent._initialize.apply(this, arguments);
	}
	

	
	
	return EditableItem;
})();
(function(){
	// import classes
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Container = Class.require("benignware.core.Container");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var CSS = Class.require("benignware.util.CSS");
	var StringUtils = Class.require("benignware.util.StringUtils");
	//
	var SelectableList = Class.require("benignware.controls.SelectableList");
	// define super
	var _parent;
	/**
	 * Constructs a new EditableList.
	 * @constructor
	 */
	function EditableList() {
		var __parent = _parent.apply(this, arguments);
		
		// private variables
		
		var editable = false;
		var editing = true;
		
		this.setEditable = function(bool) {
			bool = StringUtils.getBoolean(bool);
			if (bool != editable) {
				editable = bool;
				invalidateEditing.call(this);
			}
		}
		
		this.isEditable = function() {
			return typeof editable == "boolean" ? editable : true;
		}
		
		this.setEditing = function(bool) {
			bool = StringUtils.getBoolean(bool);
			if (bool != editing) {
				editing = bool;
				invalidateEditing.call(this);
				this.invalidate();
			}
		}
		
		this.isEditing = function() {
			return typeof editing == "boolean" ? editing : true;
		}
	}
	
	Class.register("benignware.controls.EditableList", EditableList);
	// extend
	Class.extend(SelectableList, EditableList);
	// get super
	_parent = Class.getParent(EditableList);
	//
	
	EditableList.prototype._initialize = function() {
		_parent._initialize.call(this);
		invalidateEditing.call(this);
	}

	EditableList.prototype.add = function(item) {
		_parent.add.apply(this, arguments);
		invalidateEditing.call(this);
	}
	
	EditableList.prototype.remove = function(item) {
		_parent.remove.apply(this, arguments);
	}

	function invalidateEditing() {
		var editing = false;
		if (this.isEditable() && this.isEditing()) {
			this.addCSSName("editing"); 
			editing = true;
		} else {
			this.removeCSSName("editing");
		}
		for (var i = 0; i < this.size(); i++) {
			var item = this.get(i);
			if (item.setEditing) {
				item.setEditing(editing);
			}
		}
	}
	
	
	
	return EditableList;
})();
(function(){
	var Class = benignware.core.Class;
	var Component = Class.require("benignware.core.Component");
	var Element = Class.require("benignware.core.Element");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var EditableItem = Class.require("benignware.controls.EditableItem");
	var _parent;
	
//	CSS.setDefaultStyle(".benignware-controls-ListItem", "display", "table-row");
	
	CSS.setDefaultStyle(".benignware-controls-ListItem", "box-sizing", "border-box");
	CSS.setDefaultStyle(".benignware-controls-ListItem", "-moz-box-sizing", "border-box");
	CSS.setDefaultStyle(".benignware-controls-ListItem", "-webkit-box-sizing", "border-box");
	
	CSS.setDefaultStyle(".benignware-controls-ListItem", "font-family", "Arial");
	
	CSS.setDefaultStyle(".benignware-controls-ListItem", "background", "#fff");
	
	CSS.setDefaultStyle(".benignware-controls-ListItem:first-child", "border-top", "1px solid #aeaeae");
	CSS.setDefaultStyle(".benignware-controls-ListItem", "border-bottom", "1px solid #aeaeae");
	
	// cells
	CSS.setDefaultStyle(".benignware-controls-ListItem > div", "padding", "2px");
	CSS.setDefaultStyle(".benignware-controls-ListItem > div", "display", "table-cell");
	CSS.setDefaultStyle(".benignware-controls-ListItem > div", "vertical-align", "middle");
	
	
	CSS.setDefaultStyle(".benignware-controls-ListItem label", "font-size", "16px");
	CSS.setDefaultStyle(".benignware-controls-ListItem label", "font-weight", "bold");
	
//	
//	CSS.setDefaultStyle(".benignware-controls-ListItem > div", "max-width", "100%");
//	CSS.setDefaultStyle(".benignware-controls-ListItem p", "display", "block");
	CSS.setDefaultStyle(".benignware-controls-ListItem p", "white-space", "pre");
	CSS.setDefaultStyle(".benignware-controls-ListItem p", "white-space", "pre-wrap");
	CSS.setDefaultStyle(".benignware-controls-ListItem p", "white-space", "-pre-line");
	CSS.setDefaultStyle(".benignware-controls-ListItem p", "white-space", "-pre-wrap");
//	CSS.setDefaultStyle(".benignware-controls-ListItem p", "text-overflow", "ellipsis");
	CSS.setDefaultStyle(".benignware-controls-ListItem p", "margin", "0");
	CSS.setDefaultStyle(".benignware-controls-ListItem p", "word-wrap", "break-word");
	
	CSS.setDefaultStyle(".benignware-controls-ListItem", "overflow", "hidden");
	
	CSS.setDefaultStyle(".benignware-controls-ListItem img", "vertical-align", "middle");
	CSS.setDefaultStyle(".benignware-controls-ListItem label", "vertical-align", "middle");
	
	CSS.setDefaultStyle(".benignware-controls-ListItem.selected", "background", "#3399ff");
	CSS.setDefaultStyle(".benignware-controls-ListItem.selected", "color", "#ffffff");
	
	function ListItem(){
		_parent.apply(this, arguments);
	}
	
	Class.register("benignware.controls.ListItem", ListItem);
	
	ListItem = Class.extend(EditableItem, ListItem);
	_parent = Class.getParent(ListItem);
	
	ListItem.prototype._createChildren = function() {
		
		_parent._createChildren.apply(this, arguments);
		
		// action-indicator-cell
		this.actionIndicatorCell = this.ownerDocument.createElement('div');
		this.actionIndicatorCell.className = "action-indicator-cell";
		this.appendChild(this.actionIndicatorCell);
		
		this.actionIndicatorCell.appendChild(this.actionIndicatorElem);
		
		// image-cell
		this.imageCell = this.ownerDocument.createElement('div');
		this.imageCell.className = "image-cell";
		this.appendChild(this.imageCell);
		
		this.imageElem = this.ownerDocument.createElement('img');
		this.imageElem.style.display = "none";
		this.imageCell.appendChild(this.imageElem);
		
		// content-cell
		this.contentCell = this.ownerDocument.createElement('div');
		this.contentCell.className = "content-cell";
		this.appendChild(this.contentCell);
		
		this.labelElem = this.ownerDocument.createElement('label');
		this.labelElem.style.display = "none";
		this.contentCell.appendChild(this.labelElem);
		
		this.textElem =this.ownerDocument.createElement('p');
		this.textElem.style.display = "none";
		this.contentCell.appendChild(this.textElem);
	}
	
	ListItem.prototype.setImage = function(src) {
		if (src) {
			this.imageElem.setAttribute('src', src);
			this.imageElem.style.display = "";
		} else {
			this.imageElem.style.display = "none";
		}
	}
	
	ListItem.prototype.getImage = function(view) {
		return this.imageElem.getAttribute('src');
	}
	
	ListItem.prototype.setLabel = function(label) {
		if (label) {
			this.labelElem.innerHTML = label;
			this.labelElem.style.display = "";
		} else {
			this.labelElem.style.display = "none";
		}
	}
	
	ListItem.prototype.getLabel = function(view) {
		return this.labelElem.innerHTML;
	}
	
	ListItem.prototype.setText = function(text) {
		if (text) {
			this.textElem.innerHTML = text;
			this.textElem.style.display = "";
		} else {
			this.textElem.style.display = "none";
		}
	}
	
	ListItem.prototype.getText = function(view) {
		return this.textElem.innerHTML;
	}
	
	return ListItem;
})();
(function(){
	// import classes
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Container = Class.require("benignware.core.Container");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var CSS = Class.require("benignware.util.CSS");
	var StringUtils = Class.require("benignware.util.StringUtils");
	//
	var EditableList = Class.require("benignware.controls.EditableList");
	// define super
	var _parent;
	/**
	 * Constructs a new List.
	 * @constructor
	 */
	function List() {
		_parent.apply(this, arguments);
	}
	
	Class.register("benignware.controls.List", List);
	// extend
	Class.extend(EditableList, List);
	// get super
	_parent = Class.getParent(List);
	//
//	CSS.setDefaultStyle(".benignware-controls-ListItem", "display", "table");
//	CSS.setDefaultStyle(".benignware-controls-ListItem", "border-collapse", "collapse");
//	CSS.setDefaultStyle(".benignware-controls-ListItem .contentLayer", "display", "inherit");
//	CSS.setDefaultStyle(".benignware-controls-ListItem .contentLayer", "width", "inherit");
//	CSS.setDefaultStyle(".benignware-controls-ListItem", "box-sizing", "border-box");
//	CSS.setDefaultStyle(".benignware-controls-ListItem", "-moz-box-sizing", "border-box");
//	CSS.setDefaultStyle(".benignware-controls-ListItem", "-webkit-box-sizing", "border-box");
//	CSS.setDefaultStyle(".benignware-controls-ListItem", "overflow", "hidden");
	
	List.prototype._initialize = function() {
		_parent._initialize.apply(this, arguments);
		// default remove item
		this.addEventListener('change', Delegate.create(this, function(event) {
			if (event.target.getAction) {
				var action = event.target.getAction();
				if (action == 'remove') {
					this.remove(event.target);
				}
			}
		}));
	}

	return List;
})();
(function() {
	
	/**
	 * tabbar item component
	 * @class benignware.controls.TabBarItem
	 */
	
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	
	var SelectableItem = Class.require("benignware.controls.SelectableItem");
	
	var __super;
	
	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "font-size", "15px");
	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "font-family", "Arial");
//	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "cursor", "pointer");
	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "text-align", "center");
//	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "vertical-align", "middle");
	
//	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "border-radius", "3px");
	
	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "padding", "0.5em");
	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "overflow", "hidden");
	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "white-space", "nowrap");
	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "text-overflow", "ellipsis");
	
//	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "height", "100%");
	
	
	CSS.setDefaultStyle(".benignware-controls-TabBarItem span, .benignware-controls-TabBarItem img", "vertical-align", "middle");
	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "line-height", "1em");
	
	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "color", "rgb(255,255,255)");
	CSS.setDefaultStyle(".benignware-controls-TabBarItem", "background", "rgba(240,240,240,0)");
//	
	CSS.setDefaultStyle(".benignware-controls-TabBarItem.selected", "background", "rgba(240,240,240,0.3)");
	CSS.setDefaultStyle(".benignware-controls-TabBarItem.selected", "color", "rgb(0,255,255)");
	
//	CSS.setDefaultStyle(".benignware-controls-TabBarItem.selected", "transition", "color .4s ease-in-out, background .4s ease-in-out");
//	CSS.setDefaultStyle(".benignware-controls-TabBarItem.selected", "-moz-transition", "color .4s ease-in-out, background .4s ease-in-out");
//	CSS.setDefaultStyle(".benignware-controls-TabBarItem.selected", "-webkit-transition", "color .4s ease-in-out, background .4s ease-in-out");

	
	function TabBarItem(options) {
		
		_parent.apply(this, arguments);
		
		var view = null;
		
		/**
		 * associates a view with this item
		 * @privileged
		 * @method setView
		 * @param {Element} element an element
		 */
		this.setView = function(element) {
			view = element;
			updateView.call(this);
		}
		
		/**
		 * retrieves the view associated with this item
		 * @privileged
		 * @method getView
		 * @return {Element} the element
		 */
		this.getView = function() {
			return typeof(view) == "string" ? this.ownerDocument.getElementById(view) : view;
		}
		
		function updateView() {
			var view = this.getView();
			console.log("update view", view);
			if (view) {
				if (this.isSelected()) {
					console.log("show view", view);
					view.show();
					if (view.setScrollPosition) {
						view.setScrollPosition(0, 0);
					}
				} else {
					console.log("hide view", view);
					view.hide();
				}
			}
		}
		
		this.addEventListener('selectionchange', Delegate.create(this, updateView));
		this.addEventListener('push', Delegate.create(this, updateView));
	}
	
	Class.register("benignware.controls.TabBarItem", TabBarItem);
	
	Class.extend(SelectableItem, TabBarItem);
	_parent = Class.getParent(TabBarItem);
	//
	
	TabBarItem.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
		this.selectEvent = "down";
	}
	
	TabBarItem.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
		
		this.imageElem = this.ownerDocument.createElement('img');
		this.imageElem.style.display = "none";
		this.appendChild(this.imageElem);
		
		this.labelElem = this.ownerDocument.createElement('span');
		this.labelElem.style.display = "none";
		this.appendChild(this.labelElem);
	}

	
	/**
	 * sets an image for this item
	 * @method setImage
	 * @param {String} src the image source
	 */
	TabBarItem.prototype.setImage = function(src) {
		if (src) {
			this.imageElem.setAttribute('src', src);
			this.imageElem.style.display = "";
		} else {
			this.imageElem.style.display = "none";
		}
	}
	
	
	/**
	 * returns the item's image src
	 * @method getImage
	 * @return {String} the item's image src
	 */
	TabBarItem.prototype.getImage = function() {
		return this.imageElem.getAttribute();
	}
	
	
	/**
	 * sets the label text on this item
	 * @method setLabel
	 * @param {String} string the label text
	 */
	TabBarItem.prototype.setLabel = function(string) {
		if (string) {
			this.labelElem.innerHTML = string;
			this.labelElem.style.display = "";
		} else {
			this.labelElem.style.display = "none";
		}
	}
	
	/**
	 * retrieves the item's label text
	 * @method getLabel
	 * @return {String} the item's label text
	 */
	TabBarItem.prototype.getLabel = function(view) {
		return this.labelElem.innerHTML;
	}
	
	
	
	
	
	return TabBarItem;
})();
(function(){
	
	/**
	 * a tabbar component
	 * @class benignware.controls.TabBar
	 */
	
	// import classes
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var CSS = Class.require("benignware.util.CSS");
	var StringUtils = Class.require("benignware.util.StringUtils");
	
	var Container = Class.require("benignware.core.Container");
	var SelectableList = Class.require("benignware.controls.SelectableList");
	// define super
	var _parent;
	
	/**
	 * Constructs a new TabBar.
	 * @constructor
	 */
	
//	var linearGradient = "linear-gradient(bottom, rgb(0,0,0) 7%, rgb(46,46,46) 45%, rgb(161,161,161) 90%)";
//	CSS.setDefaultStyle(".benignware-controls-TabBar", "background-image", "-o-" + linearGradient);
//	CSS.setDefaultStyle(".benignware-controls-TabBar", "background-image", "-moz-" + linearGradient);
//	CSS.setDefaultStyle(".benignware-controls-TabBar", "background-image", "-webkit-" + linearGradient);
//	CSS.setDefaultStyle(".benignware-controls-TabBar", "background-image", "-ms-" + linearGradient);
	
	CSS.setDefaultStyle(".benignware-controls-TabBar", "background", "#000");
	CSS.setDefaultStyle(".benignware-controls-TabBar", "height", "2em");
	CSS.setDefaultStyle(".benignware-controls-TabBar", "font-size", "15px");
//	CSS.setDefaultStyle(".benignware-controls-TabBar", "font-size", "15px");
	
	CSS.setDefaultStyle("ul.benignware-controls-TabBar", "margin", "0");
	CSS.setDefaultStyle("ul.benignware-controls-TabBar", "padding", "0");
	CSS.setDefaultStyle("ul.benignware-controls-TabBar", "list-style-type", "none");
	CSS.setDefaultStyle("ul.benignware-controls-TabBar", "list-style-position", "inside");
	

	function TabBar() {
		_parent.apply(this, arguments);
	}
	
	Class.register("benignware.controls.TabBar", TabBar);
	// extend
	Class.extend(SelectableList, TabBar);
	// get super
	_parent = Class.getParent(TabBar);
	//
	
	TabBar.prototype._initialize = function() {
		_parent._initialize.apply(this, arguments);
		this.setLayout('horizontal-content-fit');
	}
	
	// protected methods
	TabBar.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);
		this.addEventListener('change', Delegate.create(this, updateViews), false);
	}
	
	TabBar.prototype.add = function(item, index) {
		_parent.add.apply(this, arguments);
		updateViews.call(this);
	}
	
	function updateViews() {

//		var selectedItem = this.getSelectedItem();
//		var selectedView = selectedItem && selectedItem.getView ? selectedItem.getView() : null;
//		
//		if (selectedView) {
//			for (var i = 0; i < this.size(); i++) {
//				var item = this.get(i);
//				
//				if (item.getView) {
//					var view = item.getView();
//					if (view != null && view != selectedView) {
//						if (view.hide) {
//							view.hide();
//						} else {
//							Element.hide(view);
//						}
//					}
//				}
//			}
//			if (selectedView.show) {
//				selectedView.show();
//			} else {
//				Element.show(selectedView);
//			}
//		}
	}
	
	return TabBar;
})();
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
(function(){
	
	/**
	 * shows an activity indicator with status message
	 * @class benignware.view.ActivityView  
	 */
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	var ItemLayout = Class.require("benignware.layout.ItemLayout");
	
	var _parent;
	
	var progressIcon = Class.getPath("benignware.view.ActivityView", "ajax-loader.gif");
	var warnIcon = Class.getPath("benignware.view.ActivityView", "warn-icon.png");
	var errorIcon = Class.getPath("benignware.view.ActivityView", "warn-icon.png");
	var okIcon = Class.getPath("benignware.view.ActivityView", "ok.png");
	
	CSS.setDefaultStyle(".benignware-view-ActivityView", "position", "absolute");
	CSS.setDefaultStyle(".benignware-view-ActivityView", "width", "100%");
	CSS.setDefaultStyle(".benignware-view-ActivityView", "height", "100%");
	CSS.setDefaultStyle(".benignware-view-ActivityView", "z-index", "1");
//	CSS.setDefaultStyle(".benignware-view-ActivityView", "position", "relative");
	CSS.setDefaultStyle(".benignware-view-ActivityView", "text-align", "center");
//	CSS.setDefaultStyle(".benignware-view-ActivityView label", "border", "1px solid green");
	CSS.setDefaultStyle(".benignware-view-ActivityView label", "display", "block");
//	CSS.setDefaultStyle(".benignware-view-ActivityView label", "position", "relative");
	
	CSS.setDefaultStyle(".benignware-view-ActivityView.progress .feedback", "background-image", "url('" + progressIcon + "')");
	CSS.setDefaultStyle(".benignware-view-ActivityView.warn .feedback", "background-image", "url('" + warnIcon + "')");
	CSS.setDefaultStyle(".benignware-view-ActivityView.error .feedback", "background-image", "url('" + errorIcon + "')");
	CSS.setDefaultStyle(".benignware-view-ActivityView.ok .feedback", "background-image", "url('" + okIcon + "')");
	
	CSS.setDefaultStyle(".benignware-view-ActivityView .feedback", "background-repeat", "no-repeat");
	CSS.setDefaultStyle(".benignware-view-ActivityView .feedback", "background-size", "contain");
	
	CSS.setDefaultStyle(".benignware-view-ActivityView .feedback", "width", "32px");
	CSS.setDefaultStyle(".benignware-view-ActivityView .feedback", "height", "32px");
//	CSS.setDefaultStyle(".benignware-view-ActivityView .feedback", "position", "relative");
	
//	CSS.setDefaultStyle(".benignware-view-ActivityView .feedback", "margin", "0 auto");
	
//	CSS.setDefaultStyle(".benignware-view-ActivityView .feedback", "border", "1px solid blue");
	CSS.setDefaultStyle(".benignware-view-ActivityView label", "padding", "5px");
	
	function ActivityView() {

		_parent.apply(this, arguments);
		
		var _status = null;
		
		this.setStatus = function(status, message) {
			message = message || "";
			var old = this.getStatus();
			if (old) {
				this.removeCSSName(old);
			}
			this.addCSSName(status);
			if (message) {
				this.setMessage(message);
			}
			_status = status;
			this.invalidate();
		}
		
		this.getStatus = function() {
			return _status;
		}
	}
	
	ActivityView.STATUS_PROGRESS = "progress";
	ActivityView.STATUS_WARN = "warn";
	ActivityView.STATUS_ERROR = "error";
	ActivityView.STATUS_OK = "ok";
	
	Class.register("benignware.view.ActivityView", ActivityView);
	
	Class.extend(Component, ActivityView);
	_parent = Class.getParent(ActivityView);
	//
	ActivityView.prototype.feedbackElem = null;
	ActivityView.prototype.messageElem = null;
	
	ActivityView.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
	}
	
	ActivityView.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);

		this.messageElem = this.getElementsByTagName('label')[0];
		if (!this.messageElem) {
			this.messageElem = this.ownerDocument.createElement('label');
			this.appendChild(this.messageElem);
		}
		
		Element.addCSSName('message');
		
		var icon = this.ownerDocument.createElement('div');
		icon.className = "feedback";
		this.feedbackElem = icon;
		this.insertBefore(icon, this.messageElem);

	}
	
	ActivityView.prototype._update = function() {
		
		_parent._update.call(this);
		
		this.messageElem.style.display = this.getMessage() ? '' : 'none';

		var itemLayout = new ItemLayout();

		itemLayout.element = this;

		itemLayout.perform();

	}
	

	ActivityView.prototype.setFeedbackImage = function(src) {
//		this.feedbackElem.style.backgroundImage = "url('" + src + "')";
		this.feedbackElem.setAttribute('src', src);
	}
	
	ActivityView.prototype.getFeedbackImage = function(view) {
		return Element.getComputedStyle(this.feedbackElem, "backgroundImage");
//		return this.feedbackElem.setAttribute('src', src);
	}
	
	ActivityView.prototype.setMessage = function(message) {
		var msg = this.messageElem;
		msg.innerHTML = message;
		this.invalidate();
	}
	
	ActivityView.prototype.getMessage = function() {
		return this.messageElem.innerHTML;
	}
	
	return ActivityView;
})();
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
(function(){
	
	/**
	 * shows an activity indicator with status message
	 * @class benignware.view.Slideshow  
	 */
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Component = Class.require("benignware.core.Component");
	var Container = Class.require("benignware.core.Container");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var StringUtils = Class.require("benignware.util.StringUtils");
	var CSS = Class.require("benignware.util.CSS");
	var Transition = Class.require("benignware.core.Transition");
	var ActivityView = Class.require("benignware.view.ActivityView");
	var ImageView = Class.require("benignware.view.ImageView");
	var ImageLoader = Class.require("benignware.util.ImageLoader");
	var DOM = Class.require("benignware.util.DOM");
	
	var _parent;
	
	CSS.setDefaultStyle(".benignware-view-Slideshow", "overflow", "hidden");
	
	CSS.setDefaultStyle(".benignware-view-Slideshow", "position", "relative");
	CSS.setDefaultStyle(".benignware-view-Slideshow", "width", "420px");
	CSS.setDefaultStyle(".benignware-view-Slideshow", "height", "380px");
	CSS.setDefaultStyle(".benignware-view-Slideshow", "-user-select", "none");
	CSS.setDefaultStyle(".benignware-view-Slideshow", "-moz-user-select", "none");
	CSS.setDefaultStyle(".benignware-view-Slideshow", "-webkit-user-select", "none");
//	CSS.setDefaultStyle(".benignware-view-Slideshow", "-webkit-backface-visibility", "hidden");
//	CSS.setDefaultStyle(".benignware-view-Slideshow", "-webkit-transform", "translateZ(0)");
//	CSS.setDefaultStyle(".benignware-view-Slideshow", "-webkit-backface-visibility", "hidden");
//	CSS.setDefaultStyle(".benignware-view-Slideshow img", "-webkit-backface-visibility", "hidden");
	
	CSS.setDefaultStyle(".benignware-view-Slideshow", "-webkit-text-size-adjust", "none");
	
//	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "border-radius", "10px");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "position", "absolute");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "z-index", "100");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "width", "40px");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "height", "40px");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "top", "50%");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "left", "50%");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "margin", "-20px");
	
//	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView", "display", "none");
	
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView.error", "display", "none");
	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView.warn", "display", "none");

	CSS.setDefaultStyle(".benignware-view-Slideshow .benignware-view-ActivityView.overlay", "background", "#fff");
	
	function Slideshow() {
		
		_parent.apply(this, arguments);
		
		var slideshow = this;
		
		var isPlaying = false;
		var _position = 0;
		var currentItem = null;
		var imageLoader = new ImageLoader();
		imageLoader.addEventListener('load', imageLoadHandler);
		imageLoader.addEventListener('error', imageErrorHandler);
		
		var nextTimeoutId = null;
		
		var transitionIn = new Transition();
		transitionIn.startValue = ["0"];
		transitionIn.endValue = ["1"];
		transitionIn.property = ["opacity"];
		transitionIn.timingFunction = ["ease-in"];
		transitionIn.addEventListener('complete', transitionInCompleteHandler);
		
		var transitionOut = new Transition();
		transitionOut.timingFunction = ["ease-in"];
//		transitionOut.startValue = ["1"];
		transitionOut.endValue = ["0"];
		transitionOut.property = "opacity";
		transitionOut.addEventListener('complete', transitionOutCompleteHandler);
		
		var calledByNextTimeout = false;
		
		this.start = function() {
//			console.log("slideshow start", isPlaying);
			if (!isPlaying) {
//				console.log("** slideshow start");
				this.stop();
				this.setPosition(0);
				this.dispatchEvent(Event.create(this.ownerDocument, 'start', false, false));
				this.play();
			}
		}

		this.play = function() {
			if (!isPlaying) {
				console.log("slideshow play");
				initNextTimeout.call(this);
				isPlaying = true;
				this.dispatchEvent(Event.create(this.ownerDocument, 'play', false, false));
			}
		}
		
		this.pause = function() {
			if (isPlaying) {
				console.log("slideshow pause");
				window.clearTimeout(nextTimeoutId);
				isPlaying = false;
				this.dispatchEvent(Event.create(this.ownerDocument, 'pause', false, false));
			}
		}
		
		this.stop = function() {
			if (!isPlaying) {
//				console.log("slideshow stop");
				window.clearTimeout(nextTimeoutId);
				isPlaying = false;
				this.dispatchEvent(Event.create(this.ownerDocument, 'stop', false, false));
			}
		}
		
		this.togglePlay = function() {
			if (this.isPlaying()) {
				this.pause();
			} else {
				this.play();
			}
		}
		
		this.setPosition = function(position) {
			
			if (_position != position || !currentItem) {
				
				
//				clearNextTimeout.call(this);
				var item = this.get(position);
				_position = position;
				
				var positionEvent = Event.create(this.ownerDocument, 'position', false, false);
//				console.log('dispatch position event', positionEvent);
				this.dispatchEvent(positionEvent);
				
//				console.log("set pos", position, _position);
				
				slide.call(this);
				
			}
		}
		
		this.getPosition = function() {
			return _position;
		}
		
		this.getContentSize = function() {
			return {
				width: this.clientWidth, 
				height: this.clientHeight
			}
		}
		
		this.getLayout = function() {
			return null;
		}
		
		this.isPlaying = function() {
			return isPlaying;
		}

		function initNextTimeout() {
			clearNextTimeout.call(this);
			var d = parseFloat(slideshow.duration) * 1000;
			nextTimeoutId = window.setTimeout(function() {
//				console.log("slide timeout", slideshow.isPlaying());
				if (slideshow.isPlaying()) {
					calledByNextTimeout = true;
					slideshow.next();
					calledByNextTimeout = false;
				}
			}, d);
		}
		
		function clearNextTimeout() {
			window.clearTimeout(nextTimeoutId);
		}
		
		function transitionInCompleteHandler(event) {
//			console.log("transition in complete");
			slide.call(slideshow);
			transitionInComplete.call(slideshow);
		}
		
		function transitionInComplete() {
			console.log('transition in complete');
			if (slideshow.isPlaying()) {
				initNextTimeout.call(slideshow);
			}
			// preload next
			var pos = slideshow.getPosition();
			
			var next = pos < slideshow.size() - 1 ? pos + 1 : 0;
			var prev = pos > 0 ? pos - 1 : slideshow.size() - 1;
//			console.log("trans in complete preload: ", next, prev);
			imageLoader.add(slideshow.get(next));
			imageLoader.add(slideshow.get(prev));
			slideshow.invalidate();
		}
		
		
		function transitionOutCompleteHandler(event) {
//			console.log("transition out complete");
			slide.call(slideshow);
		}
		
		function imageLoadHandler(event) {
			console.log("image load handler", event.element);
			
			var item = slideshow.get(slideshow.getPosition());
			if (item == event.element) {
				console.log("call slide item after load ", item);
//				item.style.visibility = "visible";
				slide.call(slideshow);
			}
		}
		
		function imageErrorHandler(event) {
			console.log("image error handler", event.element);
			var item = slideshow.get(slideshow.getPosition());
			if (item == event.element) {
//				console.log("next due to error: ");
				slideshow.next();
			}
		}
		
		function slide() {
			
			clearNextTimeout.call(this);
			
			var pos = this.getPosition();
			var item = this.get(this.getPosition());

			if (item != null && item != currentItem) {

				var isItemComplete = ImageLoader.isComplete(item);
				if (!isItemComplete) {			
					this.activityView.setStatus('progress');
					item.style.visibility = "hidden";
//					item.style.display = "none";
					
					if (!calledByNextTimeout) {
						this.activityView.show();
						if (currentItem) {
							this.activityView.addCSSName('overlay');
						} else {
							this.activityView.removeCSSName('overlay');
						}
						imageLoader.add(item);
					}
					
					
				} else if (!transitionIn.isPlaying() && !transitionOut.isPlaying()) {
					
//					console.log("transition not playing show", isItemComplete);
					
					for (var i = 0; i < slideshow.size(); i++) {
						var child = slideshow.get(i);
						var v = Element.getComputedStyle(child, 'visiblility');
						
						
						
						if ((child == item || child == currentItem) ) {
							
//							console.log("show: ", item == child, child.getAttribute('data-content-id'), child);
							
//							child.style.display = '';
							
//							if (ImageLoader.isComplete(child) && v != 'visible') {
//								child.style.visibility = 'visible';
//							}
							
							child.style.visibility = 'visible';
							
						} else {
//							console.log("hide: ", item == child, child.getAttribute('data-content-id'));
//							child.style.display = 'none';
							child.style.visibility = 'hidden';
//							child.style.zIndex = "";
							item.style.zIndex = "";
						}
						
					}
					
					
					slideshow.activityView.hide();
					
					item.style.zIndex = "1";
//					item.style.visibility = "visible";
					
					if (currentItem) {
						console.log('reset old item', currentItem.style.zIndex);
						currentItem.style.zIndex = "";
//						currentItem.style.visibility = "";
//						child.style.display = '';
//						transitionOut.element = currentItem;
//						transitionOut.duration = this.transitionDuration;
//						console.log("start trans out: ", currentItem);
//						transitionOut.start();
//						updateItem.call(this, currentItem);
					}
					
					

//					updateItem.call(this, item);
					
					if (currentItem) {
						console.log('start transition in', item.style.zIndex);
						transitionIn.element = item;
						transitionIn.duration = this.transitionDuration;
						transitionIn.start();
					} else {
						console.log("first item complete");
						transitionInComplete.call(this);
					}
					
					// update current item
					currentItem = item;
					

					var slideEvent = Event.create(this.ownerDocument, 'slide', false, false);
//					console.log('dispatch slide event', slideEvent, this.activityView);
					this.dispatchEvent(slideEvent);
					
					this.invalidate();
					
				} else {
					console.log('transition playing');
				}
				
				
				
				

			}
			
		}
		
		
		
//		window.setTimeout(function() {
//			console.log('timeoutstart');
//			slideshow.start();
//		}, 1)
//		
		
	}
	
	Class.register("benignware.view.Slideshow", Slideshow);
	
	Class.extend(Container, Slideshow);
	_parent = Class.getParent(Slideshow);
	//
	Slideshow.prototype.activityView = null;
	Slideshow.prototype.autoPlay = true;
	
	Slideshow.prototype._initialize = function(options) {
		_parent._initialize.apply(this, arguments);
		if (StringUtils.toBoolean(this.autoPlay)) {
			this.start();
		} else {
			this.setPosition(0);
		}
	}
	
	Slideshow.prototype._createChildren = function() {
		_parent._createChildren.apply(this, arguments);

		this.activityView = Element.create(this.ownerDocument, ActivityView);
		this.activityView.hide();
		this.appendChild(this.activityView);
		
	}
	
	Slideshow.prototype.duration = 3;
	Slideshow.prototype.transitionDuration = 1;
	Slideshow.prototype.scaleMode = 'contain';
	
	Slideshow.prototype._update = function() {
		
		
		
		for (var i = 0; i < this.size(); i++) {
			
			var item = this.get(i);
			updateItem.call(this, item);

		}
		

	}
	
	function updateItem(item) {
		
		var maxWidth = Math.round(this.getWidth());
		var maxHeight = Math.round(this.getHeight());
		
		item.style.position = "absolute";

		var deepestAncestor = DOM.getDeepestElement(item);
		var componentParent = DOM.getParentByClass(deepestAncestor, Component);
		
		if (deepestAncestor.tagName.toLowerCase() == "img" && !(componentParent && DOM.isChildOf(componentParent, this))) {
			
			elem = deepestAncestor;
			// scale image
			ImageView.scale(item, maxWidth, maxHeight, this.scaleMode, null);

		} else {
			
			Element.setWidth(elem, maxWidth);
			Element.setHeight(elem, maxHeight);

		}
		
		// align
		item.style.left = Math.floor((maxWidth - Element.getOuterWidth(item)) * 0.5) + "px";
		item.style.top = Math.floor((maxHeight - Element.getOuterHeight(item)) * 0.5) + "px";
	}
	
	Slideshow.prototype.next = function() {
		var pos = this.getPosition();
		if (pos + 1 < this.size()) {
			pos++;
		} else {
			pos = 0;
		}
		this.setPosition(pos);
	}
	
	Slideshow.prototype.previous = function() {
		var pos = this.getPosition();
		if (pos - 1 >= 0) {
			pos--;
		} else {
			pos = this.size() - 1;
		}
		this.setPosition(pos);
	}
	
	
	return Slideshow;
})();
(function() {
	
	/**
	 * the view package contains screen-building container classes.
	 * @package benignware.view
	 */
	
	var Class = benignware.core.Class;
	var Element = Class.require('benignware.core.Element');
	var Event = Class.require('benignware.core.Event');
	var Container = Class.require('benignware.core.Container');
	var Transition = Class.require('benignware.core.Transition');
	var Delegate = Class.require('benignware.util.Delegate');
	var StringUtils = Class.require('benignware.util.StringUtils');
	var CSS = Class.require('benignware.util.CSS');
	
	var Layout = Class.require('benignware.core.Layout');
	var ClientFitLayout = Class.require('benignware.layout.ClientFitLayout');
	
	CSS.setDefaultStyle(".benignware-view-ScrollView", "overflow", "hidden");
	CSS.setDefaultStyle(".benignware-view-ScrollView", "height", "240px");

	CSS.setDefaultStyle(".benignware-view-ScrollView .content-layer", "height", "100%");
	
	/**
	 * a scroll view component
	 * @package benignware.view
	 * @class ScrollView
	 * @extends benignware.core.Container
	 */
	
	Class.create('benignware.view.ScrollView', (function() {
		
		var _parent; 
		
		var transformStyle = CSS.getVendorStyle('transform');
		
		// private helpers

		function abs(a) {
			return a < 0 ? -a : a;
		}
		
		// TODO: change
		function momentum (dist, time, maxDistUpper, maxDistLower) {

			var friction = 2.5,
				deceleration = 1.2,
				speed = Math.abs(dist) / time * 1000,
				newDist = speed * speed / friction / 1000,
				newTime = 0;

			// Proportinally reduce speed if we are outside of the boundaries 
			
			if (dist > 0 && newDist > maxDistUpper) {
				speed = speed * maxDistUpper / newDist / friction;
				newDist = maxDistUpper;
			} else if (dist < 0 && newDist > maxDistLower) {
				speed = speed * maxDistLower / newDist / friction;
				newDist = maxDistLower;
			}
			
			newDist = newDist * (dist < 0 ? -1 : 1);
			
			newTime = speed / deceleration;

			return { dist: Math.round(newDist), time: Math.round(newTime) };
		}
		
		/**
		 * @constructor
		 */
		function ScrollView() {
			
			var __parent = _parent.apply(this, arguments);
			
			// init scroller method
			var _scrollerMethod = null;
			
			var scrollTransition = new Transition();
			scrollTransition.addEventListener('complete', scrollTransitionCompleteHandler);
			
			var page = 0;
			
			// touch vars
			var touchStartPos = null;
			var touchCurrentPos = null;
			var touchStartTime = 0;
			var touchInitialVector = null;
			
			// mouse vars
			var mouseOverElement = null;
			
			// mouse wheel
			var mouseWheelDelta = null;
			var mouseWheelVelocity = {};
			var mouseWheelEndTimeoutId;
			
			var scrollView = this;
			
			var scrollPosition = {x: 0, y: 0}
			
			var displayManagementTimerID = null;
			
			var _displayManagement = true;
			
			var scrollView = this;
			
			function updatePage() {
				var pages = this.getPages();
				console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", pages);
				var currentPage = getPageAt.call(this, this.getScrollPosition());
				if (pages > 0) {
					if (currentPage != page) {
						page = currentPage;
						var pageEvent = Event.create(scrollView.ownerDocument, 'page', false, false);
						if (_displayManagement == 'auto' && !displayManagementTimerID) {
							displayManagementTimerID = window.setTimeout(function() {
								updateDisplayedItems.call(scrollView);
								displayManagementTimerID = null;
								scrollView.dispatchEvent(pageEvent);
							}, 1);
						} else {
							scrollView.dispatchEvent(pageEvent);
						}
					}
				}
			}
			
			function scrollToBounds(duration) {
				
				duration = typeof(duration) == "number" ? duration : 0.25;
				// scroll to bounds
				var s = this.getScrollPosition();
				var n = getScrollPosInBounds.call(this, s.x, s.y);

				if (n.x != s.x || n.y != s.y) {
					console.log("scroll to bounds");
					this.scrollTo(n.x, n.y, duration);
				} else {
					console.log("scroll finish");
					updatePage.call(scrollView);
					scrollEnd.call(this);
				}
				
			}
			
			// touch handlers
			
			function touchStartHandler(event) {
//				console.log("touch start handler");
				touchStartPos = touchCurrentPos = {x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY};
				touchStartTime = new Date().getTime();
				touchInitialVector = null;
				touchStart.call(this, event);
				//event.preventDefault();
			}
			
			function touchMoveHandler(event) {
//				console.log("touch move handler", touchCurrentPos);
				var touchX = event.touches[0].clientX;
				var touchY = event.touches[0].clientY;
				if (touchCurrentPos != null) {
					var dx = (touchX - touchCurrentPos.x) * -1;
					var dy = (touchY - touchCurrentPos.y) * -1;
					touchCurrentPos = {x: touchX, y: touchY}
					touchMove.call(this, event, dx, dy);
				}
				
				//event.preventDefault();
			}
			
			function touchEndHandler(event) {
//				console.log("touch end handler");
				
				if (touchStartPos != null && touchCurrentPos != null) {
					var dx = touchCurrentPos.x - touchStartPos.x;
					var dy = touchCurrentPos.y - touchStartPos.y;
					touchEnd.call(this, event, dx, dy);
					touchCurrentPos = touchStartPos = null;
					
				}
			}
			
			
			// mouse handlers
			
			function mouseDownHandler(event) {
//				console.log("mouse down handler", event);
				//event = Event.getEvent(event);
				 //
				var pos = {x: event.clientX, y: event.clientY}
				touchStartPos = touchCurrentPos = pos;
				touchStartTime = new Date().getTime();
				touchInitialVector = null;
				touchStart.call(this, event);
				//
//				if (!event.target.focus) {
					event.preventDefault();
//				}
				
			}
			
			function mouseMoveHandler(event) {
				
				if (touchCurrentPos) {
					var touchX = event.clientX;
					var touchY = event.clientY;
					var dx = (touchX - touchCurrentPos.x) * -1;
					var dy = (touchY - touchCurrentPos.y) * -1;
					touchCurrentPos = {x: touchX, y: touchY}
					touchMove.call(this, event, dx, dy);
				}
				
			}
			
			function mouseUpHandler(event) {
				if (touchCurrentPos && (touchCurrentPos.x != touchStartPos.x || touchCurrentPos.y != touchStartPos.y)) {
					var dx = touchCurrentPos.x - touchStartPos.x;
					var dy = touchCurrentPos.y - touchStartPos.y;
					
					touchEnd.call(this, event, dx, dy);
			//		event.preventDefault();
				}
				touchCurrentPos = touchStartPos = null;
			}
			
			function mouseOutHandler(event) {
				//event = Event.getEvent(event);
				if (event.relatedTarget == null) {
					mouseOverElement = null;
					if (touchCurrentPos != null) {
						touchEndHandler.call(this, event);
					}
				}
			}
			
			function mouseWheelHandler(event) {
				
				//var event = Event.getEvent(event);
				
				var scrollerMethod = this.getScrollerMethod();
				
				var cs = this.getContentSize();
				var cl = this.getClientSize();
				
				
				var s = this.getScrollPosition(this);
				
//				var sw = cs.width - cl.width;
//				var sh = cs.height - cs.height;
				
				var ss = this.getScrollSize();
				var sw = ss.width;
				var sh = ss.height;
				
				var wheelDeltaX;
				var wheelDeltaY;
				if ('wheelDeltaX' in event) {
//					console.log("webkit");
					wheelDeltaX = event.wheelDeltaX;
					wheelDeltaY = event.wheelDeltaY;
					
				} else if ('detail' in event) {
//					console.log("mozilla");
				    if (event.axis === 2) { 
				    	// Vertical
				    	wheelDeltaY = -event.detail * 12;
				    	wheelDeltaX = 0;
				    } else { 
				    	// Horizontal
				    	wheelDeltaX = -event.detail * 12;
				    	wheelDeltaY = 0;
				    }
				} else if ('wheelDelta' in event) {
					// ie / opera
					wheelDeltaX = 0;
					wheelDeltaY = event.wheelDelta;
				}

				var dx = - wheelDeltaX / 12;
				var dy = - wheelDeltaY / 12;
				
				
				if (!this.getPaging() && scrollerMethod == ScrollView.SCROLLER_METHOD_OVERFLOW) {
					if (!event.axis && !event.wheelDeltaX) {
						event.stopPropagation();
					}
					return;
				}
				
				
				if (!mouseWheelDelta) {
					// mousewheel start
					mouseWheelDelta = {x: 0, y: 0};
					mouseWheelVelocity = {x: 0, y: 0};
					touchStartTime = new Date().getTime();
					touchStartPos = s;
					touchInitialVector = {x: dx, y: dy}
//					touchStart.call(this, event);
					
				}
				
				// mousewheel move
				mouseWheelDelta.x+= dx;
				mouseWheelDelta.y+= dy;
//				var velocity = Math.sqrt(dx * dx + dy * dy);
				
				var v = {x: dx, y: dy};
				
				var o = (abs(v.x) > abs(v.y));
				
				if (sw > 0 && sh > 0 || sw > 0 && v.x != 0 && o || sh > 0 && v.y != 0 && !o) {
					event.stopPropagation();
					
					if (scrollerMethod != ScrollView.SCROLLER_METHOD_OVERFLOW) {
						event.preventDefault();
					}

					var time = new Date().getTime();
					
					if (this.getPaging()) {
						
						
						
						var velocity = Math.sqrt(dx * dx + dy * dy);
						var m = 1;

						dx*= 50;
						dy*= 50;
						
						var nx = s.x + dx;
						var ny = s.y + dy;

						if (dx > 0) {
							nx+= cl.width;
						} else if (dx < 0) {
							nx-= cl.width;
						}
						
						var n = getScrollPosInBounds.call(this, nx, ny);
						
						var p = getPageAt.call(this, nx, ny);
						
						if (n.x != s.x || n.y != s.y) {
							var touchTime = (time - touchStartTime) * 5;
							touchTime = Math.min(touchTime, 249);
							touchEnd.call(this, event, -dx, -dy, touchStartPos, touchTime);
							
							
						}
					} else {
						touchMove.call(this, event, dx, dy);
					}

					var target = this;
					window.clearTimeout(mouseWheelEndTimeoutId);
					mouseWheelEndTimeoutId = window.setTimeout(function() {
						// mousewheel end
						mouseWheelDelta = null;
						touchInitialVector = null;
//						__private.velocity = 0;
						touchStartPos = null;
						//interactionEnd.call(this);
						if (!scrollTransition.isPlaying()) {
							interactionEnd.call(this);
							scrollEnd.call(target);
						}
					}, 1);
					
					touchStartTime = time;

					var sw = cs.width - cl.width;
					var sh = cs.height - cl.height	
					
					if (dx != 0 && sw > 0 || dy != 0 && sh > 0) {
						//event.preventDefault();
					}
				}
				
				
				
				//return false;
			}
			
			
			
			// touch scrolling implementation 
			
			function touchStart(event) {
				mouseWheelDelta = null;
				touchInitialVector = null;
				
				scrollEnd.call(this);
				scrollTransition.stop();
				scrollPosition = getComputedScrollPosition.call(this); 
				
			}
			
			function touchMove(event, dx, dy) {

				if (dx != 0 || dy != 0) {

					if (touchInitialVector == null) {
						touchInitialVector = {x: dx, y: dy}
					}

					var s = this.getScrollPosition();
					
					var sx = s.x;
					var sy = s.y;
					
					var ss = this.getScrollSize();
					
					var sw = ss.width;
					var sh = ss.height;

					var bd = 0;
					if (StringUtils.toBoolean(this.bounces)) {
						bd = event.type != "mousewheel" && event.type != "DOMMouseScroll" ? parseFloat(this.bounceDistance) : 0;
					}
					
					var nx = sx;
					var ny = sy;

					var v = touchInitialVector;
					

					var o = (abs(v.x) > abs(v.y));
					
					

					if (sw > 0 && sh > 0 || sw > 0 && v.x != 0 && o || sh > 0 && v.y != 0 && !o) {
						
						if (sw > 0) {
							nx = sx + dx;
							var bx = bd;
							if (nx < -bx) {
								nx = -bx;
							} else if (nx > sw + bx) {
								nx = sw + bx;
							}
						}
						
						if (sh > 0) {
							ny = sy + dy;
							var by = bd;
							if (ny < -by) {
								ny = -by;
							} else if (ny > sh + by) {
								ny = sh + by;
							}
						}

						if (nx != sx || ny != sy) {
							
							interactionStart.call(this);
							scrollStart.call(this);
							
							if (!isNativeTouchScrolling.call(this)) {
								this.setScrollPosition(nx, ny);
								event.preventDefault();
//								event.stopPropagation();
							}

						} 

					}
					
				}
				
			}
			
			
			function touchEnd(event, dx, dy, s, touchTime) {
				
				
				var maxTouchTime = 250;
//				maxTouchTime = event.type != "mousewheel" && event.type != "DOMMouseScroll" ? maxTouchTime : 0; 
				var durationX = 0.25;
				var durationY = 0.25;
				
				touchTime = touchTime ? touchTime : new Date().getTime() - touchStartTime;
				
				var touchDistX = dx;
				var touchDistY = dy;

				var cls = this.getClientSize();
				var clw  = cls.width;
				var clh = cls.height;
				
				var cs = this.getContentSize();
				var cw = cs.width;
				var ch = cs.height;

				var sw = cw - clw;
				var sh = ch - clh;
				
				var bd = event.type != "mousewheel" && event.type != "DOMMouseScroll" ? parseFloat(this.bounceDistance) : 0; 
				
				var bouncing = StringUtils.toBoolean(this.bounces);
				
				var paging = this.getPaging();

				var horizontalPaging = paging;
				var verticalPaging = paging;

				s = s ? s : this.getScrollPosition();

				var sx = s.x;
				var sy = s.y;

				var n = getScrollPosInBounds.call(this, s.x, s.y);

				var nx = n.x;
				var ny = n.y;
				
				var v = touchInitialVector;

				if (v) {
					
					var o = (abs(v.x) > abs(v.y));

					
					if (sw > 0 && sh > 0 || sw > 0 && v.x != 0 && o || sh > 0 && v.y != 0 && !o) {

						// X
						if (sw > 0 && touchDistX != 0) {
							
							
							if (s.x < 0 || s.x > sw) {
								
								nx = s.x < 0 ? 0 : sw;
							} else {
								
								if (touchTime > 0 && touchTime < maxTouchTime) {
									// momentum scroll

									var x1, x2;
									if (horizontalPaging) {
										var px = Math.floor(s.x / clw) * clw;
										x1 = px - clw < 0 ? 0 : s.x == px ? px - clw : px;
										x2 = px + clw > sw ? sw : px + clw;
									} else {
										x1 = 0;
										x2 = sw;
									}
									maxDistX1 = s.x - x1;
									maxDistX2 = x2 - s.x;
									maxDistX1+= bouncing && x1 > 0 ? bd : 0;
									maxDistX2+= bouncing && x2 < sw ? bd : 0;

									var mx = momentum(touchDistX, touchTime, maxDistX1, maxDistX2);
									
									durationX = Math.max(mx.time / 1000, 0.25);
									nx = s.x - mx.dist;
									
									if (horizontalPaging) {
										if (touchDistX > 0 && nx > x1) {
											nx = x1;
										} else if (touchDistX < 0 && nx < x2) {
											nx = x2;
										}
									}
									
									
									
								}
							}
						}
						
						// Y
						if (sh > 0) {
							
							if (s.y < 0 || s.y > sh) {
								ny = s.y < 0 ? 0 : sh;
							} else {
								if (touchTime > 0 && touchTime < maxTouchTime) {
									// momentum scroll

									var y1, y2;
									
									if (verticalPaging) {
										var py = Math.floor(s.y / clh) * clh;
										y1 = py - clh < 0 ? 0 : s.y == py ? py - clh : py;
										y2 = py + clh > sh ? sh : py + clh;
									} else {
										y1 = 0;
										y2 = sh;
									}
									
									maxDistY1 = s.y - y1;
									maxDistY2 = y2 - s.y;
									
									maxDistY1+= bouncing && y1 > 0 ? bd : 0;
									maxDistY2+= bouncing && y2 < sh ? bd : 0;
									
				
									
									var my = momentum(touchDistY, touchTime, maxDistY1, maxDistY2);
									durationY = Math.max(my.time / 1000, 0.25);
									ny = s.y - my.dist;
									
									if (verticalPaging) {
										if (touchDistY > 0 && ny > y1) {
											ny = y1;
										} else if (touchDistY < 0 && ny < y2) {
											ny = y2;
										}
									}
								}
							}
						}
					}
				}
			

				if (nx != sx || ny != sy) {
					
					if (!isNativeTouchScrolling.call(this)) {
						this.scrollTo(nx, ny, Math.max(durationX, durationY));	
						event.preventDefault();
					}
				}

				// prevent default click execution
				if (typeof "touchstart" in window == "undefined") {
					
					if (touchDistX != 0 || touchDistY != 0) {
						var touchElem = event.type == "touchend" ? document.elementFromPoint(touchStartPos.x, touchStartPos.y) : event.target;
						
						if ((touchElem == this || DOM.isChildOf(touchElem, this))) {
							
//							if (!__private.clickDelegate) {
//								__private.clickDelegate = Delegate.create(this, clickHandler);
//							}
							
//							var click = 'click';
//							Element.addEventListener(touchElem, click, __private.clickDelegate, false);
//
//							if (typeof(touchElem['on' + click]) == "function" && touchElem['on' + click] != __private.clickDelegate) {
//								touchElem.__originalClickHandler = touchElem['on' + click];
//								touchElem['on' + click] = __private.clickDelegate;
//							}

						}
					}

				}

				
//				event.preventDefault();
				
				interactionEnd();
			}
			
			function scrollTransitionCompleteHandler(event) {
				scrollPosition = getComputedScrollPosition.call(scrollView);
				scrollToBounds.call(scrollView);
			}
			
			
			function windowResizeHandler(event) {
				if (this.getPaging()) {
					var page = this.getPage();
					var pos = getScrollPositionAtPage.call(this, page);
					this.setScrollPosition(pos.x, pos.y);
				}
			}
			
			
			var _paging = false;
			
			/**
			 * enables paging
			 * @privileged
			 * @method setPaging
			 * @param {Boolean} bool
			 */
			this.setPaging = function(bool) {
				bool = StringUtils.toBoolean(bool);
				if (bool != _paging) {
					_paging = bool;
					updateScrollerMethod.call(this);
					this.invalidate();
				}
			}
			
			/**
			 * returns true if paging is enabled.
			 * @privileged
			 * @method getPaging
			 * @return {Boolean} true if paging is enabled
			 */
			this.getPaging = function() {
				return _paging;
			}
			
			
			/**
			 * with paging enabled returns horizontal-client layout if not explicitly set
			 * @privileged
			 * @method getLayout
			 * @return {Layout} layout the layout.
			 */
			this.getLayout = function() {
				var layout = __parent.getLayout();
				if (this.getPaging() && !layout) {
					layout = new ClientFitLayout();
					layout.orientation = Layout.ORIENTATION_HORIZONTAL;
					layout.element = this;
				}
				return layout;
			}
			
			
			/**
			 * sets the scroller method
			 * @privileged
			 * @method setScrollerMethod
			 * @param {String} scrollerMethod the scroller method identifier
			 */
			this.setScrollerMethod = function(scrollerMethod) {
				console.log("set scroller method", scrollerMethod);
				if (scrollerMethod != _scrollerMethod) {
					var s = this.getScrollPosition();
					_scrollerMethod = scrollerMethod;
					updateScrollerMethod.call(this);
					this.setScrollPosition(s.x, s.y);
				}
			}
			
			/**
			 * gets the scroller method
			 * @privileged
			 * @method getScrollerMethod
			 * @return {String} the scroller method identifier
			 */
			this.getScrollerMethod = function() {
				if (_scrollerMethod) {
					return _scrollerMethod;
				}
//				if (this.getPaging()) {
//					return ScrollView.SCROLLER_METHOD_TRANSFORM;
//				}
				return ScrollView.SCROLLER_METHOD_OVERFLOW;
			}
			
			/**
			 * sets the scroll position
			 * @privileged
			 * @method setScrollPosition
			 * @param {Number} x the horizontal scroll position
			 * @param {Number} y the vertical scroll position
			 */
			this.setScrollPosition = function(x, y) {
				setScrollPosition.call(this, x, y);
				updatePage.call(this);
			}
			
			
			function setScrollPosition(x, y) {
				
				scrollPosition.x = x;
				scrollPosition.y = y;

				scrollTransition.stop();
				
				var scrollerMethod = this.getScrollerMethod();
				
				switch (scrollerMethod) {
				
					case ScrollView.SCROLLER_METHOD_OVERFLOW: 

						this.contentElem.scrollLeft = x;
						this.contentElem.scrollTop = y;

						break;
					
					case ScrollView.SCROLLER_METHOD_POSITION: 

						this.contentElem.style.left = -x + "px";
						this.contentElem.style.top = -y + "px";

						break;
						
					case ScrollView.SCROLLER_METHOD_TRANSFORM: 
					case ScrollView.SCROLLER_METHOD_TRANSFORM_3D: 
						
						var _3d = scrollerMethod == ScrollView.SCROLLER_METHOD_TRANSFORM_3D;
						var tr = _3d ? 'translate3d(' + (-x) + 'px, ' + (-y) + 'px, 0)' : 'translate(' + (-x) + 'px, ' + (-y) + 'px)';
						this.contentElem.style[transformStyle] = tr;
						
						break;
				}
				
				scrollEnd.call(this);
			}
			
			/**
			 * specifies whether the component should manage displayed items.
			 * @privileged
			 * @method setDisplayManagement
			 * @param {String} bool 
			 */
			this.setDisplayManagement = function(bool) {
				if (bool != _displayManagement) {
					_displayManagement = bool;
					updateDisplayedItems.call(this);
					//this.invalidate();
				}
			}
			
			/**
			 * gets the value of display management
			 * @privileged
			 * @method getScrollerMethod
			 * @return {String} true, if display management is enabled
			 */
			this.getDisplayManagement = function() {
				return _displayManagement;
			}
			
			
			function getComputedScrollPosition() {
				var x = 0; 
				var y = 0;

				var scrollerMethod = this.getScrollerMethod();
				
				switch (scrollerMethod) {
				
					case ScrollView.SCROLLER_METHOD_OVERFLOW: 
						
						x = this.contentElem.scrollLeft; 
						y = this.contentElem.scrollTop;
					
						break;
						
					case ScrollView.SCROLLER_METHOD_TRANSFORM:
					case ScrollView.SCROLLER_METHOD_TRANSFORM_3D: 
						
						var styleValue = Element.getComputedStyle(this.contentElem, transformStyle);

						var matrix = CSS.getTransformMatrix(styleValue);
						
						if (matrix) {
							
							x = -matrix.x; 
							y = -matrix.y;

						}

						break;
						
					case ScrollView.SCROLLER_METHOD_POSITION: 
						
						x = -parseInt(Element.getComputedStyle(this.contentElem, 'left'));
						y = -parseInt(Element.getComputedStyle(this.contentElem, 'top'));
						
						break;
						
					default: 
						
						x = y = 0;
				}
				
				x = isNaN(x) ? 0 : x;
				y = isNaN(y) ? 0 : y;
				
				return { x: Math.floor(x), y: Math.floor(y) }
			}
			
			/**
			 * gets the scroll position
			 * @privileged
			 * @method getScrollPosition
			 * @return {Object} an object containing the scroll position as x and y
			 */
			this.getScrollPosition = function() {
				return getComputedScrollPosition.call(this);
			}
			
			
			/**
			 * scrolls animated
			 * @privileged
			 * @method scrollTo
			 * @param {Number} x horizontal scroll position
			 * @param {Number} y vertical scroll position
			 * @param {Number} duration the duration in milliseconds. defaults to 0.5.
			 */
			this.scrollTo = function (x, y, duration) {

				console.log("scroll to: ", x, y, this.getPaging(), this.getScrollerMethod());
				
				duration = typeof duration != 'undefined' ? duration : 0.5;
				
				var s = this.getScrollPosition();
				var cs = this.getContentSize();
				
				x = Math.floor(x);
				y = Math.floor(y);

				if (x != s.x || y != s.y) {
					
					// scroll position changed.
					
					if (duration <= 0) {
						
						// if duration is 0 don't use a transition.
						this.setScrollPosition(x, y);
						
					} else {
						
						// init the transition
						var props = [];

						var startValue = [], endValue = [];

						var scrollerMethod = this.getScrollerMethod();
						
						switch (scrollerMethod) {
						
							case ScrollView.SCROLLER_METHOD_OVERFLOW: 
								
								if (x != s.x) {
									props.push('scrollLeft');
									startValue.push(s.x);
									endValue.push(x);
								}
									
								if (y != s.y) {
									props.push('scrollTop');
									startValue.push(s.y);
									endValue.push(y);
								}

								break;
								
							case ScrollView.SCROLLER_METHOD_TRANSFORM:
							case ScrollView.SCROLLER_METHOD_TRANSFORM_3D: 
								
								props = [transformStyle];
								var _3d = scrollerMethod == ScrollView.SCROLLER_METHOD_TRANSFORM_3D;
			
								var str = _3d ?  'translate3d(' + (-s.x) + 'px, ' + (-s.y) + 'px, 0)' : 'translate(' + (-s.x) + 'px, ' + (-s.y) + 'px)';
								startValue = [str];
								var etr = _3d ?  'translate3d(' + (-x) + 'px, ' + (-y) + 'px, 0)' : 'translate(' + (-x) + 'px, ' + (-y) + 'px)';
								endValue = [etr];
								break;
								
							case ScrollView.SCROLLER_METHOD_POSITION: 
								
								if (x != s.x) {
									props.push('left');
									startValue.push(-s.x + "px");
									endValue.push(-x + "px");
								}
									
								if (y != s.y) {
									props.push('top');
									startValue.push(-s.y + "px");
									endValue.push(-y + "px");
								}
								
								break;
							
						}
						
						
						if (!scrollTransition.element) {
							scrollTransition.element = this.contentElem;
						}
						
						scrollTransition.timingFunction = "ease-out";
						scrollTransition.property = props;
						scrollTransition.startValue = startValue;
						scrollTransition.endValue = endValue;
						scrollTransition.duration = duration;
						scrollTransition.start();
						
						// scroll start
						scrollStart.call(this);
					}				
				}
			}
			
			var isScrolling = false;
			
			
			function scrollStart() {
				if (!isScrolling) {
//					console.log("scroll start", this);
					isScrolling = true;
				}
			}
			
			function scrollEnd() {
				if (isScrolling) {
//					console.log("scroll end", this);
					isScrolling = false;
					this.dispatchEvent(Event.create('scrollend', false, false));
				}
			}

			
			this.isScrolling = function() {
				return isScrolling;
			}
			
			var isInteractive = false;
			var interactionTimeout = null;
			
			function interactionStart() {
				window.clearTimeout(interactionTimeout);
				interactionTimeout = null;
				if (!scrollView.isInteractive()) {
					isInteractive = true;
				}
			}
			
			function interactionEnd() {

				if (!interactionTimeout) {
					
					interactionTimeout = window.setTimeout(function() {
						if (scrollView.isInteractive()) {
							interactionTimeout = null;
							isInteractive = false;
						}
					}, 0);
				}
				
			}
			
			this.isInteractive = function() {
				return isInteractive;
			}
			
			/**
			 * gets the current page
			 * @privileged
			 * @method getPage
			 * @return {Number} the current page number
			 */
			this.getPage = function() {
				if (scrollTransition.isPlaying()) {
					return getPageAt.call(this, this.getScrollPosition());
				}
				return page || 1;
			}
			
			/**
			 * sets the current page
			 * @privileged
			 * @method setPage
			 * @param {Number} index the current page number
			 */
			this.setPage = function(index) {
				this.scrollToPage(index, 0);
			}
			
			/**
			 * gets the page at the specfied position
			 * @privileged
			 * @method getPageAt
			 * @return {Number} the page number
			 */
			this.getPageAt = function(x, y) {
				return getPageAt.call(this, {x: x, y: y});
			}
			
			
			// initialize
			
			 // configure listeners
			
			if ("ontouchstart" in window) {

				// touch support
				this.addEventListener("touchstart", Delegate.create(this, touchStartHandler), false);
				this.addEventListener("touchmove", Delegate.create(this, touchMoveHandler), false);
				//this.addEventListener("touchend", Delegate.create(this, touchEndHandler), false);
				
				// interaction end
				Element.addEventListener(this.ownerDocument, "touchend", Delegate.create(this, touchEndHandler), false);
			} else {
				// no touch support

				
//				this.addEventListener("mousedown", Delegate.create(this, mouseDownHandler), false);
				Element.addEventListener(this, "mousedown", Delegate.create(this, mouseDownHandler), false);
				Element.addEventListener(this.ownerDocument, "mouseup", Delegate.create(this, mouseUpHandler), false);
				Element.addEventListener(this, "mousemove", Delegate.create(this, mouseMoveHandler), false);
				// can't detect mouseup events from outside the window
				Element.addEventListener(this.ownerDocument, "mouseout", Delegate.create(this, mouseOutHandler), false);
//				
				var mouseWheelEvent = 'onmousewheel' in window ? 'mousewheel' : 'DOMMouseScroll';
				Element.addEventListener(this, mouseWheelEvent, Delegate.create(this, mouseWheelHandler), false);
				
				
//				Element.addEventListener(this.ownerDocument, "keydown", Delegate.create(this, keyDownHandler), false);
//				Element.addEventListener(this.ownerDocument, "keyup", Delegate.create(this, keyUpHandler), false);
				
			}
			
			Element.addEventListener(window, 'resize', Delegate.create(this, windowResizeHandler), false);
			
			// end constructor
		}
		
		
		
		
		
		
		
		
		// prototype
		
		Class.extend(Container, ScrollView);
		
		_parent = Class.getParent(ScrollView);

		
		/**
		 * position scroller method identifier
		 * @field SCROLLER_METHOD_POSITION
		 * @return {String} position
		 */
		ScrollView.SCROLLER_METHOD_POSITION = "position";
		
		/**
		 * transform scroller method identifier
		 * @field SCROLLER_METHOD_TRANSFORM
		 * @return {String} transform
		 */
		ScrollView.SCROLLER_METHOD_TRANSFORM = "transform"; 
		
		/**
		 * transform3d scroller method identifier
		 * @field SCROLLER_METHOD_TRANSFORM_3D
		 * @return {String} transform3d
		 */
		ScrollView.SCROLLER_METHOD_TRANSFORM_3D = "transform3d"; 
		
		/**
		 * overflow scroller method identifier
		 * @field SCROLLER_METHOD_OVERFLOW
		 * @return {String} overflow
		 */
		ScrollView.SCROLLER_METHOD_OVERFLOW = "overflow"; 

		function updateScrollerMethod() {
			//console.log("update scroller method");
			this.contentElem.style.position = "relative";
			var scrollerMethod = this.getScrollerMethod(); 
			switch (scrollerMethod) {
				case ScrollView.SCROLLER_METHOD_OVERFLOW: 
					this.contentElem.style.WebkitOverflowScrolling = "touch";
					this.contentElem.style.overflow = "auto";
					this.contentElem.style.minWidth = "";
					this.contentElem.style.minHeight = "";
					this.contentElem.style.width = "100%";
					this.contentElem.style.height = "100%";
					break;
				default: 
					
					this.contentElem.style.overflow = "visible";
					this.contentElem.style.minWidth = "";
					this.contentElem.style.minHeight = "";
					this.contentElem.style.width = "100%";
					this.contentElem.style.height = "100%";
					break;
			}
		}
		
		function isNativeTouchScrolling() {
			
			var scrollerMethod = this.getScrollerMethod();
			if (scrollerMethod == ScrollView.SCROLLER_METHOD_OVERFLOW) {
				if (!this.getPaging()) {
					var overflowScrollStyle = CSS.getVendorStyle('overflow-scrolling', true);
					if (overflowScrollStyle) {
						var overflowScrolling = Element.getComputedStyle(this.contentElem, overflowScrollStyle);
						return overflowScrolling == "touch";
					}
				}
			}
			return false;
		}
		
		function getPageAt(p) {
			
			if (p.x == 0 && p.y == 0) {
				return 1;
			}
			
			var s = getScrollPosInBounds.call(this, p.x, p.y);

			var clw, clh, cw, ch, cols, rows, col, row;

			var cs = this.getContentSize();
			cw = cs.width;
			ch = cs.height;
			
			var cls = this.getClientSize();
			clw = cls.width;
			clh = cls.height;
			//
			if (clw > 0 && clh > 0 && (cw > clw || ch > clh)) {
				
				if (cw <= clw) {
					return Math.floor(s.y / clh) + 1;
				} else if (ch <= clh){
					return Math.floor(s.x / clw) + 1;
				} else {
					cols = Math.ceil(cw / clw);
					rows = Math.ceil(ch / clh);
					col = Math.floor(s.x / clw);
					row = Math.floor(s.y / clh);
					p = row * cols + col + 1;
				}
				
				return p;
			}

			return 1;
		}
		
		function getScrollPositionAtPage(page) {
			
			if (page <= 1) {
				return {x: 0, y: 0}
			}
			var cls = this.getClientSize();
			var clw = cls.width;
			var clh = cls.height
			
			var cs = this.getContentSize();
			var cw = cs.width;
			var ch = cs.height;
			
			sw = cw - clw;
			sh = ch - clh;
			
			if (page > this.getPages()) {
				return {x: sw, y: sh}
			}
			
			var cols = Math.ceil(cw / clw);
			
			var px = (page - 1) % cols;
			var py = Math.floor((page - 1) / cols);
			
			var x = px * clw;
			var y = py * clh;
			
			x = x < sw ? x : sw;
			y = y < sh ? y : sh;
			
			x = x < 0 ? 0 : x;
			y = y < 0 ? 0 : y;
			
			return {x: Math.floor(x), y: Math.floor(y)}
			
		}

		function getScrollPosInBounds(sx, sy) {
			
			var nx = sx;
			var ny = sy;
			
			var paging = this.getPaging();
		
			var cls = this.getClientSize();
			var clw = cls.width;
			var clh = cls.height;
			
			var cs = this.getContentSize();
			var sw = cs.width - clw;
			var sh = cs.height - clh;

			if (paging) {

				var px = Math.floor(sx / clw) * clw;
				nx = sx - px >= px + clw - sx ? px + clw : px;
				
				
				var py = Math.floor(sy / clh) * clh;
				ny = sy - py >= py + clh - sy ? py + clh : py;
			}
			
			nx = nx <= 0 ? 0 : nx > sw ? sw : nx;
			ny = ny <= 0 ? 0 : ny > sh ? sh : ny;
			
			return {x: nx, y: ny}
		}
		
		
		
		function updateDisplayedItems() {
			
			var displayManagement = this.getDisplayManagement();
			
			if (displayManagement == "auto" && this.getPaging()) {
				
				console.log('update displayed items');
				
				var p = this.getPage() - 1;
				var s = this.getScrollPosition();
				var cls = this.getClientSize();
				var ss = this.getScrollSize();
				
				for (var i = 0; i < this.size(); i++) {
					var item = this.get(i);
					
					if (item.style) {
						var w = Element.getWidth(item);
						var h = Element.getHeight(item);
		
						if (i > p - 2 && i < p + 2) {
//							item.style.visibility = 'visible';
							item.style.display = '';
						} else {
//							item.style.visibility = 'hidden';
							item.style.display = 'none';
						}
					}
					
					
					
				}
			} else {
				for (var i = 0; i < this.size(); i++) {
					var item = this.get(i);
					if (item.style) {
						item.style.display = '';
					}
				}
			}
			
		}
		
		
		
		
		/**
		 * specifies the bouncing distance. defaults to 30.
		 * @property bounceDistance
		 * @return {Number} value in pixels
		 */
		ScrollView.prototype.bounceDistance = 30;
		
		/**
		 * specifies whether scrolling should bounce.
		 * @property bounces
		 * @return {Boolean} true or false
		 */
		ScrollView.prototype.bounces = false;
		
		ScrollView.prototype._createChildren = function() {
			_parent._createChildren.apply(this, arguments);
		}
		
		ScrollView.prototype._initialize = function() {
			_parent._initialize.apply(this, arguments);
			updateScrollerMethod.call(this);
		}
		
		ScrollView.prototype._update = function() {
			
			_parent._update.apply(this, arguments);
			
//			this.style.paddingLeft = "";
//			this.style.paddingTop = "";
//			this.style.paddingRight = "";
//			this.style.paddingBottom = "";
//			
//			var p = Element.getBorderMetrics(this, 'padding');
//			console.log("PPPPPP", this, p);
//			
			this.contentElem.style.WebkitBoxSizing = "border-box";
			this.contentElem.style.MozBoxSizing = "border-box";
//			this.contentElem.style.paddingLeft = p.left + "px";
//			this.contentElem.style.paddingTop = p.top + "px";
//			this.contentElem.style.paddingRight = p.right + "px";
//			this.contentElem.style.paddingBottom = p.bottom + "px";
//			this.style.padding = "0";
			
			
			
			updateDisplayedItems.call(this);
		}
		
		
		ScrollView.prototype.getScrollSize = function() {
			var cls = this.getClientSize();
			var cs = this.getContentSize();
			var sw = cs.width - cls.width;
			var sh = cs.height - cls.height;
			sw = sw > 0 ? sw : 0;
			sh = sh > 0 ? sh : 0;
			return {
				width: sw, 
				height: sh
			}
		}
		
		ScrollView.prototype.getPages = function() {
			var s = this.getScrollPosition();
			var cs = this.getContentSize();
			var cls = this.getClientSize();
			var px = Math.ceil(cs.width / cls.width);
			var py = Math.ceil(cs.height / cls.height);
			return px * py;
		}
		
		ScrollView.prototype.scrollToPage = function (page, duration) {		

			var currentPage = this.getPage();

			console.log("scroll to page: ", page, ", current: ", currentPage, duration);
			
			var d = duration >= 0 ? duration : 0.25;
			
			var p = getScrollPositionAtPage.call(this, page);
			
			var s = this.getScrollPosition();
			
			if (p.x != s.x || p.y != s.y) {
				if (d == 0) {
					
					this.setScrollPosition(p.x, p.y);
				} else {
					
					if (Math.abs(page - currentPage) == 1) {
						console.log("page is next, animate: ", page, d, p.x, p.y);
						this.scrollTo(p.x, p.y, d);
					} else {
						console.log("page is not next, not animate: ", page, d);
						this.setScrollPosition(p.x, p.y);
					}
				}
				
			}
			
		}
		
		return ScrollView;
	
	})());
	
})();
(function() {
	
	var Class = benignware.core.Class;
	var Event = Class.require('benignware.core.Event'); 
	var Element = Class.require('benignware.core.Element'); 
	var StringUtils = Class.require('benignware.util.StringUtils'); 
	var Loader = Class.require('benignware.core.Loader'); 
	
	var ImageLoader = Class.require('benignware.util.ImageLoader'); 
	
	var ActivityView = Class.require('benignware.view.ActivityView'); 
	var ScrollView = Class.require('benignware.view.ScrollView'); 
	
	
	// private class
	var PageWrap;
	
	
	/**
	 * not yet implemented.
	 * @class ListView
	 */
	var WebView = Class('benignware.view.WebView', (function() {
		
		var _parent;
		
		function WebView() {
			
			var __parent = _parent.apply(this, arguments);
			
			var webView = this;
			
			var _pageWrap = false;
			
			
			this.getPageWrap = function() {
				return _pageWrap;
			}
			
			this.setPageWrap = function(bool) {
				bool = StringUtils.toBoolean(bool);
				if (bool != _pageWrap) {
					_pageWrap = bool;
					this.invalidate();
				}
			}
			
			this.getPageWrap = function() {
				return _pageWrap;
			}
			
			var loader = new Loader();
			var imageLoader = new ImageLoader();
			this.complete = true;
			
			webView.addEventListener('itemadded', function(event) {
				imageLoader.add(event.item);
			});
			
			webView.addEventListener('itemremoved', function(event) {
				imageLoader.remove(event.item);
			});
			
			imageLoader.onloadstart = function(event) {
				webView.contentElem.style.display = "";
				var activityView  = webView.activityView;
				activityView.setStatus(ActivityView.STATUS_PROGRESS, webView.loadingText);
				activityView.show();
			}
			
			imageLoader.oncomplete = function(event) {
				var activityView  = webView.activityView;
				if (loader.complete) {
					complete.call(webView);
				}
			}
			
			function complete() {
				var activityView  = this.activityView;
				activityView.hide();
				this.contentElem.style.display = "";
				this.invalidate();
				this.complete = true;
				this.dispatchEvent(Event.create(this.ownerDocument, 'complete', false, false));
				this.dispatchEvent(Event.create(this.ownerDocument, 'contentcomplete', false, false));
			}
			
			function error() {
				var activityView  = this.activityView;
				activityView.setStatus(ActivityView.STATUS_ERROR, this.errorText);
				this.complete = true;
				this.dispatchEvent(Event.create(this.ownerDocument, 'complete', false, false));
				this.dispatchEvent(Event.create(this.ownerDocument, 'contentcomplete', false, false));
				
			}
			
			this.load = function(url, options) {
				var activityView  = webView.activityView;
				options = options || {};
				var successCallback = options.success;
				var errorCallback = options.error;
				options.type = options.type || Loader.TYPE_HTML;
				options.success = function(event) {
					var html = event.data.body.innerHTML;
					// TODO: remove old style
					var cssName = event.data.body.className;
					webView.addCSSName(cssName);
					webView.setHtml(html);
					if (imageLoader.isComplete()) {
						complete.call(webView);
					}
					if (successCallback) successCallback(event);
				}
				options.error = function(event) {
					error.call(webView);
					if (errorCallback) errorCallback(event);
				}
//				loader.oncomplete = function(event) {
					
//					console.log("LOAD COMPLETE", loader.data);
					
					//webView.setHTML(event.data);
					
					// TODO: check for images to load
					//webView.dispatchEvent(Event.create(this.ownerDocument, 'complete', false, false));
//				}
				
				this.complete = false;
				this.contentElem.style.display = "none";
				activityView.setStatus(ActivityView.STATUS_PROGRESS, webView.loadingText);
				activityView.show();
				loader.load(url, options);
				return loader;
			}
		}
		
		Class.extend(ScrollView, WebView);
		_parent = Class.getParent(WebView);
		
		/**
		 * reference to the webview's activity view
		 * @property activityView
		 * @return {benignware.view.ActivityView} activityView the activity view element
		 */
		WebView.prototype.activityView = null;
		
		function initNestedViews() {
			for (var i = 0; i < this.size(); i++) {
				var item = this.get(i);
				if (item.nodeType == 1) {
					if (!Class.instanceOf(item, ScrollView)) {
						Element.initialize(item, ScrollView);
						
//						item.setScrollerMethod(ScrollView.SCROLLER_METHOD_TRANSFORM);
						console.log("set scroll method: ", item.getScrollerMethod());
					}
					item.style.width = "100%";
					item.style.height = "100%";
				}
				
			}
			
		}
		
		WebView.prototype._initialize = function() {
			_parent._initialize.apply(this, arguments);
			//this.pagingEnabled = true;
//			this.setScrollerMethod(ScrollView.SCROLLER_METHOD_OVERFLOW);
			//this.setLayout('horizontal-client-fit');
			this.setDisplayManagement(false);
		}
		
		WebView.prototype._createChildren = function() {
			_parent._createChildren.apply(this, arguments);
			var activityView = Element.create(this.ownerDocument, ActivityView);
			activityView.hide();
			this.appendChild(activityView);
			this.activityView = activityView;
		}
		
		WebView.prototype._update = function() {

			
			if (this.getPageWrap()) {
				layoutPageWrap.call(this);
			} else {
				initNestedViews.call(this);
			}
			//
			
//			_parent._update.apply(this, arguments);
//
//			var pageWrap = this.getPageWrap();
//			if (pageWrap && __private.pageWrapObj && __private.pageWrapObj.pages.length > 0) {
//				if (!layout || layout == ScrollContainer.NONE) {
//					return ScrollContainer.AUTO;
//				}
//			}
			
			
			_parent._update.apply(this, arguments);
			
			
			this.activityView.invalidate();
			
		}
		
		/**
		 * sets the loading message of the component's activity view
		 * @property loadingText
		 * @return {String} the message to be displayed
		 */
		WebView.prototype.loadingText = 'Loading...';
		
		/**
		 * sets the error message of the component's activity view
		 * @property errorText
		 * @return {String} the message to be displayed
		 */
		WebView.prototype.errorText = 'An error occured.';

		
		WebView.prototype._pageWrapObject = null;
		
		WebView.prototype.add = function(item, index) {
//			console.log("add item to page view: ", item, index, this._pageWrapObject);
			if (this._pageWrapObject) {
				this._pageWrapObject.restore();
			}
			_parent.add.call(this, item, index);
		}
		
		 function layoutPageWrap() {
			
			var pageWrap = this.getPageWrap();
			var pageWrapObject = this._pageWrapObject;
			
			var cls = this.getClientSize();
			var clw = cls.width;
			var clh = cls.height;
			
			var layout = this.getLayout();
			
//			var hap = this.getHorizontalAlign();
//			var vap = this.getVerticalAlign();
			
			if (pageWrap == true) {
				
				if (!pageWrapObject) {
					this._pageWrapObject = pageWrapObject = new PageWrap(this.contentElem);
				}
				
				pageWrapObject.pageWidth = clw;
				pageWrapObject.pageHeight = clh;
				
				// do the page wrap
				var pages = pageWrapObject.update();
				
				if (pages.length > 0) {
					//
					for (var i = 0; i < pages.length; i++) {
						this.contentElem.appendChild(pages[i]);
					}
					// use pages as layout items
					// apply horizontal layout and top alignment
//					layout = layout != ScrollContainer.NONE ? layout : ScrollContainer.AUTO;
//					vap = ScrollContainer.TOP;
					this.contentElem.className = "";
				}
				
			} else if (pageWrapObject) {
				pageWrapObject.restore();
			}
			
//			__super.layoutContent.call(this);
		}
		
		return WebView;
		
	})());
	
	
	
	
	
	/**
	 * private class PageWrap
	 */
	
	
	PageWrap = (function() {

		
		var Element = benignware.core.Element;
		
		
		function PageWrap(content) {
			this.content = content;
			this.pages = [];
		}
		
		PageWrap.prototype.content = null;
		PageWrap.prototype.pages;
		PageWrap.prototype.pageWidth = 0;
		PageWrap.prototype.pageHeight = 0;
		PageWrap.prototype.originalItems = null;

		var currentParent;
		var currentPage;
		var currentPageHeight;
		
		var currentElement;
		var lastElement;
		
		var content;
		
		var pageWidth;
		var pageHeight;
		var pages;
		
		var currentPageFragment;
		var contentFragment;
		var currentPageHeight = 0;
		var pageFragments = null;
		
		var breakBeforeElements = {
			'header': 'always'
		}
		
		var breakAfterElements = {
			'header': 'never'
		}
		
		var breakInsideElements = {
			'header': 'never'
		}
		
		
		PageWrap.MIN_PAGE_HEIGHT = 100;
		
		function processRestore(parent, items) {
			parent.innerHTML = "";
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var node = item.node;
				if (node.nodeType == 1) {
					if (node.__originalStyleHeight) {
						node.style.height = node.__originalStyleHeight;
						delete node.__originalStyleHeight;
					}
					if (node.__originalElement) {
						delete node.__originalElement;
					}
					processRestore(node, item.children);
				} else if (node.nodeType == 3) {
					node.nodeValue = item.value;
				}
				parent.appendChild(node);
			}
		}
		
		PageWrap.prototype.restore = function() {
			console.log("****** RESTORE", this.content.parentNode);
			if (!this.originalItems) {
				return;
			}
//					var content = this.content;
			// clear content
			this.content.innerHTML = "";
			
			processRestore(this.content, this.originalItems);
			
			this.originalItems = null;
			
		}
		
		function getItems(element, rec) {
			var items = [];
			for (var i = 0; i < element.childNodes.length; i++) {
				var child = element.childNodes[i];
				var item = {
					node: child
				}
				if (child.nodeType == 1) {
					item.children = rec ? getItems(child, rec) : [];
				} else if (child.nodeType == 3) {
					item.value = child.nodeValue.toString();
				}
				items.push(item);
			}
			return items;
		}
		
		var level = 0;
		var pageCreated = false;
		
		// end page
		
		function endPage() {
			
			if (pageCreated) {
				var page = content.cloneNode(false);
				page.__originalNode = content;
//				var page = document.createElement("div");
//				page.setAttribute("class", "contentLayerPage");
				page.removeAttribute("id");
				var p = Element.getBorderMetrics(page, 'padding');
				page.style.width = pageWidth + "px";
				page.style.height = pageHeight + "px";
				page.style.overflow = "";
//				
//				page.style.width = "100%";
				for (var i = 0; i < content.childNodes.length; i++) {
					page.appendChild(content.childNodes[i--]);
				}
				
//				console.log("END PAGE AT ", page);
				pages.push(page);
				pageCreated = false;
				currentPage = page;
				
			}
			
		}
		
		// create page
		function createPage() {
			
			console.log("CREATE PAGE!!!!!!!!!!!!", currentParent);
//			console.time("CREATE PAGE");

			var ancestors = [];
			
			if (currentParent) {
				var parent = currentParent;
				while(parent && parent != content) {
//					console.log("ADD ANCESTOR: ", parent);
					ancestors.push(parent);
					parent = parent.parentNode;
				}
			}
			
			endPage();
			
			pageCreated = true;

			currentParent = content;
			
			for (var a = ancestors.length - 1; a >= 0; a--) {
				var ancestorClone = ancestors[a].cloneNode(false);
				ancestorClone.__originalNode = ancestors[a];
//				console.log("CREATE PAGE: ancestorClone", ancestorClone);
				currentParent.appendChild(ancestorClone);
				currentParent = ancestorClone;
			}
			
//					console.log("CREATE PAGE", currentParent);
//					
//					for (var i = 0; i < addAfterBreak.length; i++) {
//						currentParent.appendChild(addAfterBreak[i]);
//					}
			
			// reset
			
//			console.timeEnd("CREATE PAGE");
			
			currentPageHeight = 0;
			
			return currentParent;
		}
		
		
		// main
		function processChildren(element, level) {
			
			// save items
			var items = [];
			for (var i = 0; i < element.childNodes.length; i++) {
				var child = element.childNodes[i];
				items.push(child);
			}
			
			// clear content
			element.innerHTML = "";

			// process children
			var lastIndex = 0;
			var lastChild = null;
			
			for (var i = 0; i < items.length; i++) {
				var child = items[i];
//				child.style.width = "auto";
//				child.style.height = "auto";
//				
				var p = contentPadding;
				var beforeHeight = Element.getOuterHeight(content) - p.top - p.bottom;
				var breakPage = false;
				
				if (child.nodeType == 3 && !StringUtils.trim(child.nodeValue)) {
//					console.log("EMPTY TEXTNODE");
					continue;
				}
//				console.time("PROCESS CHILD");
//				console.log("PROCESS CHILD", child);
				
				
				
				if (child.nodeType == 1) {
					
					
					// include only static and relative
//					if (Element.getComputedStyle(child, 'position') != 'relative' 
//						|| Element.getComputedStyle(child, 'position') != 'static') {
//						continue;
//					}
					

					// break before
					
					
					if (breakBeforeElements[child.nodeName.toLowerCase()] == "always") {
//						alert("BREAK BEFORE" + currentPage + " - ");
						
						if (content.childNodes.length > 0) {
							
							var firstChild = DOM.getDeepestFirstChild(content);
//							console.log("CREATE BREAK BEFORE PAGE", child, firstChild == currentParent);
							if (firstChild && firstChild != currentParent) {
								createPage();
							}
						}
					} else {
						
						for (var x in breakBeforeElements) {
							var elements = child.getElementsByTagName(x);
							if (elements.length) {
								// has break before children
//								console.log("BREAK BEFORE CHILDREN: ", x);
								breakPage = true;
							}
						}
						
					}
				}
				
				
				// add child
				currentParent.appendChild(child);
				
				if (!breakPage) {
					// height testing
					
					// process percent height
//					if (child.nodeType == 1) {
//						if (child.style.height.indexOf("%") > 0) {
//							if (child.offsetParent == content) {
//								var elemHeight = parseInt(child.style.height) / 100 * pageHeight;
//								child.__originalStyleHeight = child.style.height;
//								Element.setHeight(child, elemHeight);
//							}
//						}
//					}
					
					
					
					var height = content.scrollHeight - p.top - p.bottom;
//					console.timeEnd("ELEMENT HEIGHT TESTING");
					console.log("PROCESS CHILD: ", level, i, " >> ", child, "HEIGHT: ", height, "PAGE HEIGHT: ", pageHeight);
					
//					if (child.__originalStyleHeight && height >= pageHeight) {
//						if (beforeHeight > 0) {
//							currentParent.removeChild(child);
//							createPage();
//							i--;
//							lastChild = null;
//						} else {
//							createPage();
//						}
//						continue;
//					}
					
					
					if (height > pageHeight) {
						console.log("BREAK AT ", child);
						breakPage = true;
					}
					
					if (height == pageHeight) {
						createPage();
						continue;
					}

				}
				
				
				if (breakPage) {
					
					// handle break
					
					// break inside
//					if (breakInsideElements[child.nodeName.toLowerCase()] == "never") {
////						console.log("BREAK INSIDE");
//						currentParent.removeChild(child);
//						createPage();
//						currentParent.appendChild(child);
//						continue;
//					}
//
//					// break after
//					if (lastChild && content.childNodes.length > 1 && 
//							breakAfterElements[lastChild.nodeName.toLowerCase()] == "never") {
////						console.log("BREAK AFTER", child, currentParent, content.childNodes.length);
//						createPage();
//						currentParent.appendChild(lastChild);
//						i--;
//						lastChild = null;
//						continue;
//					}
					
					if (child.nodeType == 1) {
						var breakingElement = child;
						// element break
//						console.log("BREAKING ELEMENT: ", child.nodeName, child.getAttribute ? child.getAttribute('class') : "", height, pageHeight);
						
						if (child.nodeName.toLowerCase() == "img" 
							|| child.nodeName.toLowerCase() == "iframe") {
//							createPage();
//							currentParent.appendChild(child);
						} else if (child.nodeName.toLowerCase() == "br") {
//							createPage();
						} else {
//							console.log("PROCESS CHILDREN");
//							console.time("PROCESS CHILDREN");
							currentParent = child;
							processChildren(child, level + 1);
//							console.timeEnd("PROCESS CHILDREN");
						}

					} else if (child.nodeType == 3) {
						// text break
						console.time("PROCESS TEXT");
						
						processText2(child);
						
//						
//						console.timeEnd("PROCESS TEXT");
					}
					
				} else {
					// fits
//					console.log("FITS!!!");
					if (child.nodeType == 1 || child.nodeType == 3) {
						lastChild = child;
						lastIndex = i;
					}
					
				}
//				console.timeEnd("PROCESS CHILD");
			}
			if (level > 0) {
				// move to parent node
				currentParent = currentParent.parentNode;
			}
			
			
		}
		
		
		function processText1(child) {
			
			currentParent.removeChild(child);
			
			var p = contentPadding;
			var words = child.nodeValue.split(/\s+/);

			var textNode = document.createTextNode("");
			textNode.__originalNode = child;
			currentParent.appendChild(textNode);
			
//			console.log("PROCESS WORDS", words);
			// process text
			var text = "";
			var c = 0;
			
			for (var w = 0; w < words.length; w++) {
				c++
				var word = words[w];
				var lastText = text;				
				text+= word;
				
				if (text && w < words.length - 1) {
					 text+=" ";
				}
				
				
				textNode.nodeValue = text;
				height = content.scrollHeight - p.top - p.bottom;
				if (w < 10) {
//					console.log("MEASURE TEXT HEIGHT", w, word, height, pageHeight);
				}
//				
				if (height >= pageHeight) {
					
//					console.log("BREAKING WORD: ", w, word, " LAST TEXT: ", lastText);
					textNode.nodeValue = lastText;		
					createPage();					
					textNode = document.createTextNode("");
					textNode.__originalNode = child;
					currentParent.appendChild(textNode);
					text = "";
					// start over from last element
//					console.log("START OVER FROM LAST WORD: ", w);
					
					
//					if (w > 1) {
//						w = w - 1;
//					}
					
				 }
				
				if (c > 200) break;
			} 
		}
		
		
	function processText2(child) {
			
			currentParent.removeChild(child);
			
			var p = contentPadding;
			var words = child.nodeValue.split(" ");

//			console.log("PROCESS WORDS", words);
			// process text
			
			var a = 0, b = 0;
			var rest = "";
			var s;
			
			do {
				
				
				
				a++
				if (a > 100) {
					console.log("!!!!!!!!!!!!! INFINITE LOOP A");
					break;
				}
				//
				
				var textNode = document.createTextNode("");
				textNode.__originalNode = child;
				currentParent.appendChild(textNode);
				
				var min = 0;
				var max = words.length - 1;
				s = max;
//				console.log("**** FIND NEXT BREAK", words.length);
				
				var breakText = false;
				
				breakingWord = "";
				
				do {
					
					
					b++
					if (b > 200) {
						console.log("!!!!!!!!!!!! INFINITE LOOP B");
						break;
					}
					//
					
					
					
					var parts = words.slice(0, s + 1);
					var text = parts.join(" ");
					
					textNode.nodeValue = text;
					
//					console.log("*** TEST WORD LEN: ", words.length, " S: ", s, "MIN: ", min, "MAX", max, text);
					

					
					height = content.scrollHeight - p.top - p.bottom;
//					console.log("HEIGHT: ", height, " = ", pageHeight);

					if (height > pageHeight) {
						
//							console.log("TOO BIG", s, min, max, height);
//							textNode.nodeValue = text;		
//							createPage();					
//							textNode = document.createTextNode("");
//							textNode.__originalNode = child;
//							currentParent.appendChild(textNode);
						
//							breakText = true;
//							break;
						
						
						if (max - min <= 1) {
//							console.log("TOO BIG BREAKING WORD IS AT ", s, text, height);
							textNode.nodeValue = s > 0 ? words.slice(0, s - 1).join(" ") : "";
//							console.log("TOO BIG BREAKING WORD IS AT ", textNode.nodeValue);
							breakText = true;
							break;
						}
						max = s;
					 } else if (height < pageHeight) {
//						console.log("TOO SMALL", s, min, max, height);
						min = s;
						if (s == max) {
							break;
						}
						if (max - min <= 1) {
//							console.log("TOO SMALL BREAKING WORD IS AT ", s, text, words[s]);
							textNode.nodeValue = words.slice(0, s - 1).join(" ");
//							textNode.nodeValue+= text;
							breakText = true;
							break;
						}
					 } else if (height == pageHeight) {
						 breakText = true;
						 break;
					 }
					
					
					

					s = min + Math.floor((max - min) / 2);
					
					
					
				} while(!breakText && max > 0);
				
				console.log("END LOOP B", s);
				if (breakText) {
					
//					console.log("BREAKING WORD IS AT ", s, text, words[s]);
					
					words = words.slice(s + 1);
					
					createPage();		
					
					
				} else {
					break;
				}
				
				
			} while (words.length > 0);
			
			
		}
		
	
	function ceil(n) {
		var f = (n << 0),
	    f = f == n ? f : f + 1;
		return f;
//		return Math.ceil(x);
//		var n = Math.abs(x);
//		var f = (n << 0),
//		f = f == n ? f : f + 1;
//		return f;
//		return parseInt (Math.abs (x)) + 1
	}
		
		PageWrap.prototype.update = function() {
			console.time("PageWrap", this.content);
			var ws = this.content.style.width;
			var hs = this.content.style.height;
			var ls = this.content.style.left;
			var ts = this.content.style.top;
			var ps = this.content.style.position;
			var os = this.content.style.overflow;
			//
//			this.content.style.overflow = "hidden";
//			this.content.style.position = "static";
//			this.content.style.left = "0px";
//			this.content.style.top = "0px";
//			this.content.style.width = "100%";
//			this.content.style.height = "100%";
			
			this.content.style.width = "auto";
			this.content.style.height = "auto";
			this.content.style.overflow = "visible";
			
			this.pages = [];
			
			if (this.originalItems) {
				this.restore();
//				console.log("RETURN");
//				this.content.style.height = hs;
//				this.content.style.left = ls;
//				this.content.style.top = ts;
//				this.content.style.position = ps;
//				return [];
			}
			this.originalItems = getItems(this.content, true);
			// setup private variables
			content = this.content;
			
			currentParent = null;
			currentPage = null;
			
			currentPageHeight = 0;
			
			pages = [];
			
			var p = Element.getBorderMetrics(content, 'padding');
			contentPadding = p;
			pageWidth = this.pageWidth - p.left - p.right;
			pageHeight = this.pageHeight - p.top - p.bottom;
//					pageHeight = this.pageHeight;
			pageHeight = pageHeight > PageWrap.MIN_PAGE_HEIGHT ? pageHeight : PageWrap.MIN_PAGE_HEIGHT;
//			console.log("****** PAGE HEIGHT: " + pageHeight);
			console.log("****** PAGEWRAP EXECUTE: ", this.content, pageHeight, Element.getHeight(content));
			currentPageFragment = null;
			pageFragments = [];
			
			// create first page
			
			createPage();
			// start processing
			processChildren(this.content, 0);
			// add rest page
			endPage();
			
			console.log("PAGES: ", pages);
			
			//
			this.pages = pages;
			this.content.style.width = ws;
			this.content.style.height = hs;
			this.content.style.left = ls;
			this.content.style.top = ts;
			this.content.style.position = ps;
			this.content.style.overflow = os;
			console.timeEnd("PageWrap");
			return pages;
		}
		
		return PageWrap;
	})();
	
	
	return WebView;
})();
(function() {
	
	var Class = benignware.core.Class;
	var Event = Class.require('benignware.core.Event');
	var StringUtils = Class.require('benignware.util.StringUtils');
	var Component = Class.require('benignware.core.Component'); 
	var Element = Class.require('benignware.core.Element'); 
	var CSS = Class.require('benignware.util.CSS'); 
	var ItemLayout = Class.require('benignware.layout.ItemLayout'); 
	var ScrollView = Class.require('benignware.view.ScrollView'); 
	
	CSS.setDefaultStyle('.benignware-view-PageControl', 'position', 'relative');
	CSS.setDefaultStyle('.benignware-view-PageControl', 'text-align', 'center');
//	CSS.setDefaultStyle('.benignware-view-PageControl', 'min-height', '28px');
	
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'display', 'inline-block');
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'margin', '10px 3px');
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'width', '8px');
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'height', '8px');
//	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'border', '1px solid #1b1b1b');
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'border-radius', '4px');
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'background', '#9a9a9a');
//	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'cursor', 'pointer');
	
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator.selected', 'background', '#efefef');
	
	
	var pushEvent = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
	/**
	 * not yet implemented.
	 * @class benignware.view.PageControl
	 */
	return Class('benignware.view.PageControl', (function() {
		
		var _parent;
		
		function PageControl() {
			var __parent = _parent.apply(this, arguments);
			
			var pageControl = this;
			
			var _pages = 0;
			var _page = 1;
			var _pageIndicatorElements;
			
			var _selectable = false;
			
			var _view = null;
			
			
			this.setPages = function(pages) {
				_pages = pages;
				updatePages.call(this);
			}
			
			this.getPages = function() {
				return _pages;
			}
			
			this.setPage = function(page) {
				if (page != _page) {
					_page = page;
					updatePage.call(this);
				}
			}
			
			this.getPage = function() {
				return _page;
			}
			
			this.setSelectable = function(bool) {
				_selectable = StringUtils.toBoolean(bool);
				updatePages.call(this);
			}
			
			this.isSelectable = function() {
				return _selectable;
			}
			
			function itemChangeHandler(event) {
				updateView.call(pageControl, event.target);
			}
			
			function pageHandler(event) {
				updateView.call(pageControl, event.target);
			}
			
			function positionHandler(event) {
				updateView.call(pageControl, event.target);
			}
			
			
			function updateView(view) {
				if (view.size) {
					_pages = view.size();
					updatePages.call(this);
				}
				if (view.getPage) {
					_page = view.getPage();
					updatePage.call(this);
				} else if (view.getPosition) {
					_page = view.getPosition() + 1;
					updatePage.call(this);
				}
				
			}
			
			this.setView = function(view) {
				
				view = typeof view == 'string' ? document.getElementById(view) : view;
				console.log("set view", view);
				if (view != _view) {
					if (_view) {
						view.removeEventListener('itemchange', itemChangeHandler);
						view.removeEventListener('page', pageHandler);
						view.removeEventListener('position', positionHandler);
					}
					_view = view;
					if (view != null) {
						view.addEventListener('itemchange', itemChangeHandler);
						view.addEventListener('page', pageHandler);
						view.addEventListener('position', positionHandler);
						updateView.call(this, view);
					}
				}
			}
			
			this.getView = function() {
				return _view;
			}
			
			this.getPage = function() {
				return _page;
			}
			
			
		}
		
		Class.extend(Component, PageControl)
		_parent = Class.getParent(PageControl);
		
		PageControl.prototype.scrollView = null;
		
		PageControl.prototype._initialize = function() {
			_parent._initialize.apply(this, arguments);
		}
		
		PageControl.prototype._createChildren = function() {
			_parent._createChildren.apply(this, arguments);
		}
		
		PageControl.prototype._update = function() {
			_parent._update.apply(this, arguments);
//			var layout = new ItemLayout();
//			layout.element = this;
//			layout.orientation = "horizontal";
//			layout.perform();
		}
		
		function updatePage() {
			var page = this.getPage();
			for (var i = 0; i < this.childNodes.length; i++) {
				var pageIndicatorElem = this.childNodes[i];
				if (i == page - 1) {
					Element.addCSSName(pageIndicatorElem, 'selected');
				} else {
					Element.removeCSSName(pageIndicatorElem, 'selected');
				}
			}
		}
		
		function select() {
			var view = this.getView();
			if (view) {
				var page = this.getPage();
				if (view.scrollToPage) {
					view.scrollToPage(page);
				} else if (view.setPage) {
					view.setPage(page);
				} else if (view.setPosition) {
					view.setPosition(page - 1);
				}
			}
			this.dispatchEvent(Event.create(this.ownerDocument, 'select', false, false));
		}
		
		function updatePages() {
			var pageControl = this;
			this.innerHTML = "";
			var pages = this.getPages();
			for (var i = 0; i < pages; i++) {
				var pageIndicatorElem = this.ownerDocument.createElement('div');
				pageIndicatorElem.className = "page-indicator";
				(function() {
					var index = i;
					pageIndicatorElem.addEventListener(pushEvent, function(event) {
						if (pageControl.isSelectable()) {
							pageControl.setPage(index + 1);
							select.call(pageControl);
						}
					}, false);
				})();
				console.log("this.isSelectable(): ", this.isSelectable());
				pageIndicatorElem.style.cursor = this.isSelectable() ?  "pointer" : "";
				this.appendChild(pageIndicatorElem);
			}
			var clearElem = this.ownerDocument.createElement('div');
			clearElem.style.clear = "both";
			
			this.appendChild(clearElem);
			updatePage.call(this);
			this.invalidate();
		}
		
		return PageControl;
		
	})());

})();
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
