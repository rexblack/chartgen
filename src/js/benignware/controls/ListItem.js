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