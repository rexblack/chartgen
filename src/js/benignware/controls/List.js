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