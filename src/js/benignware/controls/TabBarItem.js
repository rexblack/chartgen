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