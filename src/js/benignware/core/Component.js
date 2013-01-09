(function() {
	
	var Class = benignware.core.Class;
	var Event = Class.require('benignware.core.Event');
	var Element = Class.require('benignware.core.Element');
	var StringUtils = Class.require('benignware.util.StringUtils');
	var CSS = Class.require('benignware.util.CSS');
	
	var _parent;
	
//	CSS.setDefaultStyle(".benignware-core-Component.visible", "visibility", "visible");
//	CSS.setDefaultStyle(".benignware-core-Component.hidden", "visibility", "hidden");
//	CSS.setDefaultStyle(".benignware-core-Component.visible", "display", "");
	CSS.setDefaultStyle(".benignware-core-Component.hidden", "display", "none");
	
	/**
	 * Base ui component class.
	 * @package benignware.core
	 * @class Component
	 * @extends benignware.core.Element
	 */
	
	function Component() {
		
		// call the parent constructor
		var __parent = _parent.apply(this, arguments);

//		console.log("Component::constructor()");

		// private members
		var validatedSize = {width: 0, height: 0}
		
		// privileged methods
		
		/**
		 * validates the component
		 * @privileged
		 * @method validate
		 */
		this.validate = function() {
			var size = this.getSize();
			if (size.width != validatedSize.width || size.height != validatedSize.height) {
				this.invalidate();
				return false;
			}
			return true;
		}
		
		/**
		 * invalidates the component
		 * @method invalidate
		 */
		this.invalidate = function() {
			
			var size = this.getSize();
			this._update();
			if (size.width != validatedSize.width || size.height != validatedSize.height) {
				// resize
				this.dispatchEvent(Event.create(this.ownerDocument, 'resize', false, false));
			}
			validatedSize.width = size.width;
			validatedSize.height = size.height;
		}
		
	}
	
	
	
	Class.register('benignware.core.Component', Component);
	
	
	
	
	/**
	 * the delay after window resize in milliseconds. defaults to 25 milliseconds.
	 * @property resizeDelay
	 * @return {int} duration of the delay in milliseconds
	 */
	Component.prototype.resizeDelay = 50;
	
	
	/**
	 * called when the component has resized.
	 * @event resize
	 */
	
	
	/**
	 * constructs the component
	 * @protected
	 * @method _construct
	 */
	Component.prototype.__construct = function() {
		
//		console.log("Component::__construct(", arguments, ")", this);

		// setup component css selectors
		initCSSNames.call(this);
		
		var win = window;
		
		// event target
		var target = this;
		
		// init resize
		
		var resizeTimer = null;
		Element.addEventListener(win, "resize", function(event) {
			
			// use resize timeout id and cancel if called twice
			if (resizeTimer != null) {
				clearTimeout(resizeTimer);
				resizeTimer = null;
			}
			
			if (this.resizeDelay > 0) {
				resizeTimer = window.setTimeout(function() {
					target.validate();
				}, this.resizeDelay);
			} else {
				target.invalidate();
			}
			
			
		}, false);
		
		// clear out invalidate on construction phase
		var invalidate = this.invalidate;
		this.invalidate = function() {}
		
		
		// create children
		this._createChildren();

//		// init dataset
		var dataset = Element.getDataset(this);
		for (var x in dataset) {
			Class.callSetter(this, x, dataset[x]);
		}
		
		// init options
		
		
		// initialize
		this._initialize();
		
		this._initialized = true;
		
		/**
		 * dispatched when the component has been initialized.
		 * @event init
		 */
		this.dispatchEvent(Event.create(this.ownerDocument, 'init', false, false));
		
		// restore invalidate
		this.invalidate = invalidate;
		
		// invalidate
		this.invalidate();
		
		
	}
	

	/**
	 * implement this method to initialize the component. 
	 * @protected
	 * @method initialize
	 */
	Component.prototype._initialize = function(options) {
//		console.log("Component::_initialize(", options, ")");
	}
	
	/**
	 * implement this method to create children of the component.
	 * @protected
	 * @method createChildren
	 */
	Component.prototype._createChildren = function() {
//		console.log("Component::_createChildren()");
	}
	
	/**
	 * implement this method to update the component.
	 * @protected
	 * @method update
	 */
	Component.prototype._update = function() {
//		console.log("Component::_update()", this);
	}
	
	/**
	 * sets the position of the component relative to its offset parent.
	 * @method setPosition
	 * @param {Number} x the x-coordinate
	 * @param {Number} y the y-coordinate
	 */
	Component.prototype.setPosition = function(x, y) {
		this.style.left = x + "px";
		this.style.top = y + "px";
	}
	
	/**
	 * Retrieves the position of the component relative to its offset parent
	 * @method getPosition
	 * @return {Object} an object containing the x- and y-coordinate of the component.
	 */
	Component.prototype.getPosition = function() {
		var left = Element.getComputedStyle(this, 'left');
		var top = Element.getComputedStyle(this, 'top');
		return {
			x: parseInt(left), 
			y: parseInt(top)
		}
	}
	
	/**
	 * sets the size of the component.
	 * @method setSize
	 * @param {Number} width the width of the component in pixels
	 * @param {Number} height the height of the component in pixels
	 */
	Component.prototype.setSize = function(width, height) {
		Element.setSize(this, width, height);
		this.validateSize();
	}
	
	/**
	 * Retrieves width and height of the component.
	 * @method getSize
	 * @return {Object} An Object containing the width and height of the component.
	 */
	Component.prototype.getSize = function() {
		return Element.getSize(this);
	}
	
	/**
	 * sets width of the component.
	 * @method setWidth
	 * @param {Number} width the width of the component in pixels
	 */
	Component.prototype.setWidth = function(width) {
		Element.setWidth(this, width);
		this.validateSize();
	}
	
	/**
	 * gets width of the component.
	 * @method getWidth
	 * @param {Element} element
	 * @return {Number} width the width of the component in pixels
	 */
	Component.prototype.getWidth = function() {
		return Element.getWidth(this);
	}
	
	/**
	 * sets height of the component.
	 * @method setHeight
	 * @param {Number} height the height of the component in pixels
	 */
	Component.prototype.setHeight = function(height) {
		Element.setHeight(this, height);
		this.validateSize();
	}
	
	/**
	 * gets height of the component
	 * @method getHeight
	 * @return {Number} height the height of the component in pixels
	 */
	Component.prototype.getHeight = function() {
		return Element.getHeight(this);
	}
	
	/**
	 * adds a css selector to the component.
	 * @method addCSSName
	 * @param {String} string a css selector
	 */
	Component.prototype.addCSSName = function(string) {
		Element.addCSSName(this, string);
	}
	
	/**
	 * removes the specified css selector from the component.
	 * @method removeCSSName
	 * @param {String} string a css selector
	 */
	Component.prototype.removeCSSName = function(string) {
		Element.removeCSSName(this, string);
	}
	
	/**
	 * retrieves all css selectors of the component.
	 * @method getCSSNames
	 * @return {Array} an array containing css selectors
	 */
	Component.prototype.getCSSNames = function() {
		return Element.getCSSNames(this);
	}
	
	/**
	 * checks whether the component contains the specified css selector.
	 * @method hasCSSName
	 * @return {Boolean} true, if the component contains the css selector.
	 */
	Component.prototype.hasCSSName = function(element, string) {
		return Element.hasCSSName(this, string);
	}
	
	
	/**
	 * toggles the specified css selector on the element.
	 * @method toggleCSSName
	 * @param {String} string the css selector
	 */
	Component.prototype.toggleCSSName = function(string){
		Element.toggleCSSName(this, string);
	}
	
	/**
	 * shows the component by adding 'visible' css selector. 
	 * by default 'visibility' style is used.
	 * @method show
	 */
	Component.prototype.show = function() {
		if (this.isHidden()) {
			this.removeCSSName('hidden');
			this.invalidate();
			this.dispatchEvent(Event.create(this.ownerDocument, 'show', false, false));
		}
	}
	
	/**
	 * hides the component by adding 'hidden' css selector. 
	 * by default 'visibility' style is used
	 * @method hide
	 */
	Component.prototype.hide = function() {
		if (!this.isHidden()) {
			this.addCSSName('hidden');
			this.dispatchEvent(Event.create(this.ownerDocument, 'hide', false, false));
		}
	}
	
	Component.prototype.toggleVisibility = function() {
		if (this.isHidden()) {
			this.show();
		} else {
			this.hide();
		}
	}
	
	Component.prototype.setHidden = function(bool){
		bool = StringUtils.toBoolean(bool);
		if (bool) {
			this.hide();
		} else {
			this.show();
		}
	}
	
	Component.prototype.isHidden = function() {
		return Element.hasCSSName(this, 'hidden');
	}
	
	
	
	
	function initCSSNames() {
		var clazz = Class.getClass(this);
		var parentClasses = Class.getParentClasses(clazz);
		parentClasses.reverse();
		for (var i = 0; i < parentClasses.length; i++) {
			var parentClass = parentClasses[i];
			if (Class.isSubClassOf(parentClass, Element)) {
				var qualifiedName = Class.getQualifiedName(parentClass);
				if (qualifiedName) {
					var cssName = qualifiedName.replace(/\./g, "-");
					this.addCSSName(cssName);
				}
			}
		}
		var qualifiedName = Class.getQualifiedName(clazz);
		if (qualifiedName) {
			var cssName = qualifiedName.replace(/\./g, "-");
			this.addCSSName(cssName);
		}
		
	}
	
	/**
	 * sets a style on component.
	 * @method setStyle
	 * @param {String} name
	 * @param {String} value
	 */
	Component.prototype.setStyle = function(name, value) {
		this.style[name] = value;
	}
	
	/**
	 * gets a style of component.
	 * @method getStyle
	 * @param {String} name
	 * @return {String} the computed style value
	 */
	Component.prototype.getStyle = function(name, value) {
		return Element.getComputedStyle(name);
	}

	Class.extend(Element, Component);
	_parent = Class.getParent(Component);
	
	return Component;
})();