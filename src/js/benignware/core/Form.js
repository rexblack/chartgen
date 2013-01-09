(function() {
	
	
	var Class = benignware.core.Class;
	var Event = Class.require("benignware.core.Event");
	var Element = Class.require("benignware.core.Element");
	var Loader = Class.require("benignware.core.Loader");
	var Component = Class.require("benignware.core.Component");
	
	
	var _parent;

	/**
	 * Ajax Form.
	 * @class Form
	 * @extends benignware.core.Component
	 */
	
	// constructor
	function Form(options) {
		var __parent = _parent.apply(this, arguments);
	}
	
	Class.register("benignware.core.Form", Form);
	
	Class.extend(Component, Form);
	_parent = Class.getParent(Form);
	
	Form.prototype.tagName = "form";
	
	Form.prototype._initialize = function() {
		_parent._initialize.call(this);
		var target = this;
		this.addEventListener("submit", function(event) {
			submitHandler.call(target, event);
		}, false);
	}
	
	Form.prototype.data = null;
	
	function submitHandler(event) {
		console.log("SUBMIT FORM, event:", event);
		if (!event.defaultPrevented) {
			load.call(this);
			event.preventDefault();
		}
	}
	
	Form.prototype.setAction = function(action) {
		this.setAttribute('action', action);
	}
	
	Form.prototype.getAction = function(action) {
		return this.getAttribute('action');
	}
	
	Form.prototype.setMethod = function(method) {
		this.setAttribute('method', method);
	}
	
	Form.prototype.getMethod = function(method) {
		return this.getAttribute('method');
	}
	
	Form.prototype.submit = function() {
		var event = this.createEvent('submit', false, false);
//		this.dispatchEvent(event);
		event.preventDefault();
		load.call(this);
	}
	
	function load() {
		var loader = new Loader();
		loader.method = this.getAttribute('method') || "GET";
		loader.variables = getVariables.call(this);
		loader.type = Loader.TYPE_JSON;
		console.log("loader.variables: ", loader.variables);
		var url = this.getAttribute('action');
		var target = this;
		loader.oncomplete = function(event) {
			console.log("LOADED: ", this.data);
			target.removeCSSName('loading');
			target.data = this.data;
			target.dispatchEvent(Event.create(this.ownerDocument, 'complete', false, false));
		}
		loader.onerror = function(event) {
			console.log("ERROR: ", this.data);
			target.removeCSSName('loading');
			target.addCSSName('error');
			target.data = this.data;
			target.dispatchEvent(Event.create(this.ownerDocument, 'error', false, false));
		}
		target.removeCSSName('error');
		target.addCSSName('loading');
		loader.load(url);
	}
	
	function getVariables() {
		var result = {}
		for (var i = 0; i < this.elements.length; i++) {
			var elem = this.elements[i];
			if (elem.name) {
				result[elem.name] = elem.value;
			}
		}
		return result;
	}
	
	
	/**
	 * sets a form variable
	 * @method setParam
	 * @param {String} name
	 * @param {String} value
	 */
	Form.prototype.setParam = function(name, value) {
		console.log("Form::setParam() ", name, value);
		var elem;
		var elems = this.elements;
		for (var i = 0; i < elems.length; i++) {
			if (elems[i].name == name) {
				elem = elems[i];
				break;
			}
		}
		if (!elem) {
			elem = this.ownerDocument.createElement('input');
			elem.setAttribute('type', 'hidden');
			elem.name = name;
			this.appendChild(elem);
		}
		elem.value = value;
	}
	
	/**
	 * gets the value of a form variable
	 * @method getParam
	 * @param {String} name
	 * @return {String} the value
	 */
	Form.prototype.getParam = function(name) {
		console.log("Form::getParam() ", name);
		return this.getParams()[name];
	}
	
	/**
	 * gets all form variables
	 * @method getParams
	 * @returns {Array} an object containing form variables
	 */
	Form.prototype.getParams = function() {
		console.log("Form::getParams()");
		var result = {};
		var elems = this.elements;
		for (var i = 0; i < elems.length; i++) {
			var elem = elems[i];
			var name = elem.name;
			var value = elem.value;
			
			if (typeof elem.type != "undefined" && elem.type == "checkbox") {
				// checkbox
				console.log("checkbox: ", elem, name, value);
				value = elem.checked ? value : "";
			}
			
			if (name) {
				console.log("param: ", elem, name, value);
				result[name] = value;
			}
		}
		console.log("result: ", result);
		return result;
	}
	
	

	return Form;
})();