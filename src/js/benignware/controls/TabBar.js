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