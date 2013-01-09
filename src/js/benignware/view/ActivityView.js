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