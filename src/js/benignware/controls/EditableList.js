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