/**
 * Simple UploadControl Class with label and icon 
 * @class benignware.controls.UploadControl
 * @extends benignware.core.Component
 */
(function() {
	
	
	// import classes
	var Class = benignware.core.Class;
	var Element = Class.require("benignware.core.Element");
	var Event = Class.require("benignware.core.Event");
	var Delegate = Class.require("benignware.util.Delegate");
	var Component = Class.require("benignware.core.Component");
	var CSS = Class.require("benignware.util.CSS");
	var DOM = Class.require("benignware.util.DOM");
	var StringUtils = Class.require("benignware.util.StringUtils");
	
	// define parent class access
	var _parent;
	
	/**
	 * Constructs a new FileInput.
	 * @constructor
	 */
	
	
	
	function FileInput() {
		var __parent = _parent.call(this);
		console.log("FILEINPUT", this);	
	}
	
	Class.register("benignware.controls.FileInput", FileInput);
	
	
	CSS.setDefaultStyle(".fileInput.fileSelected .fileInputText", "color", "#999999");
	CSS.setDefaultStyle(".fileInput .fileInputText", "width", "240px");
	//CSS.setDefaultStyle(".fileInput .fileInputText", "width", "240px");
	CSS.setDefaultStyle(".fileInput .progressImage", "background-image", "url(" + Class.getPath(FileInput, "ajax-loader.gif") + ")");
	CSS.setDefaultStyle(".fileInput .progressImage", "background-repeat", "no-repeat");
	CSS.setDefaultStyle(".fileInput .progressImage", "background-position", "0px 0px");
	CSS.setDefaultStyle(".fileInput .progressImage", "width", "16px");
	CSS.setDefaultStyle(".fileInput .progressImage", "height", "16px");
	CSS.setDefaultStyle(".fileInput .progressImage", "top", "4px");
	CSS.setDefaultStyle(".fileInput .progressImage", "left", "2px");
	CSS.setDefaultStyle(".fileInput .fileInputText", "font-size", "12px");
	CSS.setDefaultStyle(".fileInput .fileInputText", "font-family", "Arial");
	//CSS.setDefaultStyle(".fileInput form", "display", "inline");
	//CSS.setDefaultStyle(".fileInput form", "text-align", "left");
	
	// extend
	FileInput = Class.extend(Component, FileInput);
	// get super
	_parent = Class.getParent(FileInput);
	// constants
	FileInput.FILE_PARAM = "file";
	FileInput.BASE_URL = "baseURL";
	
	FileInput.prototype.__params = [];
	FileInput.prototype.__waitForUpload = false;
	
	FileInput.prototype.setParam = function(name, value) {
		if (name != this.getFileParam()) {
			this.__params[name] = value;
			var form = this.__form;
			var found = false;
			for (var i = 0; i < form.elements.length; i++) {	
				if (form.elements[i].name == name) {
					form.elements[i].value == value;
					found = true;
				}
			}
			if (!found) {
				var input = form.ownerDocument.createElement("input");
				input.setAttribute("type", "hidden");
				input.name = name;
				input.value = value;
				form.appendChild(input);
			}
		}
	}
	
	FileInput.prototype.__fileParamName = FileInput.FILE_PARAM;

	FileInput.prototype.setFileParam = function(paramName) {
		this.__actionParamName = paramName;
	}
	
	FileInput.prototype.getFileParam = function() {
		return this.__fileParamName;
	}

	FileInput.prototype.__action = "";
	
	FileInput.prototype.setAction = function(action) {
		this.__action = action;
	}
	
	FileInput.prototype.getAction = function() {
		return this.__action;
	}
	
	FileInput.prototype.getParam = function(name) {
		return this.__params[name];
	}
	
	function createFileInput() {
		var fileInput = this.ownerDocument.createElement("input");
		fileInput.setAttribute("type", "file");
		fileInput.className = "fileInputText";
		fileInput.setAttribute("name", "file");
		fileInput.style.position = "absolute";
		fileInput.style.right = "0px";
		fileInput.style.opacity = "0";
		fileInput.style.filter = "alpha(opacity = 0)";
		//fileInput.style.border = "3px solid red";
		fileInput.style.zIndex = "10";
		//
		Element.addEventListener(fileInput, "change", Delegate.create(this, function(event) {
			Event.normalize(event);
			event.stopPropagation();
			this.__currentValue = this.inputElem.value;
			this.__waitForUpload = true;
			
			this.inputElem.value = fileInput.value;
			this.addCSSName("fileSelected");
			this.__browseButton.style.display = "none";
			this.__submitButton.style.display = "";
			this.__submitButton.disabled = false;
			fileInput.style.display = "none";
			this.invalidate();
			return false;
		}), false);
		return fileInput;
	}
	
	FileInput.prototype.__currentValue = "";
	
	FileInput.prototype._createChildren = function() {
		_parent._createChildren.call(this);
		this.style.position = "relative";
		var form = this.ownerDocument.createElement("form");
		this.__form = form;
		
		form.setAttribute("enctype", "multipart/form-data");
		form.setAttribute("encoding", "multipart/form-data");
		form.setAttribute("method", "POST");
		form.style.margin = "0px";
		
		/*
		form.onsubmit = Delegate.create(this, function(event) {
			this.__submitButton.disabled = true;
			if (this.getAttribute("action")) {
				this.setAttribute("action", this.getAttribute("action"));
			}
			
			return false;
		});
		*/

		var progressImage = this.ownerDocument.createElement("div");
		progressImage.className = "progressImage";
		progressImage.style.position = "absolute";
		progressImage.style.display = "none";
		this.__progressImage = progressImage;
		this.appendChild(progressImage);
		this.__progressImage.style.zIndex = "1000";
		
		
		var input = this.ownerDocument.createElement("input");
		this.inputElem = input;
		input.className = "fileInputText";
		//input.style.width = "240px";
		input.style.position = "relative";
		//input.style.left = "0px";
		//input.style.top = "0px";
		
		Element.addEventListener(input, "change", Delegate.create(this, function(event) {
			Event.normalize(event);
			//event.stopPropagation();
			//if (hasChanged.call(this)) {
				triggerChange.call(this);
			//}
		}), false);
		
		Element.addEventListener(input, "paste", Delegate.create(this, function(event) {
			Event.normalize(event);
			console.log("trigger change");
			//event.stopPropagation();
			//if (hasChanged.call(this)) {
				triggerChange.call(this);
			//}
		}), false);
		
		var hasChangedDelegate = Delegate.create(this, function(event) {
				triggerChange.call(this);
		});
		
		//Element.addEventListener(input, "keydown", hasChangedDelegate, false);
		Element.addEventListener(input, "keyup", hasChangedDelegate, false);
		Element.addEventListener(input, "paste", hasChangedDelegate, false);
		
		input.style.zIndex = "10";
		
		var browseButton = this.ownerDocument.createElement("button");
		this.__browseButton = browseButton;
		browseButton.setAttribute("type", "button");
		browseButton.innerHTML = "Browse...";
		browseButton.style.display = "";
		//browseButton.style.zIndex = "5";
		
		var submit = this.ownerDocument.createElement("button");
		this.__submitButton = submit;
		submit.setAttribute("type", "submit");
		submit.innerHTML = "Upload";
		submit.style.display = "none";
		//submit.style.zIndex = "5";
		input.onmousedown = Delegate.create(this, function(){
			if (this.__waitForUpload) {
				this.inputElem.value = this.getValue();
				resetControls.call(this);
			}
		});
		//
		
		var iFrame = this.ownerDocument.createElement("iframe");
		
//		var id = DOM.generateId(this.ownerDocument, "uploadFrame");
		var id = "upload-frame" + new Date().getTime().toString(); 
		form.setAttribute("target", id);
		form.style.position = "relative";
		iFrame.setAttribute("id", id);
		iFrame.setAttribute("name", id);
		//iFrame.setAttribute("src", "");
		iFrame.style.display = "none";
		var uploadFlag = false;
		Element.addEventListener(iFrame, "load", Delegate.create(this, function(event) {
			//event = Event.getEvent(event);
			//event.stopPropagation();
			if (uploadFlag) {
				uploadFlag = false;
				if (iFrame.contentWindow.document == null) {
					// error
				}
				this.__submitButton.disabled = false;
				this.__progressImage.style.display = "none";
				this.removeCSSName("fileUploading");
				var response = iFrame.contentWindow.document.body.innerHTML;
				resetControls.call(this);
				var json = null;
				var url = "";
				if (StringUtils.isFile(response)) {
					// success
					var old = this.getValue();
					this.setValue(response);
					if (old != response) {
						triggerChange.call(this);
					}
					//alert(target.getValue());
				} else if (json = StringUtils.jsonDecode(response)){
					console.log('response is json');
				} else {
					//alert(StringUtils.trim(response));
					console.log('unknown data type');
				}
				
			}
			
		}), false);
		
		this.appendChild(iFrame);
		
		//this.appendChild(input);
		//this.appendChild(submit);
		
		/*
		var div = this.createElement("div");
		div.style.position = "absolute";
		div.style.left = "0px";
		div.style.top = "0px";
		
		this.appendChild(div);
		*/
		
		this.__fileInput = createFileInput.call(this);
		form.appendChild(this.__fileInput);
		form.appendChild(input);
		form.appendChild(browseButton);
		form.appendChild(submit);
		//form.style.zIndex = "100";
		form.style.position = "relative";
		form.style.left = "0px";
		form.style.top = "0px";
		form.style.display = "inline";
		
		Element.addEventListener(form, "submit", Delegate.create(this, function(event) {
			// upload
			Event.normalize(event);
			var fileInput = this.__fileInput;
			console.log("file input");
			if (fileInput.value) {
				
				fileInput.setAttribute("name", this.getFileParam());
				var onbeforeuploadEvent = Event.create('onbeforeupload', true, false);
				this.dispatchEvent(onbeforeuploadEvent);
				var action = this.getAction();
				this.__form.setAttribute('action', action);
				this.__progressImage.style.display = "";
				var spaceWidth = CSS.getTextSize(this.inputElem, "_").width;
				console.log("spaceWidth:" , spaceWidth);
				if (spaceWidth) {
					var inputHeight = this.inputElem.offsetHeight;
					var b = Element.getBorderMetrics(this.inputElem, 'padding', 'border', 'margin');
					var progressWidth = this.__progressImage.offsetWidth + b.left + 6;
					var f = Math.ceil( (progressWidth + b.left) / spaceWidth) + 1;
					var leftPad = "";
					for (var i = 0; i < f; i++) {
						leftPad += " ";
					}
					this.inputElem.value = leftPad + fileInput.value;
				}
				uploadFlag = true;
				submit.disabled = true;
				this.addCSSName("fileUploading");
			}
		}), false);
		
		this.appendChild(form);
		
		this.__form = form;
		this.addEventListener("losefocus", Delegate.create(this, function(event) {
//			if (this.__waitForUpload) {
//				this.inputElem.value = this.getValue();
//				resetControls.call(this);
//			}
		}))

		this.invalidate();
	}
	
	function resetControls() {
		var fileInput = createFileInput.call(this);
		this.__form.insertBefore(fileInput, this.__fileInput);
		this.__form.removeChild(this.__fileInput);
		this.__fileInput = fileInput;
		this.__browseButton.style.display = "inline";
		this.__submitButton.style.display = "none";
		this.__submitButton.disabled = true;
		fileInput.style.display = "";
		this.removeCSSName("fileSelected");
		this.removeCSSName("fileUploading");
		this.invalidate();
		this.__waitForUpload = false;
//		var oldValue = __super.getValue.call(this);
//		this.inputElem.value = oldValue;
	}
	
	function hasChanged() {
		var oldValue = __super.getValue.call(this);
		if (this.getValue() != oldValue) {
			this.setValue(this.getValue());
			return true;
		}
		return false;
	}
	
	function triggerChange() {
		var event = Event.create(this.ownerDocument, "change", true, true);
		this.dispatchEvent(event);
	}
	
	FileInput.prototype.setValue = function(value){
//		__super.setValue.call(this, value);
//		if (value != this.getValue()) {
//			var changeEvent = Event.create("change", true, false);
//			this.dispatchEvent(changeEvent);
//		}
		this.inputElem.value = value;
		Element.removeCSSName(this.inputElem, "fileSelected");
	}
	
	FileInput.prototype.getValue = function() {
		this.inputElem.value;
		return null;
	}
	
	
	FileInput.prototype.setBaseURL = function(baseURL) {
		this.setParam(FileInput.BASE_URL, baseURL);
	}
	
	FileInput.prototype.getBaseURL = function() {
		return this.getParam(FileInput.BASE_URL);
	}
	
	return FileInput;
})();