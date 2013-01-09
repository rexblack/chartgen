(function() {
	
	var Class = benignware.core.Class;
	
	var Event = Class.require('benignware.core.Event');
	var StringUtils = Class.require('benignware.util.StringUtils');
	var Element = Class.require('benignware.core.Element');
	var Component = Class.require('benignware.core.Component');
	var Layout = Class.require('benignware.core.Layout');
	
	var CSS = Class.require('benignware.util.CSS');
	
	var _parent;
	
//	CSS.setDefaultStyle(".benignware-core-Container .contentLayer", "width", "100%");
//	CSS.setDefaultStyle(".benignware-core-Container .contentLayer", "height", "100%");
	
	// private static helper methods
	
	function trim(string) {
		if (string) {
			string = string.replace(/^(?:\s+|\n+)|(?:\s+|\n+)$/gm, '');
			return string;
		}
		return "";
	}
	
	function contains(array, value) {
		for (var i = 0; i < array.length; i++) if (array[i] == value) return true;
		return false;
	}
	
	/**
	 * Base ui container class
	 * @package benignware.core
	 * @class Container
	 * @extends benignware.core.Component
	 */
	
	function Container() {
		
		var __parent = _parent.apply(this, arguments);
		
		var _layout = null;
		var layoutHorizontalAlign = null;
		var layoutVerticalAlign = null;
		var layoutOrientation = null;
		
		/**
		 * gets the layout object of this component.
		 * @privileged
		 * @method getLayout
		 * @return {benignware.core.Layout} the layout object
		 */
		
		this.getLayout = function() {
			return _layout;
		}
		
		/**
		 * sets the layout object on this component.
		 * @privileged
		 * @method setLayout
		 * @param {benignware.core.Layout} layout
		 */
		this.setLayout = function(layout) {
			
			var prevLayout = _layout;
			_layout = typeof layout == "string" ? Layout.get(layout) : layout;
//			console.log("Container::setLayout(", layout, ")", _layout);
			if (_layout) {
				_layout.element = this;
				if (prevLayout) {
					_layout.horizontalAlign = prevLayout.horizontalAlign;
					_layout.verticalAlign = prevLayout.horizontalAlign;
				} else {
					_layout.horizontalAlign = layoutHorizontalAlign;
					_layout.verticalAlign = layoutVerticalAlign;
				}
				this.validate();
			}
			
		}

		
		
		/**
		 * sets the layout alignment
		 * @privileged
		 * @method setLayoutAlignment
		 * @param {String} string comma-separated align identifiers
		 */
		this.setLayoutAlignment = function(string) {
			var split = string.split(/\s*,\s*/);
			var h = split[0];
			var v = split[1];
			layoutHorizontalAlign = h;
			layoutVerticalAlign = v;
			var layout = this.getLayout();
			if (layout) {
				layout.horizontalAlign = h;
				layout.verticalAlign = v;
				this.invalidate();
			}
		}
		
		/**
		 * gets the layout alignment
		 * @privileged
		 * @method getLayoutAlignment
		 * @return {Object} an object containing horizontalAlign and verticalAlign properties
		 */
		this.getLayoutAlignment = function() {
			return {
				horizontalAlign: layout ? layout.horizontalAlign : layoutHorizontalAlign, 
				verticalAlign: layout ? layout.verticalAlign : layoutVerticalAlign
			}
		}
		
		
		/**
		 * sets the layout orientation
		 * @privileged
		 * @method setLayoutOrientation
		 * @param {String} the orientation identifier
		 */
		this.setLayoutOrientation = function(string) {
			layoutOrientation = string;
			if (this.getLayout()) {
				layout.orientation = layoutOrientation;
				this.invalidate();
			}
		}
		
		/**
		 * gets the layout orientation
		 * @privileged
		 * @method getLayoutOrientation
		 * @return {String} the orientation identifier
		 */
		this.getLayoutOrientation = function() {
			if (this.getLayout()) {
				return layout.orientation;
			}
			return layoutOrientation;
		}
		
		var contentSize = null;
		var validatedContentSize = {width: 0, height: 0}
		
		/**
		 * retrieves the content size
		 * @privileged
		 * @method getContentSize
		 * @return {Object} size
		 */
		this.getContentSize = function() {
			if (contentSize) {
				return contentSize;
			}
			if (validatedContentSize && validatedContentSize.width > 0 && validatedContentSize.height > 0) {
				return validatedContentSize;
			}
			validatedContentSize = measureContentSize.call(this);
			return validatedContentSize;
		}
		
		/**
		 * sets the content size
		 * @privileged
		 * @method setContentSize
		 * @param {Number} width
		 * @param {Number} height
		 */
		this.setContentSize = function(width, height) {
			if (width >= 0 && height >= 0) {
				contentSize = contentSize || {};
				contentSize.width = width;
				contentSize.height = height;
			} else {
				contentSize = null;
			}
			this.invalidate();
		}
		
		/**
		 * validates the container
		 * @privileged
		 * @method validate
		 * @return {Boolean} true if the container's layout is still valid.
		 */
		this.validate = function() {
			var valid = __parent.validate.call(this);
			if (valid) {
				var contentSize = measureContentSize.call(this);
				if (contentSize.width != validatedContentSize.width || contentSize.height != validatedContentSize.height) {
					this.invalidate();
					return true;
				}
			}
			return false;
		}
		
		/**
		 * invalidates the container
		 * @privileged
		 * @method invalidate
		 */
		
		this.invalidate = function() {
			
//			console.log("Container::invalidate()");
			
			__parent.invalidate.call(this);

			for (var i = 0; i < this.size(); i++) {
				var item = this.get(i);
				if (item.invalidate) {
					item.invalidate();
				}
			}
			
			var contentSize = measureContentSize.call(this);
			validatedContentSize.width = contentSize.width;
			validatedContentSize.height = contentSize.height;
			/**
			 * dispatched when the container has been layouted.
			 * @event layout
			 */
			var event = Event.create(this.ownerDocument, 'layout', false, false);
			this.dispatchEvent(event);

		}
		
	}
	
	function measureContentSize() {
//		console.log("measure content size");
		var layout = this.getLayout();
		if (layout && layout.getContentSize) {
			return layout.getContentSize();
		}
		return getDefaultContentSize.call(this);
	}
	
	function getDefaultContentSize() {
		//console.time("getDefaultContentSize");
		var overflow = Element.getComputedStyle(this, 'overflow');
		var os = this.contentElem.style.overflow;
		if (overflow != 'scroll' && overflow != 'auto') {
			this.contentElem.style.overflow = "auto";
		}
		var cw = this.contentElem.scrollWidth;
		var ch = this.contentElem.scrollHeight;
		this.contentElem.style.overflow = os;
		//console.timeEnd("getDefaultContentSize result: " + cw + ", " + ch);
		
		return {
			width: cw, 
			height: ch
		}
	}
	
	/**
	 * the container's content layer element.
	 * @property contentElem
	 * @return {Element} the content layer element.
	 */
	Container.prototype.contentElem = null;
	
	Container.prototype._createChildren = function() {
//		console.log("Container::_createChildren()");
		
		_parent._createChildren.apply(this, arguments);
		
		var children = [];
		
		if (this.innerHTML) {
			for (var i = 0; i < this.childNodes.length; i++) {
				children.push(this.childNodes[i]);
			}
		}
		
		this.contentElem = Element.create(this.ownerDocument, 'div');
		
		/*
		 * this.contentElem.style.position = "relative";
		this.contentElem.style.minWidth = "100%";
		this.contentElem.style.minHeight = "100%";*/
		this.contentElem.className = "content-layer";
		this.appendChild(this.contentElem);
		
		this.addAll(children);
	}
	
	
	// item collection implementation
	
	function isItem(item) {
		return item.nodeType == 1
			&& !contains(["br", "script", "link", "map"], item.nodeName.toUpperCase()) 
			|| item.nodeType == 3 && trim(item.nodeValue);
	}
	
	function getItems() {
		if (!this.contentElem) return 0;
		var items = [];
		for (var i = 0; i < this.contentElem.childNodes.length; i++) {
			var item = this.contentElem.childNodes[i];
			if (isItem(item)) {
				items.push(item);
			}
		}
		return items;
	}
	
	Container.prototype.add = function(item, index) {
//		console.log("Container::add" + item + " at " + index + " node type: " + item.nodeType);
		if (item.nodeType == 11) {
			// fragment
			var collection = [];
			for (var i = 0; i < item.childNodes.length; i++) {
				collection.push(item.childNodes[i]);
			}
			this.addAll(collection, index);
			return;
		}
		if (isItem(item)) {
			var before = this.get(index);
			if (before) {
				this.contentElem.insertBefore(item, before);
			} else {
				this.contentElem.appendChild(item);
			}
			var itemAddedEvent = Event.create(this.ownerDocument, 'itemadded', false, false);
			itemAddedEvent.item = item;
			this.dispatchEvent(itemAddedEvent);
			var itemChangeEvent = Event.create(this.ownerDocument, 'itemchange', false, false);
			itemChangeEvent.item = item;
			this.dispatchEvent(itemChangeEvent);
			
			if (!arguments.callee.all) {
				this.invalidate();
			}
		}
	}
	
	Container.prototype.addAll = function(collection, index) {
//		console.log("Container::addAll()", this.className, collection, index);
		index = typeof(index) == "number" ? index : this.size();
		var c = 0;
		this.add.all = true;
		for (var i = index; i < index + collection.length; i++) {
			var insert = collection[c++];
			this.add(insert, i);
		}
		this.add.all = false;
		this.invalidate();
	}
	
	Container.prototype.remove = function(item) {
//		console.log("Container::remove() ", item);
		item = typeof item == "number" ? this.get(item) : item;
		for (var i = 0; i < this.size(); i++) {
			var child = this.get(i);
			if (item == child) {
				if (item.removeAll) {
					item.removeAll();
				} else {
					item.innerHTML = "";
				}
				this.contentElem.removeChild(item);
				var itemRemovedEvent = Event.create(this.ownerDocument, 'itemremoved', false, false);
				itemRemovedEvent.item = item;
				this.dispatchEvent(itemRemovedEvent);
				var itemChangeEvent = Event.create(this.ownerDocument, 'itemchange', false, false);
				itemChangeEvent.item = item;
				this.dispatchEvent(itemChangeEvent);
				break;
			}
		}
		
		if (!arguments.callee.all) {
			this.invalidate();
		}
		return;
	}
	
	Container.prototype.removeAll = function() {
//		console.log("Container::removeAll()", this.className);
		this.remove.all = true;
		for (var i = 0; i < this.size(); i++) {
			var item = this.get(i);
			this.remove(item);
			i--;
		}
		this.remove.all = false;
		this.invalidate();
	}
	
	
	Container.prototype.setHtml = function(html) {
		this.removeAll();
		var div = this.ownerDocument.createElement('div');
		div.innerHTML = html;
		var children = [];
		var contentDisplayStyle =  this.contentElem.style.display;
		var displayInlineStyles = [];
		
		
		for (var i = 0; i < div.childNodes.length; i++) {
			var child = div.childNodes[i];
			if (child.style) {
				displayInlineStyles[i] = child.style.display;
			}
			if (child.nodeType == 1 || child.nodeType == 3 && StringUtils.trim(child.nodeValue)) {
				children.push(child);
			}
		}
		
		this.addAll(children);

		// display all children for execute scripts
		this.contentElem.style.display = "";
		
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.style) {
				displayInlineStyles[i] = child.style.display;
				child.style.display = '';
			}
		}
		
		if (this.executeScripts) {
			var scripts = this.contentElem.getElementsByTagName('script');
			for (var i = 0; i < scripts.length; i++) {
				var script = scripts[i];
				(function() {
					var s = script.innerHTML;
//					window.setTimeout(function() {
					try {
						eval(s);
					} catch(e) {
						console.warn(e);
					}
						
//					}, 1);
				})();

			}
		}
		
		
		// restore display children for execute scripts
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.style) {
				child.style.display = displayInlineStyles[i];
			}
		}

		this.contentElem.style.display = contentDisplayStyle;
	}
	
	Container.prototype.getHtml = function(html) {
		return this.contentElem.innerHTML;
	}
	
	Container.prototype.size = function() {
		return getItems.call(this).length;
	}
	
	Container.prototype.get = function(index) {
		var items = getItems.call(this);
		return items[index];
	}
	
	Container.prototype.indexOf = function(item) {
		for (var i = 0; i < this.size(); i++) {
			if (this.get(i) == item) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * gets the client size of the component.
	 * @method getClientSize
	 * @return {Object} an object containing width and height properties 
	 */
	Container.prototype.getClientSize = function() {
		var result = {
			width: this.clientWidth, 
			height: this.clientHeight
		}
		return result;
	}

	/**
	 * updates the container.
	 * @protected
	 * @method update
	 */
	Container.prototype._update = function() {

		_parent._update.apply(this, arguments);
		
		var layout = this.getLayout();
		
		if (layout && layout.perform) {
			layout.perform();
		}
		
//		var contentSize = this.getContentSize();
		
	}
	
	Class.register('benignware.core.Container', Container);
	Class.extend(Component, Container);
	_parent = Class.getParent(Container);
	
	/**
	 * specifies whether scripts shall be executed on setHmtl. defaults to false.
	 * @property executeScripts
	 * @return {Boolean} a boolean value 
	 */
	Container.prototype.executeScripts = false;
	
	return Container;
	
})();