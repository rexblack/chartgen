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