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