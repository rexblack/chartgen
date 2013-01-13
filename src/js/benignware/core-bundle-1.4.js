(function() {
	
	
	if (!window.console) {
		window.console = {
			log: function() {}, 
			info: function() {}, 
			error: function() {}, 
			warn: function() {}, 
			time: function() {}, 
			timeEnd: function() {}
		}
	}
	
	/**
	 * the core package in the framework
	 * @package benignware.core
	 */
	
	// helper functions
	
	// trim whitespace
	function trim(str) {
		return str.replace(/^\s+/,"").replace(/\s+$/,"");
	}
	
	// returns cross browser http request
	function getXMLHttpRequest() {
		return typeof XMLHttpRequest != undefined ? new XMLHttpRequest() : typeof ActiveXObject != undefined ? new ActiveXObject('Microsoft.XMLHTTP') : null; 
	}
	
	/**
	 * oop-implementation.<br/><br/>
	 * Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.<br/>
	 * 
	 * Javascript is no classical object-oriented language. it's prototype-based. 
	 * And one should not tweak the language too much for what it's not intended. 
	 * but at least for modularization and encapsulation purposes the oop-concept provides a lot of useful aspects to keep your code clean and abstract. 
	 * 
	 * 
	 * <h3>Inheritance</h3>
	 * 
	 * <h4>Prototype-based methods</h4>
	 * 
	 * 
	 * 
	 * <h4>Privileged methods</h4>
	 * 
	 * 
	 * 
	 * <h4>Protected methods</h4>
	 * In classical oop, protected methods are methods that are only visible to the defining class and its subclasses and cannot be called from another scope.  
	 * Although there exist several possibilities to emulate this pattern in javascript, the cost is not really justified.
	 * In practice it's just a matter of knowing, that means documentation, which methods should only be called from within the class context.  
	 * It's recommended to follow a common convention and denote those methods with a leading underscore. 
	 * 
	 * 
	 * <h4>Example: A common class</h4>
	 * <pre>
	 * // closure
	 * (function() {
	 * 
	 * 	// class imports
	 * 	var Class = benignware.core.Class;
	 * 	var Event = Class.require('benignware.core.Event');
	 * 	var EventDispatcher = Class.require('benignware.core.EventDispatcher');
	 * 
	 * 	// constructor
	 * 	function MyObject() {
	 * 	
	 * 		// private property
	 * 		var property = 0;
	 * 	
	 * 		// privileged methods
	 * 		this.setProperty = function(value) {
	 * 			property = value;
	 * 		}
	 * 		this.getProperty = function() {
	 * 			return property;
	 * 		}
	 * 	}
	 * 
	 * 	// setup inheritance
	 * 	Class.extend(EventDispatcher, MyObject);
	 * 
	 * 	// private static property
	 * 	var property = 'property';
	 * 
	 * 	// public static property 
	 * 	MyObject.FIELD = "field";
	 * 
	 * 	// public method
	 * 	MyObject.prototype.method = function(value) {
	 * 		
	 * 		// call private method
	 * 		method.call(this, value);
	 * 
	 * 		// dispatch an event
	 * 		var event = new Event('methodcalled', false, false);
	 * 		this.dispatchEvent(event);
	 * 	}
	 * 
	 * 	// private method 
	 * 	function method() {
	 * 		// method implementation
	 * 	}
	 * 
	 * 	// public property 
	 * 	MyObject.prototype.property = 'property';
	 * 
	 * 	// register class
	 * 	Class.register('mycompany.MyObject', MyObject);
	 * 
	 *	})();
	 * 
	 * // instantiate
	 * var myObject = new mycompany.MyObject();
	 * console.log(myObject);
	 * 
	 * </pre>
	 * 
	 * 
	 * @class Class
	 */

	function Class(qualifiedName, parent, clazz, prototype) {
		return Class.create.apply(this, arguments);
	}
	
	function getClassArguments(qualifiedName, parent, clazz, prototype) {
		
		// find arguments
		var _qualifiedName, _parent, _clazz, _prototype, _options;
		var functions = [];
		for (var i = 0; i < arguments.length; i++) {
			
			var arg = arguments[i];
			
			if (typeof arg == "string") {
				var argClass = Class.getClass(arg)
				if (!argClass) {
					_qualifiedName = arg;
				} else {
					_parent = argClass;
				}
			}
			
			if (typeof arg == "function") {
				functions.push(arg);
			}
			
			if (typeof arg == "object") {
				_prototype = arg;
			}
			
		}
		
		if (functions.length == 1) {
			_clazz = functions[0];
		} else {
			_parent = _parent ? _parent : functions[0];
			_clazz = functions[1];
		}
		
		
		
		return {
			qualifiedName: _qualifiedName, 
			parent: _parent, 
			clazz: _clazz, 
			prototype: _prototype
		}
	}
	
	/**
	 * creates a new class and registers it to the specified qualified name.
	 * @static
	 * @method create
	 * @param {String} qualifiedName
	 * @param {benignware.core.Class} parent the parent class
	 * @param {benignware.core.Class} clazz the inheriting class
	 * @return {benignware.core.Class} the new class
	 */
	Class.create = function(qualifiedName, parent, clazz, prototype) {
		
		var args = getClassArguments.apply(this, arguments);
		qualifiedName = args.qualifiedName;
		
//		console.log("Class:create", qualifiedName, clazz, args);

		if (args.parent && args.clazz) {
			clazz = Class.extend(args.parent, args.clazz, args.prototype);
		} else {
			clazz  = args.clazz;
		}
		

		// register class
		if (qualifiedName) {
			Class.register(qualifiedName, clazz);
		}
		return clazz;
	}

	
	function ProtectedDelegate(name, method, visibility) {
		
		var message = "protected method was called from outside the class context.";
		
		function delegate() {
			if (Class.isExposedCall(this)) {
				if (visibility == 'strict') {
					throw new Error(message);
					return;
				} else if (visibility == 'warn') {
					console.warn(message);
				}
			}
			return method.apply(this, arguments);
		}
		delegate.__protected = method;
		return delegate;
	}
	
	/**
	 * setup class inheritance. 
	 * <code>(function() {
	 * 
	 * 	var Class = benignware.core.Class;
	 * 	var EventDispatcher = Class.require('benignware.core.EventDispatcher');
	 * 	var _parent;
	 * 
	 * 	function MyClass() {
	 * 		_parent.apply(this, arguments);
	 * 	}
	 *	
	 * 	Class.extend(EventDispatcher, MyClass);
	 * 	_parent = Class.getParent(MyClass);
	 * 
	 * 	return MyClass;
	 * 
	 * })();
	 * </code>
	 * @static
	 * @method extend
	 * @param {benignware.core.Class} parent the parent class
	 * @param {benignware.core.Class} clazz the inheriting class
	 * @param {Object} prototype an object containing prototype methods
	 * @return {benignware.core.Class} the inheriting class
	 */
	
	Class.extend = function(parent, clazz, prototype) {
		
		var _clazz, _parent, _prototype;
		
//		console.log("Class::extend(" + parent + ", " + clazz + ")");
		
		// find arguments
		var args = getClassArguments.apply(this, arguments);
		clazz = args.clazz;
		parent = args.parent;
		prototype = args.prototype;
		
		if (!parent) {
			parent = function() {};
		}

		if (clazz == parent ) {
			throw new Error ('class cannot inherit from itself.');
		}

		// inject prototype members from arguments
		for (var name in prototype) {
			clazz.prototype[name] = prototype[name];
		}

		// copy superclass members
		for (var name in parent.prototype) {
			if (!clazz.prototype[name]) {
				clazz.prototype[name] = parent.prototype[name];
			}
		}
		
		// set __proto__
		
		
		
		
		clazz.prototype.constructor = clazz;
		
		clazz.prototype.__proto__ = parent.prototype;
		
		return clazz;
		
		
	}
	
	/**
	 * returns the parent class
	 * @static
	 * @method getParentClass
	 * @param {benignware.core.Class} clazz
	 * @return {benignware.core.Class} the parent class
	 */
	Class.getParentClass = function(clazz) {
		var parentClass = null;
		if (clazz) {
			if (clazz.prototype && clazz.prototype.__proto__) {
				parentClass = clazz.prototype.__proto__.constructor;
				
			}
		}
		return parentClass;
	}
	
	/**
	 * retrieves all parent classes of the specified class
	 * @static
	 * @method getParentClasses
	 * @param {benignware.core.Class} clazz the class
	 * @return {Array} an array containing parent classes
	 */
	Class.getParentClasses = function(clazz) {
		var parentClass = null;
		var parentClasses = [];
		while(parentClass = Class.getParentClass(clazz)) {
			parentClasses.push(parentClass);
			clazz = parentClass;
		}
		return parentClasses;
	}
	
	/**
	 * checks if the specified class is a subclass of another class
	 * @static
	 * @method isSubClassOf
	 * @param {benignware.core.Class} clazz the subclass
	 * @param {benignware.core.Class} parent the parent class
	 * @return {Boolean} true if clazz is subclass of the parent class
	 */
	Class.isSubClassOf = function(clazz, parent) {
//		console.log("Class::isSubClassOf(", clazz, parentClass, ")");
		var parentClasses = Class.getParentClasses(clazz);
		for (var i = 0; i < parentClasses.length; i++) {
			if (parentClasses[i] == parent) {
				return true;
			}
		}
		return false;
	}
	
	/**
	 * parent class access. 
	 * @static
	 * @method getParent
	 * @param {benignware.core.Class} clazz
	 * @return {Function} parent class access
	 */
	

	// prototype class for parent object
	function Parent() {}
	
	Class.getParent = function(clazz) {
		
		var constructor = clazz;
		
		var parentClass = Class.getParentClass(clazz);
	
		var parentObject = function parent() {

			var members = [];
			
			for (var x in constructor.prototype) {
				if (typeof(this[x]) == "function") {
					members[x] = this[x];
				}
			}
			
			parentClass.apply(this, arguments);
			
			var parent = {}
			for (var x in this) {
				if (typeof(this[x]) == "function") {
					if (this[x] != members[x]) {
						// privileged method
//						console.log('overload method', clazz, parentClass, x);
						parent[x] = this[x];
						parent[x].__overloaded = clazz;
					}
				}
			}
			return parent;
		}
		
		parentObject.prototype.__proto__ = Parent;
		
		for (var x in parentClass.prototype) {
			parentObject[x] = parentClass.prototype[x];
		}

	
		return parentObject;
	}
	
	/**
	 * checks if the specified object is an instance of the specified class
	 * @static
	 * @method instanceOf
	 * @param {Object} object
	 * @param {benignware.core.Class} clazz
	 */
	Class.instanceOf = function(object, clazz) {
//		console.log("Class:instanceOf(", object, clazz, ")");
		var constructor = Class.getClass(object);
		if (constructor == clazz || Class.isSubClassOf(constructor, clazz)) {
			return true;
		}
//		var constructor = clazz;
//		while (object != null) {
//			if (object == constructor.prototype)
//				return true;
//			object = Object.getPrototypeOf(object);
//		}
//		return false;
		return false;
	}
	
	
	/**
	 * checks if the calling method is on the class scope. 
	 * implement a protected method by executing it only if the call was protected. 
	 * <code>
	 * var MyClass = Class.create();
	 * MyClass.prototype.protectedMethod = function() {
	 * 	if (!isExposedCall(this, arguments)) return;
	 * }
	 * </code>
	 * Note that Class.isExposedCall also returns false, if the detection fails, i.e. if either Function.caller is unsupported, an instance method of the same class was called inside the class scope or the called method is _construct while the calling method is Object.initialize.
	 * @static
	 * @method isExposedCall
	 * @param {Object} object
	 */
	
	
	function callerName(func) {
		var str = String(func);
	    var array = str.split(" ");
	    array = array[1].split("(");
	    var name = array[0];
	    return name;
	}
	
	Class.isExposedCall = function(object, args) {
		args = args || arguments;
		
		var caller = args.callee.caller;
		if (typeof caller == 'undefined') {
			// unsupported
			return false;
		}
		// the calling method
//		
		caller = caller.caller;
		
//		console.log("Class::isExposedCall -->", caller, caller instanceof Parent, caller.__privileged_overload);
		
		if (caller == null) {
			// global scope
			return true;
		}
		
		var clazz = Class.getClass(object);
		
		if (caller == object.constructor) {
			return false;
		}
		
		if (caller.__overloaded) {
			// overloaded privileged method
			// check for parent class
			var parentClasses = Class.getParentClasses(clazz);
			parentClasses.push(clazz);
			for (var i = 0; i < parentClasses.length; i++) {
				var parentClass = parentClasses[i];
				if (caller.__overloaded == parentClass) {
					return false;
				}
			}
		}
		

		var exists = false;
		for (var x in clazz.prototype) {
			
			if (typeof object[x] == "function") {
				
//				console.log("check!", caller, object[x], x, object[x].method);
				
				if (caller == object[x] || object[x].prototype && object[x].prototype.__proto__ && caller == object[x].__protected) {
					// class method
					return false;
				}
			}
		}
		
		return true;
	}
	
	/**
	 * Creates the specified namespace on the native global window scope.
	 * @static
	 * @method namespace
	 * @param {String} namespace
	 */
	
	var namespaces = [];
	
	Class.namespace = function(namespace) {
//		console.log("Class::namespace(" + namespace + ")");
		// global namespace
		namespace = trim(namespace);
		var obj = window;
		if (!namespace) return obj;
		var nsArray = namespace.split(".");
		for (var i = 0; i < nsArray.length; i++) {
			if (i == nsArray.length - 1 && nsArray[i] == "*") continue;
			var name = nsArray[i];
			if (typeof(obj[name]) == "undefined") {
				obj[name] = {}
			}
			obj = obj[name];
		}
		// register namespace
		namespaces[namespace] = obj;
		return obj;
	}
	
	
	
	/**
	 * registers the class to the specified qualified name.
	 * @static
	 * @method register
	 * @param {String} qualifiedName the fully qualified classname
	 * @param {benignware.core.Class} clazz the clazz
	 * @return {benignware.core.Class} the class
	 */
	
	var classes = [];
	
	Class.register = function(qualifiedName, clazz) {
//		console.log("Class::register(", qualifiedName, ", ", clazz + ")");
		// register class
		classes[qualifiedName] = clazz;
		// namespace
		var parts = qualifiedName.split(".");
		var className = parts.pop();
		var namespace = parts.join('.');
		Class.namespace(namespace)[className] = clazz;
		
		return clazz;
	}
	
	/**
	  * retrieves qualified name for specified registered class
	  */
	Class.getQualifiedName = function(clazz) {
		
		// search registered classes
		for (var qualifiedName in classes) {
			
			if (classes[qualifiedName] == clazz) {
				return qualifiedName;
			}
		}
		// search registered namespaces
		for (var namespace in namespaces) {
			for (var className in namespaces[namespace]) {
				var obj = namespaces[namespace][className];
//				console.log("Class::getQualifiedName()", obj, clazz);
				if (obj == clazz) {
					return namespace + "." + className;
				}
			}
		}
		return null;
	}
	
	/**
	 * retrieves the short name of the specified class
	 * @param {benignware.core.Class} clazz
	 */
	Class.getName = function(clazz) {
		if (typeof(clazz) == "function") {
			
			// try qualified name
			var qualifiedName = Class.getQualifiedName();
			if (qualifiedName) {
				return parts.split(".").pop();
			}
			
			// extract function name
			var match = /^function\s+(.*)\(/.exec(clazz.toString());
			if (match) return match[1];
		}
		return null;
	}
	
	/**
	 * retrieves a filename relative to the classpath
	 * @static
	 * @method getPath
	 * @param {benignware.core.Class} clazz the class
	 * @param {String} filename a resource
	 */
	Class.getPath = function(clazz, filename) {
		var path = classPath;
		if (clazz) {
			var qualifiedName = typeof clazz == "string" ? clazz : Class.getQualifiedName(clazz);
			if (qualifiedName) {
				path+= path ? "/" : "";
				var parts = qualifiedName.split(".");
				if (filename) {
					parts.pop();
					return path + parts.join("/") + "/" + filename;
				} else {
					return path + parts.join("/") + ".js";
				}
			}
		}
		if (filename) {
			path+= path ? "/" : "";
			return path + filename;
		}
		return path;
	}
	
	/**
	 * returns class by the specified object or qualified name.
	 * @static
	 * @method getClass
	 * @param {Object} object
	 * @return {benignware.core.Class} the class
	 */
	Class.getClass = function(object) {

		if (typeof(object) == "object") {
			// return class constructor
			return typeof object.__constructor == "function" ? object.__constructor : object.constructor;
		
		} else if (typeof object == 'string') {
			
			var qualifiedName = object;
			
			// check registered classes
			if (classes[qualifiedName]) {
				return classes[qualifiedName];
			}
			
			// check global namespace
			try {
				var a = qualifiedName.split(".");
				var obj = window;
				for (var i = 0; i < a.length; i++) {
					obj = obj[a[i]];
					if (!obj) break;
				}
				if (typeof(obj) == "function") {
					classes[qualifiedName] = obj;
					return obj;
				}
				
			} catch (e) {
				console.error(e);
			}
		}
		
		return null;
	}
	
	/**
	 * loads the class for the specified qualified name.
	 * @static
	 * @method require
	 * @param {String} className
	 * @return {Class} the loaded class object
	 */
	Class.require = function(qualifiedName) {
		
		var clazz = Class.getClass(qualifiedName);
		
		if (clazz) {
			// class has been loaded before.
			return clazz;
		}
		
		var path = Class.getPath(qualifiedName);
		
		if (path) {
			var httpRequest = getXMLHttpRequest();
			httpRequest.open("GET", path, false);
			try {
				httpRequest.send(null);
			} catch (e) {
				console.error(e);
			}
			
			if (httpRequest.status == 200 && httpRequest.responseText) {
				
				try {
					clazz = eval(httpRequest.responseText);
				} catch(e) {
					console.error('class file could not be executed.');
				}
				
				if (!clazz) {
					clazz = Class.getClass(qualifiedName);
				}
			}
		}
		
		if (clazz) {
			// register
			Class.register(qualifiedName, clazz);
			return clazz;
			
		}
		
		// error class not found
		console.error("ClassNotFound: " + qualifiedName);
		return null;
	}
	
	
	// bean handling methods
	
	Class.getSetterName = function (propName) {
		return "set" + propName.substring(0, 1).toUpperCase() + propName.substring(1);
	}
	
	Class.getGetterName = function (propName) {
		return "get" + propName.substring(0, 1).toUpperCase() + propName.substring(1);
	}
	
	Class.callSetter = function (obj, propName, value) {
		
		var setterName = Class.getSetterName(propName);
		if (typeof(obj[setterName]) == "function") {
			obj[setterName].call(obj, value);
			return;
		}
//		console.log("call setter: ", propName, value, typeof(obj[propName]));
		if (typeof(obj[propName]) != "undefined" && typeof(obj[propName]) != "function") {
			
			switch (typeof(obj[propName])) {
				case "boolean":
					obj[propName] = (value == "true" || value == "1") ? true : (value);
					return;
				default:
					
					obj[propName] = value;
					return;
			}
		}
	}
	
	Class.callGetter = function (obj, propName) {
		var getterName = Class.getGetterName(propName);
		if (typeof(obj[getterName]) == "function") {
			return obj[getterName].call(obj);
		}
		if (typeof(obj[propName]) != "undefined") {
			return obj[propName];
		}
		return null;
	}
	
	Class.hasSetter = function (obj, propName) {
		var setterName = Class.getSetterName(propName);
		return (typeof(obj[setterName]) == "function" || typeof(obj[propName]) != "undefined" && typeof(obj[propName]) != "function")
	}
	
	Class.hasGetter = function (obj, propName) {
		var getterName = Class.getGetterName(propName);
		return (typeof(obj[getterName]) == "function" || typeof(obj[propName]) != "undefined" && typeof(obj[propName]) != "function")
	}

	// init
	
	Class.register('benignware.core.Class', Class);
	
	var classPath = (function() {
		
		var scripts = document.getElementsByTagName( 'script' );
		var scriptElem = scripts[ scripts.length - 1 ];
		var file = scriptElem.getAttribute("src");
		var qualifiedName = Class.getQualifiedName(Class);
		var dirs = file.split('/');
		var names = qualifiedName.split('.');
		while (names.length) {
			var match = true;
			for (var i = 0; i < names.length; i++) {
				var filePart = dirs[dirs.length - 1 - i];
				var namePart = names[names.length - i - 1];

				if (filePart.indexOf(namePart) == -1) {
					match = false;
					break;
				}
			}
			names.pop();
			if (match) {
				return dirs.slice(0, dirs.length - i).join("/");
			}
		}
		
		return "";
	})();
	
	Class.path = classPath;
	
	return Class;
	
})();
(function() {
	
	var Class = benignware.core.Class;

	/**
	 * cross browser event
	 * @class Event
	 * @param {String} type
	 * @param {Boolean} bubbles
	 * @param {Boolean} cancelable
	 */
	
	function Event(type, bubbles, cancelable) {
		var doc, event = this;
		if (arguments.length == 4) {
			doc = arguments[0];
			type = arguments[1];
			bubbles = arguments[2];
			cancelable = arguments[3];
		}
		doc = doc && !doc.documentElement ? doc : document;
		if (typeof bubbles == 'undefined') bubbles = typeof bubbles != 'undefined' ? bubbles :false;
		if (typeof cancelable == 'undefined') cancelable = typeof cancelable != 'undefined' ? cancelable :false;

		if (typeof(doc.createEvent) == "function") {
			event = doc.createEvent("Event");
			if (type) {
				event.initEvent(type, bubbles, cancelable);		
			}
		} else {
			if (document.createEventObject) {
				event = document.createEventObject();
			}
			event.type = type;
			event.bubbles = bubble;
			event.cancelable = cancelable;
		}
		event.constructor = Event;
		return event;
	}
	
	// register the class
	Class.register('benignware.core.Event', Event);
	
	/**
	 * @property target
	 * @return {Object} the event target
	 */
	Event.prototype.target = null;
	
	/**
	 * @property type
	 * @return {String} the event type
	 */
	Event.prototype.type = null;
	
	/**
	 * @property bubbles
	 * @return {Boolean} specifies if the event should bubble up the dom tree
	 */
	Event.prototype.bubbles = false;
	
	/**
	 * @property cancelable
	 * @return {Boolean} specifies if the event is cancelable
	 */
	Event.prototype.cancelable = false;
	
	
	/**
	 * creates a new event with the specified type and options
	 * @static
	 * @method create
	 * @param {Event} event
	 * @return {Event} the normalized event
	 */
	Event.create = function(type, bubbles, cancelable) {
		return Event.apply(this, arguments);
	}
	
	/**
	 * complements the specified event object with w3c compliant methods and properties
	 * @static
	 * @method normalize
	 * @param {Event} event
	 * @return {Event} the normalized event
	 */
	Event.normalize = function(event) {
		// TODO: implement
		if (typeof(event) == "undefined") {
			// no event
			event = window.event;
		}
		if (!event) return;
		if (typeof(event.preventDefault) == "undefined") {
			event.preventDefault = Event.prototype.preventDefault;
		}
		if (typeof(event.stopPropagation) == "undefined") {
			event.stopPropagation = Event.prototype.stopPropagation;
		}
		
		if (typeof(event.target) == "undefined" && typeof(event.srcElement) != "undefined") {
			event.target = event.srcElement;
		}
		
		if (typeof(event.which) == "undefined" && typeof(event.keyCode) != "undefined") {
			event.which = event.keyCode;
		}
		
		if (typeof(event.timeStamp) == "undefined") {
			event.timeStamp = new Date().getTime();
		}
		
		if (typeof(event.relatedTarget) == "undefined") {
			if (event.fromElement) {
					event.relatedTarget = event.fromElement;
			} else if (event.toElement) {
				event.relatedTarget = event.toElement;
			}
		}
		
		/*
		if (typeof(event.clientX) != "undefined") {
			event.pageX = event.clientX;
		}
		
		if (typeof(event.clientY) != "undefined") {
			event.pageY = event.clientY;
		}
		*/
		
		
		if ('wheelDeltaX' in event) {
			event.wheelDeltaX = -event.wheelDeltaX;
			event.wheelDeltaY = -event.wheelDeltaY;
		} else if ('detail' in event) {
		    if (event.axis === 2) { 
		    	// Vertical
		    	event.wheelDeltaY = event.detail * 12;
		    	event.wheelDeltaX = 0;
		    } else { 
		    	// Horizontal
		    	event.wheelDeltaX = event.detail * 12;
		    	event.wheelDeltaY = 0;
		    }
		} else if ('wheelDelta' in event) {
			event.wheelDeltaX = event.wheelDeltaX = event.wheelDelta;
		}
		
		
		return event;
	}
	
	return Event;
	
})();
(function() {
	
	var Class = benignware.core.Class;
	
	/**
	 * event handling implementation for non-ui classes
	 * @package benignware.core
	 * @class EventDispatcher
	 */
	
	var _parent;
	
	// helper methods
	
	function contains(array, value) {
		for (var i = 0; i < array.length; i++) if (array[i] == value) return true;
		return false;
	}
	
	function EventDispatcher() {
		
		var eventListeners = [];
		
		var __parent = _parent.apply(this, arguments);
		
		/**
		 * registers an event listener for the specified event
		 * @privileged
		 * @method addEventListener
		 * @param {String} type
		 * @param {Function} handler
		 */
		this.addEventListener = function(whichEvent, handler, useCapture) {
			if (__parent.addEventListener) {
				// native w3c
				__parent.addEventListener.apply(this, arguments);
			} else if (this.attachEvent) {
				// native ie
				this.attachEvent("on" + whichEvent, handler);
			} else {
				// implementation
				eventListeners[whichEvent] = eventListeners[whichEvent] || [];
				if (!contains(eventListeners[whichEvent], handler)) {
					eventListeners[whichEvent].push(handler);
				}
			}
		}
		
		/**
		 * unregisters an event listener for the specified event
		 * @privileged
		 * @method removeEventListener
		 * @param {String} type
		 * @param {Function} handler
		 */
		this.removeEventListener = function(whichEvent, handler, useCapture) {
			if (__parent.removeEventListener) {
				// native w3c
				__parent.removeEventListener.apply(this, arguments);
			} else if (this.detachEvent) {
				// native ie
				this.detachEvent("on" + whichEvent, handler);
			} else {
				// implementation
				if (eventListeners[whichEvent]) {
					for (var i = 0; i < eventListeners[whichEvent].length; i++) {
						if (eventListeners[whichEvent][i] == handler) {
							eventListeners[whichEvent].splice(i, 1);
							i--;
						}
					}
				}
			}
		}
		
		
		/**
		 * dispatches the specified event
		 * @privileged
		 * @method dispatchEvent
		 * @param {benignware.core.Event} event
		 */
		this.dispatchEvent = function(event) {
			
			
//			console.log("dispatch event: ", event, __parent.dispatchEvent);
			
			var canceled = false;
			if (__parent.dispatchEvent) {
				// native w3c
//				console.log("native");
				if (event.type == 'scrollend') {
					console.log("DISPATCH!!!!")
				}
				__parent.dispatchEvent.apply(this, arguments);
//				if (navigator.userAgent.match(/webkit/i)) {
//					console.log("return", navigator.userAgent);
//					return;
//				}
			} else if (this.fireEvent) {
//				console.log("native ie");
				// native ie
				this.fireEvent(event.type, event);
				return;
				
			} else if (!__parent.addEventListener) {
				
//				console.log("implementation")
				// implementation
				
				if (typeof(event.target) == "undefined") {
					try {
						event.target = this;
					} catch (e) {}
				}
				
				var whichEvent = event.type;
				
				if (eventListeners != null && eventListeners[whichEvent]) {
					for (var i = 0; i < eventListeners[whichEvent].length; i++) {
						// call the handler
						eventListeners[whichEvent][i](event);
					}
				}
				
				if (event.bubbles && !event.cancelBubble) {
					if (this.parentNode) {
						if (this.parentNode.dispatchEvent) {
							this.parentNode.dispatchEvent(event);
						}
					}
				}
			}

//			console.log("*** event", event.type);
			var eventProperty = 'on' + event.type.toLowerCase();
			
			//if (!(eventProperty in window)) {
				if (this.getAttribute && this.getAttribute(eventProperty)) {
					// fire on attribute
					eval(this.getAttribute(eventProperty));
				} else if (typeof(this[eventProperty]) == "function") {
					// fire on property
					
					this[eventProperty](event);
				}
			//}
			
//			this.handleEvent(event);
			
			
			return !(event.defaultPrevented || !event.returnValue);

		}
		
		
		// constructor end
	}
	
	// extend
	Class.extend(Object, EventDispatcher);
	_parent = Class.getParent(EventDispatcher);
	
	// register the class
	Class.register('benignware.core.EventDispatcher', EventDispatcher);
	
	/**
	 * called on dispatch
	 * @method handleEvent
	 * @param {benignware.core.Event} event
	 */
	EventDispatcher.prototype.handleEvent = function(event) {
		// no implementation here
	}
	
	return EventDispatcher;
	
})();
/**
 * Basic utility classes.
 * @package benignware.util
 */
(function(){
	
	var Class = benignware.core.Class;
	
	/**
	 * Delegate factory.
	 * @class Delegate
	 */
	function Delegate() {
	}
	
	Class.register("benignware.util.Delegate", Delegate);
	
	/**
	 * Creates a delegate function. similar to Function.bind.
	 * @static
	 * @method create
	 * @param {Object} object the object to bind the function to.
	 * @param {Function} func the function
	 * @return {Function} the delegate
	 */
	Delegate.create = function(scope, func) {
		function delegate() {
			return func.apply(scope, arguments);
		}
		delegate.toString = function() {
			return func.toString();
		}
		return delegate;
	}
	
	return Delegate;
	
})();
(function() {
	
	var Class = benignware.core.Class;
	
	/**
	 * Array utility methods
	 * @class ArrayUtils
	 */
	function ArrayUtils() {
	}
	
	Class.register("benignware.util.ArrayUtils", ArrayUtils);
	
	ArrayUtils.intersect = function(array1, array2) {
		var a1 = array1.slice(0);
		var a2 = array2.slice(0);
		var result = [];
		for (var i=0;i<a1.length;i++){ 
	        for (var j=0;j<a2.length;j++) if (a1[i]==a2[j]) {
				a2.splice(j--, 1);
				result.push(a1[i]);
				break;
			}
	    }
		return result;
	}
	
	ArrayUtils.subtract = function(array1, array2) {
		var a1 = array1.slice(0);
		var a2 = array2.slice(0);
		for (var i=0;i<a1.length;i++){ 
			var found = false;
	        for (var j=0;j<a2.length;j++) if (a1[i]==a2[j]) {
				//a2.splice(j--, 1);
				found = true;
				break;
			}
			if (found) {
				a1.splice(i--, 1);
			}
	    }
		return a1;
	}
	
	/**
	 * checks if the array contains the specified value
	 * @static
	 * @method contains
	 * @param {Array} array
	 * @param {Object} value
	 */
	ArrayUtils.contains = function(array, value) {
		for (var i = 0; i < array.length; i++) if (array[i] == value) return true;
		return false;
	}
	
	ArrayUtils.indexOf = function(array, value) {
		for (var i=0;i<array.length;i++) if (array[i]==value) return i;
		return -1;
	}
	
	ArrayUtils.remove = function(a, value) {
		for (var i = 0; i < a.length; i++) if (a[i] == value) a.splice(i--, 1);
		return a;
	}
	
	ArrayUtils.unique = function(a) {
		var result = typeof a == "array" ? [] : {};
		for (var x in a) {
			if (!ArrayUtils.contains(result, a[x])) {
				result[x] = a[x];
			}
		}
		return result;
	}
	
	ArrayUtils.merge = function(a1, a2) {
		var result = [];
		for (var i = 0; i < arguments.length; i++) {
			var a = arguments[i];
			for (var x in a) {
				if (typeof x == "number") {
					result.push(a[x]);
				} else {
					result[x] = a[x];
				}
			}
		}
		return result;
	}
	
	ArrayUtils.concat = function(a1, a2) {
		return a1.concat(a2);
	}
	
	ArrayUtils.equals = function(a1, a2) {
		var result = [];
		if (typeof(a1) != typeof(a2)) return false;
		if (typeof(a1) == "object" || typeof(a1) == "array") {
			for (var x in a1) {
				var res = ArrayUtils.equals(a1[x], a2[x]);
				if (!res) return false;
			}
			for (var x in a2) {
				var res = ArrayUtils.equals(a2[x], a1[x]);
				if (!res) return false;
			}
			return true;
		}
		return (a1 == a2);
	}
	
	ArrayUtils.clone = function(a) {
		var result = [];
		for (var x in a) {
			var child = a[x];
			if (typeof(child) == "object" || typeof(child) == "array") {
				result[x] = ArrayUtils.clone(child);
			} else {
				result[x] = child;
			}
		}
		return result;
	}
	
	ArrayUtils.fill = function(a, len, fill) {
		var result = [];
		for (var i = 0; i < len; i++) {
			result[i] = i < a.length ? a[i] : fill ? fill : a[i % a.length];
		}
		return result;
	}
	
	ArrayUtils.filter = function(array, func) {
		var result = [];
		for (var i = 0; i < array.length; i++) {
			var obj = array[i]
			if (func(obj)) {
				result.push(obj);
			}
		}
		return result;
	}
	
	return ArrayUtils;
	
})();
(function() {
	
	var Class = benignware.core.Class;
	var ArrayUtils = Class.require('benignware.util.ArrayUtils');
	
	/**
	 * String utility methods
	 * @package benignware.util
	 * @class StringUtils
	 */
	function StringUtils() {}
	
	Class.register("benignware.util.StringUtils", StringUtils);
	
	/**
	 * finds a string in another
	 * @static
	 * @method contains
	 * @param {String} haystack
	 * @param {String} needle
	 * @returns
	 */
	StringUtils.contains = function(haystack, needle) {
		return haystack && needle ? haystack.indexOf(needle) >= 0 ? true : false : "";
	}

	/**
	 * trims whitespace from beginning and end of a string
	 * @static
	 * @method trim
	 * @param {String} string
	 * @returns
	 */
	StringUtils.trim = function(string) {
		if (string) {
			string = string.replace(/(\r\n|\n|\r)/gm,"");
			string = string.replace(/^(?:\s+|\n+)|(?:\s+|\n+)$/gm, '');
			return string;
		}
		return "";
	}
	
	/**
	 * trims slashes from beginning and end of a string
	 * @static
	 * @method trimSlashes
	 * @param {String} string
	 * @returns
	 */
	StringUtils.trimSlashes = function(string) {
		return string ? string.replace(/^\/+|\/+$/g, '') : '';
	}
	
	/**
	 * returns true if the specified string starts with the given sequence
	 * @static
	 * @method startsWith
	 * @param {String} string
	 * @param {String} sequence
	 * @returns {Boolean}
	 */
	StringUtils.startsWith = function(string, sequence) {
		return (string.indexOf(sequence) == 0);
	}
	
	/**
	 * returns true if the specified string ends with the given sequence
	 * @static
	 * @method endsWith
	 * @param {String} string
	 * @param {String} sequence
	 * @returns {Boolean}
	 */
	StringUtils.endsWith = function(string, sequence) {
		return (string.lastIndexOf(sequence) >= 0 && string.lastIndexOf(sequence) == string.length - sequence.length);
	}
	
	/**
	 * capitalizes a string
	 * @static
	 * @method capitalize
	 * @param {String} string
	 * @returns {String} the capitalized string
	 */
	StringUtils.capitalize = function(string) {
		return string.substring(0, 1).toUpperCase() + string.substring(1);
	}
	
	/**
	 * uncapitalizes a string
	 * @static
	 * @method capitalize
	 * @param {String} string
	 * @returns {String} the uncapitalized string
	 */
	StringUtils.uncapitalize = function(string) {
	 	return string.substring(0, 1).toLowerCase() + string.substring(1);
	}
	
	/**
	 * pluralizes a string
	 * @static
	 * @method pluralize
	 * @param {String} string
	 * @returns {String} the pluralized string
	 */
	StringUtils.pluralize = function(string) {
		if (StringUtils.endsWith(string, "y")) {
	 		return string.substring(0, string.length - 1) + "ies";
	 	} else {
	 		return string + "s";
	 	}
	}
	
	StringUtils.leftPad = function(str, len, character) {
		if (typeof(str) == "number") str = new String(str);
		if (typeof(character) == "undefined") character = "0";
		if (str.length > len) return str;
		var chStr = "";
		for (var i = 0; i < len - str.length; i++) {
			chStr+= character;
		}
		return chStr + str;
	}
	
	
	/* Conversion */
	
	/**
	 * returns a camel case string
	 * @param {String} string
	 * @returns {String}
	 */
	StringUtils.toCamelCase = function(string) {
		var split = string.split("-");
		var result = "";
		for (var i = 0; i < split.length; i++) {
			var word = split[i];
			if (i == 0 || !word.length) {
				result+= word;
			} else {
				result+= word.substring(0, 1).toUpperCase() + word.substring(1);
			}
		}
		return result;
	}
	
	StringUtils.hyphenate = function(name) {
		var result = "";
		for (var i = 0; i < name.length; i++) {
			var ch = name.charAt(i);
			if (ch.match(/[a-zA-Z]/) && ch == ch.toUpperCase()) {
				result+= "-" + ch.toLowerCase();
			} else {
				result+= ch;
			}
		}
		return result;
	}
	
	StringUtils.toBoolean = function (str) {
		if (typeof(str)=="string") {
			return (str == "true" || str == "1") ? true : false;
		}
		if (typeof(str)=="boolean") {
			return str;
		}
		return false;
	}
	
	StringUtils.toHex = function(num) {
		if (num == null) return "00";
		num = parseInt(num);
		if (num == 0 || isNaN(num)) return "00";
		num = Math.max(0, num); 
		num = Math.min(num, 255);
		num = Math.round(num);
		return "0123456789ABCDEF".charAt((num - num%16) / 16)
		     + "0123456789ABCDEF".charAt(num%16);
	}
	
	StringUtils.toHexColor = function(r, g, b) {
		return "#" + StringUtils.toHex(r) + StringUtils.toHex(g) + StringUtils.toHex(b);
	}
	
	StringUtils.toRGB = function(hexColor) {
		var r, g, b;
		hexColor = StringUtils.trim(hexColor);
		if (StringUtils.startsWith(hexColor, 'rgb')) {
			var p = /rgb\(([0-9]*)\s*,\s*([0-9]*)\s*,\s*([0-9]*)\)/;
			var reg = new RegExp( p );
			var m = reg.exec(hexColor);
			if (m) {
				r = parseInt(m[1]);
				g = parseInt(m[2]);
				b = parseInt(m[3]);
				return {r: r, g: g, b: b}
			}
		}
		var h = hexColor.charAt(0) == "#" ? hexColor.substring(1) : hexColor;
		r = parseInt(h.substring(0, 2), 16);
		g = parseInt(h.substring(2, 4), 16);
		b = parseInt(h.substring(4, 6), 16);
		return {r: r, g: g, b: b}
	}
	
	StringUtils.br2nl = function (str) {
		return str.replace(/<\s*br\s*\/?\s*>/gi, "\n");
	}
	
	StringUtils.nl2br = function (str) {
		return str.replace(/\n/gi, "<br/>");
	}
	
	StringUtils.stripTags = function(str) {
		var matchTag = /<(?:.|\s)*?>/g;
        return str.replace(matchTag, "");
	}
	
	StringUtils.jsonDecode = function(str) {
		var json = null;
		if (JSON && JSON.parse) {
			try {
				json = JSON.parse(str);
			} catch(e) {
				json = null;
			}
		}
		if (!json) {
			var trim = StringUtils.trim(str);
			if (trim) {
				if ((trim.indexOf("{") == 0 || trim.indexOf("[") == 0) && (trim.lastIndexOf("}") == trim.length - 1 || trim.lastIndexOf("]") == str.length - 1)) {
					json = eval ("(" + trim + ")");
				}
			}
		}
		return json;
	}
	
	
	
	// string formatting
	
	StringUtils.parseDate = function(string) {  
		var date = new Date();  
		var parts = String(string).split(/[- :]/);  
		date.setFullYear(parts[0]);  
		date.setMonth(parts[1] - 1);  
		date.setDate(parts[2]);  
		date.setHours(parts[3]);  
		date.setMinutes(parts[4]);  
		date.setSeconds(parts[5]);  
		date.setMilliseconds(0);  
		return date;  
	}  
	
	// thanks: http://dzone.com/snippets/javascript-formatdate-function
	StringUtils.formatDate = function (formatDate, formatString) {
//		console.log("StringUtils::formatDate", formatDate, formatString);
		if (formatDate instanceof Date) {
			var months = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
			var yyyy = formatDate.getFullYear();
			var yy = yyyy.toString().substring(2);
			var m = formatDate.getMonth() + 1;
//			console.log("FORMAT DATE GET MONTH", m);
			var mm = m < 10 ? "0" + m : m;
			var mmm = months[m];
			var d = formatDate.getDate();
			var dd = d < 10 ? "0" + d : d;
			
			var h = formatDate.getHours();
			var hh = h < 10 ? "0" + h : h;
			var n = formatDate.getMinutes();
			var nn = n < 10 ? "0" + n : n;
			var s = formatDate.getSeconds();
			var ss = s < 10 ? "0" + s : s;

			formatString = formatString.replace(/yyyy/i, yyyy);
			formatString = formatString.replace(/yy/i, yy);
			formatString = formatString.replace(/mmm/i, mmm);
			formatString = formatString.replace(/mm/i, mm);
			formatString = formatString.replace(/m/i, m);
			formatString = formatString.replace(/dd/i, dd);
			formatString = formatString.replace(/d/i, d);
			formatString = formatString.replace(/hh/i, hh);
			formatString = formatString.replace(/h/i, h);
			formatString = formatString.replace(/ii/i, nn);
			formatString = formatString.replace(/i/i, n);
			formatString = formatString.replace(/ss/i, ss);
			formatString = formatString.replace(/s/i, s);

			return formatString;
		} else {
			return "";
		}
	}
	
	
	StringUtils.formatNumber = function(number, mask) {
		mask = mask || "#.##";
		var match = new RegExp(/(#+)(?:\.(#+))?/).exec(mask);
		if (match) {
			var decimalPlaces = match[2] ? match[2].length : 0;
			var numberString = number.toFixed(decimalPlaces).toString();
			if (match[2] && match[2].match(/#+/)) {
				var f = parseFloat(numberString);
				return f.toString();
			}
			string = mask.substring(0, match.index) + numberString + mask.substring(match.index + match[0].length);
			return string;
		}
		return number.toString();
	}
	
	
	/* Currency formatting */
	StringUtils.formatCurrency = function(number, options) {
		var sep = ".", del = ",", unit = "$", prep = false, prec = 2;
		if (typeof(options) == "object") {
			sep = options['separator'] ? options['separator'] : sep;
			del = options['delimiter'] ? options['delimiter'] : del;
			unit = options['unit'] ? options['unit'] : unit;
			prep = options['prepend'] ? options['prepend'] : prep;
			prec = options['precision'] ? options['precision'] : prec;
		} else {
			sep = arguments[1] ? arguments[1] : sep;
			del = arguments[2] ? arguments[2] : del;
			unit = arguments[3] ? arguments[3] : unit;
			prep = typeof(arguments[4]) != "undefined" && !arguments[4] ? false : true;
			prec = arguments[5] ? arguments[5] : prec;
		}
		var string = number.toFixed(prec).toString();
		var regexp = new RegExp(unit,'g');
		string = string.replace(regexp, '');
		var s = string.split('.');
		var intstr = "";
		for (var i = s[0].length - 1; i >= 0; i--) {
			var d = s[0].length - i;
			if (d > 0 && d % 4 == 0) {
				intstr = del + intstr;
			}
			intstr = s[0][i] + intstr;
		}
		var result = intstr + sep + s[1];
		result = prep ? unit + result : result + unit;
		return result;
	}
	
	/* VALIDATION */
	
	StringUtils.isEmail = function(str) {
		return str.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
	}
	
	StringUtils.isFile = function(str) {
		var v = new RegExp();
		v.compile(/[^,{}]*\.[\w]+(?:\?.*)?$/gi);
		return v.test(str);
	}
	
	StringUtils.isUrl = function (string) {
		var v = new RegExp();
		v.compile("^(?:[A-Za-z]+://|/)?[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&\?\/.=]+$"); 
    	return v.test(StringUtils.trim(string));
	}
	
	StringUtils.isAbsoluteUrl = function (string) {
		if (StringUtils.isUrl(string)) {
			
		} 
		return false;
	}
	
	StringUtils.isRootUrl = function (string) {
		if (StringUtils.isUrl(string) && StringUtils.startsWith(StringUtils.trim(string), "/")) {
			return true;
		} 
	}
	
	StringUtils.isRelativeUrl = function (string) {
		if (StringUtils.isUrl(string) && !StringUtils.startsWith(StringUtils.trim(string), "/") && !StringUtils.parseURL(string).host) {
			return true;
		}
		return false;
	}
	
	StringUtils.isLocalUrl = function (string) {
		if (StringUtils.startsWith(string, "/")) {
			return true;
		}
		var info = StringUtils.parseURL(string);
		if (!info.host || info.host == window.location.host) {
			return true;
		}
		return false;
	}
	
	StringUtils.getFileName = function (url) {
		var a = url.split("/");
		return a.pop();
	}
	
	StringUtils.getFileExtension = function (url) {
		var fileName = StringUtils.getFileName(url);
		if (fileName) {
			var a = fileName.split(".");
			return a.pop();
		}
		return null;
	}
	
	StringUtils.getDirectoryName = function (url) {
		var a = url.split("/");
		a.pop();
		return a.join("/");
	}
	
	/**
	 * Extracts the specified parameter from an url.
	 * @method parseURL
	 * @param {String} str
	 * @param {String} name
	 */
	
	StringUtils.parseURL = function(url) {
		var result = {protocol: "", host: "", pathname:"", queryString:"", params:[]};
		var pattern = /^\s*(?:([a-z]*)\:\/\/([^\\\/]*))?(.*)?(.*)/i;
		var regex = new RegExp( pattern );
		var match = regex.exec(url);
		if (match) {
			result.protocol = match[1] || "";
			result.host = match[2] || "";
			result.pathname = match[3] || "";
			result.queryString = match[4] || "";
		}
		if (result.queryString) {
			var params = [];
			var queryString = result.queryString;
			queryString = StringUtils.startsWith(queryString, "?") ? queryString.substring(1) : queryString;
			if (queryString) {
				
				var pairs = queryString.split("&");
				for (var i = 0; i < pairs.length; i++) {
					var pair = pairs[i].split("=");
					var name = decodeURIComponent(pair[0]);
					var value = decodeURIComponent(pair[1]);
					var match = new RegExp(/^([a-z0-9_-]*)\[(.*)\]$/).exec(name);
					if (match) {
						name = match[1];
						key = match[2];
						if (!params[name]) {
							params[name] = [];
						}
						if (key) {
							params[name][key] = value;
						} else {
							params[name].push(value);
						}
					} else {
						params[name] = value;
					}
				}
				
			}
			result.params = params;
		}
		var base = result.protocol ? result.protocol + "//" + result.host : "";
		base+= result.pathname;
		result.base = base;
		return result;
	}
	
	
	
	StringUtils.buildHTTPQuery = function(params, prefix, urlencoded) {
		urlencoded = typeof urlencoded == "boolean" ? urlencoded : true;
		var pairs = [];
	    for(var p in params) {
	        var k = prefix ? prefix + "[" + p + "]" : p, v = params[p];
	        if (!v.constructor || v.constructor == Object || v.constructor == String) {
	        	pairs.push(typeof v == "object" ? 
	    	        	StringUtils.buildHTTPQuery(v, k, urlencoded) :
	    	        		(urlencoded ? encodeURIComponent(k) : k) + "=" + (urlencoded ? encodeURIComponent(v) : v));
	        }
	        
	    }
	    return pairs.join("&");
	}
	
	StringUtils.buildURL = function(url, params, prefix, urlencoded) {
		var urlInfo = StringUtils.parseURL(url);
		var params = ArrayUtils.merge(urlInfo.params, params);
		if (urlInfo.host) {
			url = urlInfo.protocol + "://" + urlInfo.host + urlInfo.pathname;
		} else {
			url = urlInfo.pathname;
		}
		var queryString = StringUtils.buildHTTPQuery(params, prefix, urlencoded);
		url+= queryString ? "?" + queryString : "";
		return url;
	}
	
	return StringUtils;
})();
(function() {
	
	var instance;
	
	function UserAgent() {
		detect.call(this);
	}
	
	benignware.core.Class.register('benignware.util.UserAgent', UserAgent);
	
	UserAgent.getInstance = function() {
		if (!instance) {
			instance = new UserAgent();
		}
		return instance;
	};
	
	
	// detection
	
	function detect() {
		
		var userAgent = navigator.userAgent;
		
		var object = this;
		
		
		// detect iPad
		if (navigator.platform.indexOf("iPad") != -1) {
			var iPadVersion = window.devicePixelRatio === 2 ? 3 : window.devicePixelRatio === 1 ? 2 : 1;
			object.iPad = {
				version: iPadVersion
			}
		}
		
		if (navigator.platform.indexOf("iPhone") != -1) {
			object.iPhone = {
				version: -1
			}
		}
		
		if (navigator.platform.indexOf("iPod") != -1) {
			object.iPod = {
				version: -1
			}
		}
		
		// detect iOS
		if (object.iPad || object.iPhone || object.iPod) {
			var start = userAgent.indexOf( 'OS ' );
			object.iOS = {
				version: window.Number( userAgent.substr( start + 3, 3 ).replace( '_', '.' ) )
			}
		}
		
		
		// detect android
		if (userAgent.toLowerCase().indexOf("android") != -1) {
			var androidVersion = parseFloat(userAgent.slice(userAgent.indexOf("Android") + 8));
			androidVersion = androidVersion && !isNaN(androidVersion) ? androidVersion : -1;
			object.android = {
				version: androidVersion
			}
		}
		
		// detect macos
		if (userAgent.indexOf("Mac OS") != -1) {
			object.macOS = {
				version: (function() {
					var re = new RegExp("Mac OS [A-Z]?\\s+([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null)
				      return parseFloat( RegExp.$1 );
				   
				})()
			}
		}
		
		// detect windows
		if (userAgent.indexOf("Windows") != -1) {
			object.windows = {
				version: -1
			}
		}
		
		
		
		// detect linux
		if (navigator.platform.indexOf("Linux") != -1) {
			object.linux = {
				version: -1
			}
		}

		// detect android browser
		
		if (object.android && userAgent.indexOf("Safari") != -1 && userAgent.indexOf("Chrome") == -1) {
			object.androidBrowser = {
				version: (function() {
					var re = new RegExp("Version/([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null)
				      return parseFloat( RegExp.$1 );
				})()
			}
		}
		
		
		// detect firefox
		if (userAgent.indexOf("Firefox") != -1) {
			object.firefox = {
				version: (function() {
					var re = new RegExp("Firefox/([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null)
				      return parseFloat( RegExp.$1 );
				})()
			}
		}

		
		// detect safari
		if (!userAgent.android && userAgent.indexOf("Safari") != -1 && userAgent.indexOf("Chrome") == -1) {
			object.safari = {
				version: (function() {
					var re = new RegExp("Version/([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null)
				      return parseFloat( RegExp.$1 );
				})()
			}
		}
		
		// detect chrome
		if (userAgent.indexOf("Chrome") != -1) {
			object.chrome = {
				version: (function() {
					var re = new RegExp("Chrome/([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null && RegExp.$1)
				      return parseFloat( RegExp.$1 );
				    
				    return -1;
				})()
			}
		}
		
		// detect opera
		if (window.opera) {
			object.opera = {
				version: (function() {
					var re = new RegExp("Version/([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null && RegExp.$1)
				      return parseFloat( RegExp.$1 );
				    
				    return -1;
				})()
			}
		}
		
		// detect internet explorer
		if (navigator.appName == 'Microsoft Internet Explorer') {
			object.internetExplorer = {
				version: (function() {
					var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null)
				      return parseFloat( RegExp.$1 );
				})()
			}
		}
		
		// dip resolution
		object.dipResolution = (function() {
			// density-independent device resolution;
			if (window.devicePixelRatio) {
				if (object.android) {
					return {
						width: screen.width / window.devicePixelRatio, 
						height: screen.height / window.devicePixelRatio
					}
				}
			}
			return {
				width: screen.width,  
				height: screen.height
			}
		})();
		
		// dip resolution
		object.pixelResolution = (function() {
			// density-independent device resolution;
			if (window.devicePixelRatio) {
				if (object.android) {
					return {
						width: screen.width, 
						height: screen.height
					}
				}
			}
			return {
				width: screen.width * window.devicePixelRatio,  
				height: screen.height * window.devicePixelRatio
			}
		})();
		
		return object;
		
	}
	
	UserAgent.prototype.toString = function() {
		return navigator.userAgent;
	}

	
	return UserAgent;
	
})();
(function() {
	
	var Class = benignware.core.Class;
	
	var EventDispatcher = Class.require('benignware.core.EventDispatcher');
	var Event = Class.require('benignware.core.Event');
	
	
	/**
	 *  an event-dispatching timer class
	 *  @class benignware.util.Timer
	 *  @extends benignware.core.EventDispatcher
	 */
	
	return Class.create('benignware.util.Timer', (function() {
		
		var _parent;
		
		/**
		 * @constructor
		 * @param interval
		 */
		function Timer(interval) {
			
			var __parent = _parent.apply(this, arguments);
			
			var _interval = interval || 1000;
			
			var timerId = null;
			
			var timer = this;
			
			function timerCallback() {
				var event = Event.create('tick', false, false);
				timer.dispatchEvent(event);
			}
			
			/**
			 * sets the timer interval
			 * @privileged
			 * @method setInterval
			 * @param {int} the interval in milliseconds
			 */
			this.setInterval = function(interval) {
				if (interval != _interval) {
					_interval = interval;
					if (this.isRunning()) {
						window.clearInterval(timerId);
						timerId = window.setInterval(timerCallback, this.getInterval());
					}
				}
			}
			
			/**
			 * returns the timer interval
			 * @privileged
			 * @method getInterval
			 * @return {int} the interval in milliseconds
			 */
			this.getInterval = function(interval) {
				return _interval;
			}
			
			/**
			 * starts the timer
			 * @privileged
			 * @method start
			 */
			this.start = function() {
//				console.log("Timer::start()", this.getInterval());
				if (this.isRunning()) {
					this.stop();
				}
				timerId = window.setInterval(timerCallback, this.getInterval());
			}
			
			/**
			 * stops the timer
			 * @privileged
			 * @method stop
			 */
			this.stop = function() {
//				console.log("Timer::stop()");
				if (timerId) {
					window.clearInterval(timerId);
					timerId = null;
				}
			}
			
			/**
			 * returns true, if the timer is running
			 * @privileged
			 * @method isRunning
			 * @return {Boolean} true, if timer is running
			 */
			this.isRunning = function() {
				return (timerId != null);
			}
		}
		
		Class.extend(EventDispatcher, Timer);
		
		_parent = Class.getParent(Timer);
		
		/**
		 * timer event.
		 * @event tick
		 */

		return Timer;
		
	})());
	
})();
(function() {
	
	// class imports
	var Class = benignware.core.Class;
	var Event = Class.require('benignware.core.Event');
	var EventDispatcher = Class.require('benignware.core.EventDispatcher');
	var StringUtils = Class.require('benignware.util.StringUtils');
	
	// init parent
	var _parent;
	
	// private helper methods
	
	function startsWith(string, sequence) {
		return (string.indexOf(sequence) == 0);
	}
	
	function toCamelCase(name) {
		var split = name.split("-");
		var result = "";
		for (var i = 0; i < split.length; i++) {
			var word = split[i];
			result+= i == 0 || !word.length ? word : word.substring(0, 1).toUpperCase() + word.substring(1);
		}
		return result;
	}
	
	/**
	 * Base class for all ui elements
	 * @package benignware.core
	 * @class Element
	 * @extends benignware.core.EventDispatcher
	 */
	
	function Element() {
		var __parent = _parent.apply(this, arguments);
	}
	
	Class.register('benignware.core.Element', Element);
	
	Class.extend(EventDispatcher, Element);
	_parent = Class.getParent(Element);

	/**
	 * points to the clazz the object has been initialized with
	 * @property __constructor
	 */
	Element.prototype.__constructor = Element;
	
	
	/**
	 * the _construct method is called when the object is initialized.
	 * @protected
	 * @method _construct
	 */
	Element.prototype.__construct = function() {
	}
	
	/**
	 * creates an element of the specified class
	 * @static
	 * @method create
	 * @param {Document} document the owner document of the element.
	 * @param {benignware.core.Class} clazz the element class
	 * @return {Element} the created element.
	 */
	Element.create = function(doc, clazz, args) {
		
		if (arguments.length == 1) {
			clazz = arguments[0];
			doc = document;
		}
		
		if (arguments.length == 0) {
			clazz = Element;
			doc = document;
		}

		// 
		var tagName = "div";
		
		if (typeof(clazz) == "string") {
			var c = Class.getClass(clazz);
			if (c) {
				clazz = c;
			} else {
				tagName = clazz;
			}
		}
		
		if (typeof(clazz) == "function" && clazz.prototype.tagName) {
			tagName = clazz.prototype.tagName;
		}
		
		var elem = doc.createElement(tagName);
		if (typeof(clazz) == "function") {
			Element.initialize(elem, clazz, args);
		}
		return elem;
	}
	
	/**
	 * initializes an element with the specified class
	 * @static
	 * @method initialize
	 * @param element the existing element.
	 * @param clazz the class of the element. 
	 * @return {Element} the initialized element.
	 */
	Element.initialize = function(element, clazz, args) {

//		console.log("Element::initialize(", element, clazz, args, ")");
		
		if (!element) {
			return;
		}
		
		if (element.__constructor) {
			return element;
		}
		
		doc = document;
		element = typeof(element) == "string" ? doc.getElementById(element) : element;
		
		if (!element || typeof(element) != "object") {
			// element is not defined
			return null;
		}

		clazz = typeof(clazz) == "string" ? Class.getClass(clazz) : clazz;
		
		if (!clazz) {
			return null;
		}
		
		// Object.initialize
		var object = element;
			
		if (typeof object == "object" && typeof clazz == "function") {
			
			if (object.constructor != clazz && object.__constructor != clazz) {
				
				// copy the prototype
				for (var x in clazz.prototype) {
//					if (typeof(object[x]) == "undefined" || typeof(object[x]) == "function") {
						try {
							object[x] = clazz.prototype[x];
						} catch (e) {
							
						}
//					}
				}
			}
	
			object.__constructor = clazz;
			
			// call the constructor
			clazz.apply(object, args);
			
			// call _construct
			var _construct = object.__construct ? object.__construct : object._construct && object._construct.__protected ? object._construct : null;
			if (_construct) {
				_construct.apply(object, args);
			}


		}
		
		return object;
	}
	
	
	/**
	 * registers an event listener for the specified event type on an element.
	 * @static
	 * @method addEventListener
	 * @param {Element} element the element
	 * @param {String} whichEvent the type of the event
	 * @param {Function} handler the listener function
	 * @param {Boolean} useCapture
	 */
	Element.addEventListener = (function() {
		if (window.addEventListener) {
			return function(element, whichEvent, handler, useCapture) {
				element.addEventListener(whichEvent, handler, useCapture);
			}
		} else if (window.attachEvent) {
			return function (element, whichEvent, handler, useCapture) {
				element.attachEvent('on' + whichEvent, handler);
			}
		}
	})();
	 
	/**
	 * unregisters an event listener for the specified event type on an element.
	 * @static
	 * @method removeEventListener
	 * @param {Element} element the element
	 * @param {String} whichEvent the type of the event
	 * @param {Function} handler the listener function
	 * @param {Boolean} useCapture 
	 */
	Element.removeEventListener = (function() {
		if (window.removeEventListener) {
			return function(element, whichEvent, handler, useCapture) {
				element.removeEventListener(whichEvent, handler, useCapture);
			}
		} else if (window.detachEvent) {
			return function (element, whichEvent, handler, useCapture) {
				element.detachEvent('on' + whichEvent, handler);
			}
		}
	})()
	
	/**
	 * dispatches the specified event on an element. 
	 * @static
	 * @method dispatchEvent
	 * @param {Element} element the element on which the event should be dispatched. 
	 * @param {benignware.core.Event} event an event object.
	 */
	Element.dispatchEvent = (function() {
		if (window.dispatchEvent) {
			return function (element, event) {
				return element.dispatchEvent(event);
			}
		} else if (window.fireEvent) {
			return function (element, event) {
				return element.fireEvent(event.type, event);
			}
		}
	})();
	
	
	/**
	 * Cross-browser implementation of the getComputedStyle method.
	 * @static
	 * @method getComputedStyle
	 * @param {benignware.core.Element} element
	 * @param {String} styleName
	 * @return {String} the style value
	 */
	Element.getComputedStyle = function(element, styleName) {
		styleName = StringUtils.toCamelCase(styleName);
		var doc = element.ownerDocument || document;
		if (doc != null) {
			if (doc.defaultView && doc.defaultView.getComputedStyle) {
				var style = doc.defaultView.getComputedStyle(element, "");
				if (style) {
					return style[styleName];
				}
			}
			if (element.currentStyle) {
				return element.currentStyle[styleName];
			}
		}
		
		return null;
	}
	
	
	/**
	 * returns dataset object
	 * @static
	 * @method getDataset
	 * @param {Element} elem
	 */
	Element.getDataset = function(element) {
		
		
		var dataset = {}
		var attributes = element.attributes;
		for (var i = 0; i < attributes.length; i++) {
			
			var attribute = attributes[i];
			if (attribute.name.indexOf("data-") == 0) {
				var name = toCamelCase(attribute.name.substring(5));
				var value = attribute.value;
				var numValue = parseFloat(value);
				value = !isNaN(numValue) ? numValue : value;
				dataset[name] = value;
			}
			
		}

		return dataset;
	}
	
	
	/**
	 * sets a global flag whether to parse the dom on document ready.
	 * @sta
	 */
	
	Element.parseOnReady = true;
	
	/**
	 * traverse the dom for data-type attributes and initializes registered classes 
	 * @static
	 * @method parseDOM
	 * @param {Element} elem
	 */

	Element.parseDOM = function(element) {
		
		element = element.documentElement ? element.documentElement : element;
		
		var attributes = element.attributes;
		var type = null;

		for (var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];
			if (attribute.name.indexOf("data-") == 0) {
				var name = attribute.name.substring("data-".length);
				if (name == 'type') {
					type = attribute.value;
					break;
				}
			}
		}	
			
			
		var children = element.childNodes;
		
		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (child.nodeType == 1) {
				Element.parseDOM(child);
			}
		}
		
		if (type) {
			
			// get class
			var clazz = Class.require(type);
			if (clazz) {
				// initialize
				element.removeAttribute("data-type");
				Element.initialize(element, clazz);
			}
		}
	}
	
	
	
	
	Element.getPosition = function (element, parent) {
//		console.log("GET POSITION", element)
		var pos = null;
		if (element && element == window) {
			pos = {x: 0, y: 0};
		}
		if (!element || !element.ownerDocument) {
			return null;
		}
		if (!pos) {
			var doc = element.ownerDocument;
			var docElem = doc.documentElement;
			var pos = {x:0, y:0}
//			if (docElem) {
//				pos = {x: -docElem.scrollLeft, y: -docElem.scrollTop}
//			}

			
			if (element) {
				var elem = element;
				do {
//					console.log("POS: ", pos, elem, elem.offsetLeft, elem.scrollLeft, elem.offsetTop, elem.scrollTop);
					pos.x += elem.offsetLeft;
					pos.y += elem.offsetTop;
	
//					pos.x -= elem.parentNode.scrollLeft;
//					pos.y -= elem.parentNode.scrollTop;
					
//					pos.x -= elem.scrollLeft;
//					pos.y -= elem.scrollTop;
					
//					console.log("POS: ", pos, elem, elem.offsetLeft, elem.scrollLeft, elem.offsetTop, elem.scrollTop);
					
				} while (elem = elem.offsetParent);
			}
			if (!parent) {
//				console.log(">> POS: ", pos);
				return pos;
			}
		}
		
		if (parent && parent != element) {
			var ppos = Element.getPosition(parent);
//			console.log("ADD PARENT POS: ", pos, ppos);
			pos = {x: pos.x - ppos.x, y: pos.y - ppos.y}
		}
//		console.log("RETURN POS: ", pos);
		return pos;
	} 
	
	
	/**
	 * returns an object with border metrics.
	 * @static
	 * @method getBorderMetrics
	 * @param {benignware.core.Element} element
	 * @param {String} metricType
	 * @return {Object} an object containing the properties 'top', 'left', 'right' and 'bottom'
	 */
	Element.getBorderMetrics = function (element, metricType) {
		var result = {top:0, left:0, right:0, bottom:0}
		var metricTypes = [];
		for (var i = 1; i < arguments.length; i++) {
			if (arguments[i] != undefined) metricTypes.push(arguments[i]);
		}
		if (metricTypes.length == 0) {
			metricTypes = ["border"];
		}
		for (var i = 0; i < metricTypes.length; i++) {
			var metricsType = metricTypes[i];
			if (metricsType) {
				var widthExt = (metricsType == "border") ? "-width" : "";
				for (var x in result) {
					var propName = metricsType + "-" + x + widthExt;
					var s = Element.getComputedStyle(element, propName);
					var v = parseFloat(s);
					v = (v) ? v : 0;
					result[x]+=v;
				}
			}
		}
		return result;
	}
	
	/**
	 * sets the size of the specified element.
	 * @static
	 * @method setSize
	 * @param {benignware.core.Element} element the target element
	 * @param {Number} width
	 * @param {Number} height
	 * @return {Object} An Object containing the width and height of the component as properties x and y.
	 */
	Element.setSize = function(element, width, height) {
		Element.setWidth(element, width); 
		Element.setHeight(element, height);
	}
	
	/**
	 * Retrieves width and height of the specified element.
	 * @static
	 * @method getSize
	 * @param {benignware.core.Element} element the target element
	 * @return {Object} An Object containing the width and height of the component as properties x and y.
	 */
	Element.getSize = function(element) {
		return {
			width: Element.getWidth(element), 
			height: Element.getHeight(element)
		}
	}
	
	/**
	 * sets width of the specified element.
	 * @static
	 * @method setWidth
	 * @param {Element} element
	 * @param {Number} width
	 */
	Element.setWidth = function(element, width) {
		var w = parseFloat(width);
		w = !isNaN(w) && w >= 0 ? w : 0;
		element.style.width = w + "px";
	}
	
	/**
	 * returns width of the specified element.
	 * @static
	 * @method getWidth
	 * @param {Element} element
	 * @return {Number} width
	 */
	Element.getWidth = function(element) {
//		if (typeof element.width != "undefined") {
//			return element.width;
//		}
		if (Element.getComputedStyle(element, 'display') == 'none') {
			return 0;
		}
		var ws = Element.getComputedStyle(element, 'width');
		var w = ws.indexOf("px") >= 0 ? parseFloat(ws) : 0;
		if (!w || isNaN(w)) {
			var m = Element.getBorderMetrics(element, "border", 'padding');
			w = element.offsetWidth - m.left - m.right;
		}
		return w > 0 ? w : 0;
	}
	
	/**
	 * sets height of the specified element.
	 * @static
	 * @method setHeight
	 * @param {Element} element
	 * @param {Number} height
	 */
	Element.setHeight = function(element, height) {
		var h = parseFloat(height);
		h = !isNaN(h) && h >= 0 ? h : 0;
		element.style.height = h + "px";
	}
	
	/**
	 * gets height of the specified element.
	 * @static
	 * @method getHeight
	 * @param {Element} element
	 * @return {Number} height
	 */
	Element.getHeight = function(element) {
//		if (typeof element.height != "undefined") {
//			return element.height;
//		}
		if (Element.getComputedStyle(element, 'display') == 'none') {
			return 0;
		}
		var hs = Element.getComputedStyle(element, 'height');
		
		var h = hs.indexOf("px") >= 0 ? parseFloat(hs) : 0;
		
		if (!h || isNaN(h)) {
			var m = Element.getBorderMetrics(element, 'border', 'padding');
			h = element.offsetHeight - m.top - m.bottom;
		}
		return h > 0 ? h : 0;
	}
	
	
	
	Element.setOuterWidth = function(element, width) {
		var b = Element.getBorderMetrics(element, 'margin', 'padding', 'border');
		Element.setWidth(element, width - b.left - b.right);
	}
	
	Element.getOuterWidth = function(element) {
		if (Element.getComputedStyle(element, 'display') == 'none') {
			return 0;
		}
		var width = Element.getWidth(element);
		var b = Element.getBorderMetrics(element, 'margin', 'padding', 'border');
		return width + b.left + b.right;
	}
	
	Element.setOuterHeight = function(element, height) {
		var b = Element.getBorderMetrics(element, 'margin', 'padding', 'border');
		Element.setHeight(element, height - b.top - b.bottom);
	}
	
	Element.getOuterHeight = function(element) {
		if (Element.getComputedStyle(element, 'display') == 'none') {
			return 0;
		}
		var height = Element.getHeight(element);
		var b = Element.getBorderMetrics(element, 'margin', 'padding', 'border');
		return height + b.top + b.bottom;
	}
	
	Element.getOuterSize = function(element) {
		return {
			width: Element.getOuterWidth(element), 
			height: Element.getOuterHeight(element)
		}
	}
	
	Element.getDocumentSize = function(doc) {
		doc = doc.document || doc.ownerDocument || document;
		var win = doc.defaultView;
		if (win) {
			if (typeof(win.innerWidth) != "undefined") {
				return {
					width: win.innerWidth, 
					height: win.innerHeight
				}
			} else if (doc.documentElement.clientWidth) {
				return {
					width: doc.documentElement.clientWidth, 
					height: doc.documentElement.clientHeight
				};
			} else {
				return {
					width: doc.getElementsByTagName('body')[0].clientWidth,
					height: doc.getElementsByTagName('body')[0].clientHeight
				};
			}
		}
		return {w: 0, h: 0};
	}
	
	
	Element.show = function(element) {
		element.style.display = "";
	}
	
	Element.hide = function(element) {
		element.style.display = "none";
	}
	
	
	/**
	 * adds a css selector to an element.
	 * @static
	 * @method addCSSName
	 * @param {Element} element an element
	 * @param {String} string a css selector
	 */
	Element.addCSSName = function(element, string) {
		if (element && typeof(element.className) == 'string' && string) {
			if (!Element.hasCSSName(element, string)) {
				element.className = element.className.length ? element.className + " " + string : string;
			}
		}
		
	}
	
	/**
	 * removes the specified css selector from an element.
	 * @static
	 * @method removeCSSName
	 * @param {Element} element an element
	 * @param {String} string a css selector
	 */
	Element.removeCSSName = function(element, string) {
		if (!element) return;
		var cssNames = Element.getCSSNames(element);
		for (var i = 0; i < cssNames.length; i++) {
			if (cssNames[i] == string) {
				cssNames.splice(i, 1);
				i--;
			}
		}
		element.className = cssNames.join(" ");
	}
	
	/**
	 * retrieves all css selectors of the element
	 * @static
	 * @method getCSSNames
	 * @param {Element} element an element
	 * @return {Array} an array containing css selectors
	 */
	Element.getCSSNames = function(element) {
		return element && typeof element.className == 'string' ? element.className.split(/\s+/) : [];
	}
	
	/**
	 * checks whether the element contains the specified css selector.
	 * @static
	 * @method hasCSSName
	 * @param {Element} element the element
	 * @return {Boolean} true, if the element contains the css selector.
	 */
	Element.hasCSSName = function(element, string) {
		if (typeof element.className == 'string') {
			var cssNames = Element.getCSSNames(element);
			for (var i = 0; i < cssNames.length; i++) {
				if (cssNames[i] == string) {
					return true;
				}
			}
		}
		return false;
	}
	
	
	/**
	 * toggles the specified css selector on the element.
	 * @static
	 * @method toggleCSSName
	 * @param {Element} element
	 * @param {String} the css selector
	 */
	Element.toggleCSSName = function(element, string){
		if (Element.hasCSSName(element, string)) {
			Element.removeCSSName(element, string);
		} else {
			Element.addCSSName(element, string);
		}
	}
	
	var readyFlag = false;

	function ready() {
		if (!readyFlag) {
			readyFlag = true;
			// doc ready
			if (Element.parseOnReady) {
				Element.parseDOM(document);
			}
			
			Element.dispatchEvent(document, Event.create(document, 'ready', false, false));
		}
	}
	
	// TODO: check for duplicate imports

	Element.addEventListener(window, 'DOMContentLoaded', ready);
	Element.addEventListener(window, 'load', ready);
	
	return Element;
	
})();
(function() {
	
	
	
	var Class = benignware.core.Class;
	var StringUtils = Class.require('benignware.util.StringUtils');
	var Element = Class.require("benignware.core.Element");
	
	var vendorPrefixes = ['Webkit', 'Moz', 'O', 'Ms'];
	
	/**
	 * CSS utility methods
	 * @class benignware.util.CSS
	 */
	
	function CSS() {
	}

	Class.register("benignware.util.CSS", CSS);
	
	var defaultStylesheet = null;
	
	/**
	 * registers a default style by inserting at the beginning of the document's head
	 * @static
	 * @method setDefaultStyle
	 * @param {String} cssSelector
	 * @param {String} styleName
	 * @param {String} styleValue
	 */
	CSS.setDefaultStyle = function(cssSelector, styleName, styleValue) {
		
		
		if (!defaultStylesheet) {
			
			// create default stylesheet
			var doc = document;
			var styleElement = doc.createElement("style");
			styleElement.setAttribute("type", "text/css");
			var headElement = doc.getElementsByTagName("head")[0];
			if (headElement != null) {
				if (headElement.childNodes.length) {
					headElement.insertBefore(styleElement, headElement.firstChild);
				} else {
					headElement.appendChild(styleElement);
				}
			}
			
			defaultStylesheet = styleElement.sheet;
		}
		
		
		if (styleName == "float") {
			styleName = document.documentElement.style.styleFloat ? 'styleFloat' : 'cssFloat';
		}
		
		CSS.setStyle(defaultStylesheet, cssSelector, styleName, styleValue);
	}
	
	
	CSS.setStyle = function(stylesheet, cssSelector, styleName, styleValue) {
		
		
		var camelCaseName = StringUtils.toCamelCase(styleName);
		var hyphenatedName = StringUtils.hyphenate(styleName);
		var cssRule = CSS.getRule(stylesheet, cssSelector);
		
		if (!cssRule) {
			
			var cssText = "" + hyphenatedName + ": " + styleValue + ";";
			CSS.addRule(stylesheet, cssSelector, cssText);
			cssRule = CSS.getRule(stylesheet, cssSelector);
			
		}

		
		if (!cssRule) return;
		
//		if (!cssRule.style[hyphenatedName]) {
//			cssRule.style[hyphenatedName] = styleValue;
//
//		}
//		if (!cssRule.style[camelCaseName]) {	

			cssRule.style[camelCaseName] = styleValue;
//		}
	}
	
	CSS.getRules = function (stylesheet) {
		// TODO: cache function
		try {
			if (stylesheet.rules) {
				return stylesheet.rules;
			} else if (stylesheet.cssRules) {
				return stylesheet.cssRules;
			}
		} catch (e) {}
		return null;
	}
	
	CSS.addRule = function (stylesheet, cssSelector, cssText) {
		// TODO: cache function
		
		try {
			if (stylesheet.addRule) {
				
				stylesheet.addRule(cssSelector, cssText);
			} else if (stylesheet.insertRule) {
				stylesheet.insertRule(cssSelector+" {"+cssText+"}", stylesheet.cssRules.length);
			}
		} catch (e) {
			
		}

	}
	
	CSS.getRule = function (stylesheet, cssSelector) {
		var rules = CSS.getRules(stylesheet);
		
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i];
			
			if (rule.selectorText.toLowerCase() == cssSelector.toLowerCase()) {
				
				return rule;
			}
		}
		return null;
	}
	
	
	
	CSS.matchSelector = function(element, selector) {
		
	}
	
	/**
	 * retrieves a vendor style name. 
	 * returns null, if the style isn't supported.
	 * @static
	 * @method getVendorStyle
	 * @param {String} styleName the style name
	 * @param {Boolean} hyphenated specifies whether the result should be hyphenated
	 * @return {String} the vendor style name
	 */
	CSS.getVendorStyle = (function() {
		
		
		var cache = [];
		
		var elem = document.createElement('div');
		document.documentElement.appendChild(elem);
		
		function getVendorStyle (styleName) {

			styleName = StringUtils.toCamelCase(styleName);
			
			result = null;
			
			if (typeof cache[styleName] != 'undefined') {
				result = cache[styleName];
			}
			
			if (!result) {
				if (typeof (elem.style[styleName]) == 'string') {
					cache[styleName] = styleName;
					result = styleName;
				}
			}
			
			if (!result) {
				var capitalized = styleName.substring(0, 1).toUpperCase() + styleName.substring(1);
				for (var i = 0; i < vendorPrefixes.length; i++) {
					var prop = vendorPrefixes[i] + capitalized;
					if (typeof elem.style[prop] == 'string') {
						cache[styleName] = prop;
						result = prop;
						break;
					}
				}
			}
			
			cache[styleName] = result;
			
			return result;
		}

		return getVendorStyle;
	})();
	
	CSS.isSupported = function(styleName) {
		return typeof CSS.getVendorStyle(styleName) == 'string';
	}

	CSS.getTransformMatrix = function(string) {
		var p = ['a', 'b', 'c', 'd', 'x', 'y'];
		if (typeof string == "string") {
			var re = new RegExp(/^matrix\(\s*(-?\d*),?\s*(-?\d*),?\s*(-?\d*),?\s*(-?\d*),?\s*(-?[\d\.]*)(?:px)?,?\s*(-?[\d\.]*)(?:px)?/);
			var match = string.match(re);
			if (match) {
				var result = {}
				for (var i = 0; i < p.length; i++) {
					result[p[i]] = parseInt(match[i + 1]);
				}
				return result;
			}
		}
		return {
			a: 1, b: 0, c: 0, d: 1, x: 0, y: 0
		}
	}
	
	CSS.getTextSize = function(element, text) {
		console.log("get text size", Element.getComputedStyle);
		var doc = element.ownerDocument;
		var testElem = doc.createElement("div");
		testElem.style.position = "absolute";
		testElem.style.fontSize = Element.getComputedStyle(element, "font-size");
		testElem.style.fontFamily = Element.getComputedStyle(element, "font-family");
		testElem.style.padding = "0px";
		testElem.style.margin = "0px";
		testElem.style.border = "1px solid black";
		doc.body.appendChild(testElem);
		testElem.innerHTML = text;
		var offsetWidth = testElem.offsetWidth - 2;
		var offsetHeight = testElem.offsetHeight - 2;
		doc.body.removeChild(testElem);
		return {
			width: offsetWidth, 
			height: offsetHeight
		}
	}
	
	return CSS;
	
})();
(function() {
	
	var Class = benignware.core.Class;
	var StringUtils = Class.require("benignware.util.StringUtils");
	var ArrayUtils = Class.require("benignware.util.ArrayUtils");
	var Element = Class.require("benignware.core.Element");
	
	/**
	 * DOM utility methods
	 * @package benignware.util
	 * @class DOM
	 */
	
	function DOM() {
	}
	
	Class.register('benignware.util.DOM', DOM);
	
	DOM.NAMESPACE_XML = "http://www.w3.org/2000/xmlns/";
	DOM.NAMESPACE_XHTML = "http://www.w3.org/1999/xhtml";
	
	
	/**
	 * Checks if the specified element is a childnode of the specified parent.
	 * @static
	 * @method isChildOf
	 * @param {benignware.core.Element} child
	 * @param {benignware.core.Element} parent
	 * @return {Boolean} true if the specified element is a child of the specified parent
	 */
	DOM.isChildOf = function(child, parent) {
		if (parent == child) return false;
		var c = child;
		try {
			while (c) {
				//if (c==child.ownerDocument.body) return false;
				if (child.ownerDocument != null && c == child.ownerDocument.documentElement) return false;
				if (c.parentNode == parent) return true;
				if (c.parentNode == null) return false; 
				c = c.parentNode;
				
			}
		} catch (e) {
			//console.error(e);
		}
		return false;
	}
	
	DOM.getElementsByTagName = function(element, tagName, recursive){
		return DOM.getElementsByTagNameNS(element, null, tagName, recursive);
	}
	
	DOM.getElementsByTagNameNS = function(element, namespaceURI, tagName, recursive) {
		recursive = (typeof(recursive) != "undefined") ? recursive : true;
		var result = [];
		if (!element) return result;
		tagName = tagName.toLowerCase();
		element = (typeof(element.ownerDocument) == "undefined") ? element.documentElement : element;
		for (var i=0;i<element.childNodes.length;i++) {
			var node = element.childNodes[i];
			if (node.nodeType == 1) {
				if (namespaceURI && node.namespaceURI == namespaceURI || !namespaceURI) {
					var localName = DOM.getLocalName(node);
					if (localName != null && localName.toLowerCase() == tagName) { 
						result.push(node);
					}
				}
				if (recursive) {
					var r = DOM.getElementsByTagNameNS(node, namespaceURI, tagName, recursive);
					if (r.length) result = result.concat(r);
				}
			}
		}
		return result;
	}
	
	
	DOM.getParentByClass = function(element, classObj) {
		if (element) {
			var node = element.parentNode;
			while(node) {
				if (node && Class.instanceOf(node, classObj)) {
					return node;
				}
				node = node.parentNode;
			}
		}
		
		return null;
	}
	
	DOM.getParentByTagName = function(elem, tagName) {
		var node = elem;
		while(node != null && node.parentNode != null) {
			node = node.parentNode;
			if (node.nodeName.toLowerCase() == tagName.toLowerCase()) return node;
			if (node == elem.ownerDocument) break;
		}
		return null;
	}
	
	DOM.getElementsByCSSName = function(elem, cssName) {
		var result = [];
		for (var i = 0; i < elem.childNodes.length; i++) {
			var child = elem.childNodes[i];
			if (child.nodeType == 1) {
				if (child.style) {
					if (Element.hasCSSName(child, cssName)) {
						result.push(child);
					}
				}
				result = result.concat(DOM.getElementsByCSSName(child, cssName));
			}
		}
		return result;
	}
	
	DOM.getParentElementByCSSName = function(elem, cssName) {
		while(elem.parentNode != null) {
			elem = elem.parentNode;
			if (Element.hasCSSName(elem, cssName)) return elem;
		}
		return null;
	}
	
	
	/**
	 * returns the deepest single element
	 */
	DOM.getDeepestElement = function (element, single, first, nodeType) {
		single = typeof(single) == "undefined" ? true : single;
		first = typeof(first) == "undefined" ? true : first;
		nodeType = typeof(nodeType) == "undefined" ? 1 : nodeType;
		while (element) {
			var nodes = element.childNodes;
			if (nodes.length > 0) {
				var child = first ? element.firstChild : nodes[nodes.length - 1];
				if ((!single || nodes.length == 1) && (!nodeType || child.nodeType == nodeType)) {
					element = child;
				} else {
					break;
				}
			} else {
				break;
			}
		}
		return element;
	}
	
	DOM.isComplexElement = function(element) {
		return ArrayUtils.filter(element.attributes, function(obj) {
			return obj.name != 'xmlns';
		}).length > 0 || ArrayUtils.filter(element.childNodes, function(obj) {
			return obj.nodeType == 1;
		}).length > 0;
	}
	
	DOM.isSimpleElement = function(node) {
		return !DOM.isComplexElement(node);
	}
	
	
	DOM.toJSON = function(node, listTypes) {
		listTypes = listTypes || [];
		excludedAttributes = ['xmlns'];
		var result = {}
		if (node.attributes) {
			for (var i = 0; i < node.attributes.length; i++) {
				var attr = node.attributes[i];
				var name = attr.name;
				if (!ArrayUtils.contains(excludedAttributes, name)) {
					result[name] = attr.value;
				}
			}
		}
		if (node.childNodes) {
			for (var i = 0; i < node.childNodes.length; i++) {
				var child = node.childNodes[i];
				
				if (child.nodeType == 1) {
					var name = child.nodeName;
					var isComplex = DOM.isComplexElement(child);
					
					if (!listTypes.length && isComplex || ArrayUtils.contains(listTypes, name)) {
						
						var listName = StringUtils.pluralize(name);
						var obj = DOM.toJSON(child, listTypes);
						var array = result[listName];
						if (!array) {
							
							result[listName] = array = [];
						}
						array.push(obj);
					} else {
						if (!ArrayUtils.contains(excludedAttributes, name)) {
							if (DOM.isSimpleElement(child)) {
								result[name] = child.textContent;
							} else {
								result[name] = DOM.toJSON(child, listTypes);
							}
						}
					}

				}
			}
		}
		
		return result;
	}
	
	
	DOM.serializeToString = function(node) {
		
		if (typeof node.xml != "undefined") {
	        return node.xml;
	    } else if (typeof window.XMLSerializer != "undefined") {
	        return (new window.XMLSerializer()).serializeToString(node);
	    } 

		return null;
	}

	
	DOM.parseFromString = function(string, contentType) {

		contentType = contentType || "text/xml";
		var result = null;
		if (typeof string != "string") {
			return null;
		}
		string = StringUtils.trim(string);
		if (!StringUtils.startsWith(string, "<")) {
			return null;
		}
		if (typeof DOMParser != "undefined") {
			// has dom parser
			
			
			var parser = new DOMParser();
			if (!window.opera) {
				//contentType != "text/html" && 
				try {  
			        // WebKit returns null on unsupported types  
					
					result = parser.parseFromString(string, contentType);
					
			    } catch (ex) {
			    	console.error(ex);
			    }
			}
			
		    
		    if (result) {  
	            // text/html parsing is natively supported  
	            return result;  
	        }  
			
		    if (/^\s*text\/html\s*(?:;|$)/i.test(contentType)) {  
		    	
	            var doc = document.implementation.createHTMLDocument("")
	              , doc_elt = doc.documentElement
	              , first_elt;

	            var div = doc.createElement('div');
	            div.innerHTML = string;
	            
	            var b = doc.body;

	            for (var i = 0; i < div.childNodes.length; i++) {
	            	var child = div.childNodes[i];
	            	var tagName = child.nodeName.toLowerCase();
					if (tagName != "meta" && tagName != "link" && tagName != "title" && tagName != "script") {
						doc.body.appendChild(child);
						i--;
					} else {
						console.log("eliminate script tag");
					}
	            	
	            }

	            return doc;  
	        }

		} else {
			if (typeof ActiveXObject != "undefined") {
				// ie
		         var doc = new ActiveXObject("MSXML.DomDocument");
		         doc.loadXML(str);
		        result = doc;
			} else if (typeof XMLHttpRequest != "undefined") {
		         var req = new XMLHttpRequest;
		         req.open("GET", "data:" + (contentType || "application/xml") +
		                         ";charset=utf-8," + encodeURIComponent(str), false);
		         if (req.overrideMimeType) {
		            req.overrideMimeType(contentType);
		         }
		         req.send(null);
		         result = req.responseXML;
			}
		}
		
		
		if (result && result.documentElement && result.documentElement.nodeName === "parsererror") {
			return null;
		}
		return result;
	}
	
	DOM.unescape = function(element) {

		element = element.documentElement || element; 
		  
		if (element.nodeType == 3 || element.nodeType == 4) {
			var typeAttrValue = element.parentNode.getAttribute("type");
			var namespaceURI = typeAttrValue && typeAttrValue.indexOf("html") >= 0 ? DOM.NAMESPACE_XHTML : element.parentNode.namespaceURI;
			
			var html = DOM.parseFromString("<html><body>" + element.nodeValue + "</body></html>", "text/html");
			
			var body = html.getElementsByTagName("body")[0];
			var children = body.childNodes;
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				var imported = element.ownerDocument.importNode(child, true);
				if (imported.nodeType == 1) {
					imported.setAttribute("xmlns", namespaceURI);
				}
				element.parentNode.insertBefore(imported, element);
			}
			element.parentNode.removeChild(element);
		} else if (element.nodeType == 1) {
			for (var i = 0; i < element.childNodes.length; i++) {
				var child = element.childNodes[i];
				DOM.unescape(child);
			} 
		}
		
	}
	
	DOM.unescapeCData = function(elem, namespaceURI) {
		if (!elem) {
			return;
		}
//		var namespaceURI = namespaceURI || "http://www.w3.org/1999/xhtml";
		var namespaceURI;
		var string = StringUtils.trim(elem.nodeValue);
		if (string) {
			// unescape textnode
			if (elem.nodeType == 4) {
				// cdata
				var fragment = DOM.parseFromString(elem.ownerDocument, string, "text/html");
				var div = elem.parentNode.ownerDocument.createElement("div");
				div.setAttribute("xmlns", namespaceURI);
				div.appendChild(fragment);
				elem.parentNode.appendChild(div);
				elem.parentNode.removeChild(elem);
			}
		}
		
		
		if (elem.childNodes) {
			for (var i = 0; i < elem.childNodes.length; i++) {
				DOM.unescapeCData(elem.childNodes[i]);
			}
		}
		
	}
	
	DOM.stripAttributes = function(elem, attributes) {
		if (!elem) {
			return;
		}
		elem = elem.documentElement ? elem.documentElement : elem;
		if (elem.nodeType == 1) {
			for (var a = 0; a < attributes.length; a++) 
				elem.removeAttribute(attributes[a]);
			
			for (var i = 0; i < elem.childNodes.length; i++) 
				DOM.stripAttributes(elem.childNodes[i], attributes);
		}
		return elem;
	}
	
	DOM.next = function(element) {
		if (element.firstChild) {
			return element.firstChild;
		}
		if (element.nextSibling) {
			return element.nextSibling;
		}
		while (element.parentNode) {
			if (element.parentNode.nextSibling) {
				return element.parentNode.nextSibling;
			}
			element = element.parentNode;
		}
		return null;
	}
	
	DOM.previous = function(element) {
		
		if (element.previousSibling) {
			if (element.previousSibling.lastChild) {
				return element.previousSibling.lastChild;
			}
			return element.previousSibling;
		}
		
		if (element.parentNode) {
			if (element.parentNode.firstChild == element) {
				return element.parentNode;
			}
		}
		while (element.parentNode) {
			if (element.parentNode.previousSibling) {
				return element.parentNode.previousSibling;
			}
			element = element.parentNode;
		}
		return null;
	}
	
	return DOM;
})();
(function() {
	// import classes
	var Class = benignware.core.Class;
	var EventDispatcher = Class.require("benignware.core.EventDispatcher");
	var Event = Class.require("benignware.core.Event");
	var Element = Class.require("benignware.core.Element");
	var UserAgent = Class.require("benignware.util.UserAgent");
//	var Component = Class.require("benignware.core.Component");
	
//	var Delegate = Class.require("benignware.util.Delegate");
//	var CSS = Class.require("benignware.util.CSS");
//	var DOM = Class.require("benignware.util.DOM");
//	var Loader = Class.require("benignware.util.Loader");
//	
//	var Element = Class.require("benignware.core.Element");
//	var StringUtils = Class.require("benignware.util.StringUtils");
//	var ArrayUtils = Class.require("benignware.util.ArrayUtils");
	
	// define super
	var _parent;
	var brokenImages = [];

	/**
	 * Constructs a new ImageLoader element
	 * @constructor
	 */
	function ImageLoader(elem) {
		
		_parent.apply(this, arguments);
		
		var items = [];
		var isLoading = false;
		var imageLoader = this;
		
		function errorHandler(event) {
			
			var img = event.target;

			Element.addCSSName(img, 'error');
			
			Element.removeEventListener(img, 'complete', loadHandler);
			Element.removeEventListener(img, 'load', loadHandler);
			Element.removeEventListener(img, 'error', errorHandler);
			
			var errorEvent = new Event(ImageLoader.ERROR);
			errorEvent.element = img;
			imageLoader.dispatchEvent(errorEvent);
			
			if (imageLoader.isLoading() && imageLoader.isComplete()) {
				// complete
				isLoading = false;
				complete.call(imageLoader);
			}
		}
		
		function loadHandler(event) {
			
			event = Event.normalize(event);
			
			var img = event.target;

			
			Element.removeEventListener(img, 'load', loadHandler);
			Element.removeEventListener(img, 'error', errorHandler);
			
			window.setTimeout(function() {
				
				loaded.call(imageLoader, img);
				
				Element.removeCSSName(img, 'error');
				
				if (imageLoader.isLoading() && imageLoader.isComplete()) {
					Element.removeEventListener(img, 'complete', loadHandler);
					// complete
					isLoading = false;
					complete.call(imageLoader);
				}
			}, 1);
			
		}
		
		function loadElement(elem) {
			
			
			
			var lazy = false;
			var img = null;
			
			if (elem.isLoadable && elem.isLoadable()) {
				img = elem;
			} else if (elem.nodeName.toLowerCase() == 'img') {
				img = elem;
				
				
			} else {
				img = getCSSLoaderImageElem(elem);
			}

			Element.removeEventListener(img, 'load', loadHandler, false);
			Element.removeEventListener(img, 'complete', loadHandler, false);
			Element.removeEventListener(img, 'error', errorHandler, false);

			if (!img) {
				return;
			}
			
			if (elem.nodeName.toLowerCase() == 'img') {
				
				var src = img.getAttribute("src");

				
				
//				if (this.urlCaching) {
//					
//					if (urlCache[src]) {
//						// src was loaded before
//						return;
//					} else {
//						urlCache[src] = true;
//					}
//					
//				}
				
//				console.log("load elem", src);
				
				// image
				if (!src) {
					
					
					
					// lazy load image
					var src = ImageLoader.getResolutionSource(img);
//					console.log("lazy load loadElement: ", src);
					img.removeAttribute("data-source");
					if (src) {
						lazy = true;
						img.setAttribute("src", src);
					} else {
						// url is empty
						return;
					}
					
				} else {
					// image is already loading
					
				}

			}
			
			if (!ImageLoader.isComplete(img)) {
				
				Element.addEventListener(img, 'load', loadHandler, false);
				Element.addEventListener(img, 'complete', loadHandler, false);
				Element.addEventListener(img, 'error', errorHandler, false);
				
			} else {
//				console.log('is complete');
				
				if (lazy) {
					loaded.call(imageLoader, img);
				}
			}
			 
			
			if (!isLoading) {
				isLoading = true;
				loadStart.call(this);
			}
		}
		

		/**
		 * returns true if load is in progress
		 * @method isLoading
		 */
		this.isLoading = function() {
			return isLoading;
		}
		
		/**
		 * returns true if all items have been loaded.
		 */
		this.isComplete = function() {
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (!ImageLoader.isComplete(item)) {
					return false;
				}
			}
			return true;
		}
		
		
		this.add = function(item, index) {

//			console.log("ImageLoader::add() ", item, items);
			
			index = typeof(index) != "undefined" ? index : items.length;

			var start = false;
			
//			for (var e = 0; e < itemsToAdd.length; e++) {
				
//				item = itemsToAdd[e];
				
				items.splice(index, 0, item);
				
				// get loadable elements
				var elements = getLoadableElements(item);
				
				for (var i = 0; i < elements.length; i++) {
					
					var elem = elements[i];
					
//					console.log("ImageLoader::add() elem: ", elem, isElementLoaded.call(this, elem));
					
					if (!isElementLoaded.call(this, elem)) {
						
						loadElement.call(this, elem);

					} else {
						
						// complete
						// find error images
						
						
					}
				}
//			}
		}
		
		this.remove = function(item) {
			if (items && items.length) {
				for (var i = 0; i < items.length; i++) {
					if (item == items[i]) {
						items.splice(i, 1);
						i--;
					}
				}
			}
		}

		// end constructor
	}

	Class.register("benignware.util.ImageLoader", ImageLoader);

	Class.extend(EventDispatcher, ImageLoader);
	
	_parent = Class.getParent(ImageLoader);
	
	ImageLoader.LOAD = "load";
	ImageLoader.ERROR = "error";
	ImageLoader.LOAD_START = "loadStart";
	ImageLoader.COMPLETE = "complete";
	
	var urlCache = [];
	var resolutions = [];
	
	ImageLoader.prototype.errors = null;
	ImageLoader.prototype.urlCaching = true;
	
	ImageLoader.registerResolution = function(name, res) {
		if (typeof(res) == "string") {
			var sp = res.split("x");
			res = {
				name: name, 
				width: parseInt(sp[0]), 
				height: parseInt(sp[1])
			}
			resolutions.push(res);
		}
	}
	
	ImageLoader.registerResolution('small', '320x480');
	ImageLoader.registerResolution('medium', '768x1024');
	ImageLoader.registerResolution('large', '1680x1050');
	ImageLoader.registerResolution('big', '1920x1200');
	
	ImageLoader.getResolutionProfile = function() {
		var userAgent = UserAgent.getInstance();
		var screen = userAgent.pixelResolution;
		
		// TODO: order resolutions
		var res = null;
		for (var i = 0; i < resolutions.length; i++) {
//			console.log("resolutions[x]: ", screen.width, screen.height, resolutions[x].width, resolutions[x].height);
			if (screen.width <= resolutions[i].width && screen.height <= resolutions[i].height) {
				res = resolutions[i];
				break;
			}
		}
		if (res == null) {
			res = resolutions[resolutions.length - 1];
		}
		if (res) {
			return res;
		}
		return null;
	}
	
	ImageLoader.getResolutionSource = function(elements) {
		
		elements = elements.length ? elements : [elements];
		
		var userAgent = UserAgent.getInstance();
	
		
		var attrName = null;

//		alert("screen: " + screen.width + ", " + screen.height + "\n" 
//				+ "rec: " + res.width + ", " + res.height + ", " + resName);
		
		var value = null;
		
		var res = ImageLoader.getResolutionProfile();
		if (res && res.name) {
			// get data-source resolution
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];
				
				if (typeof(element[res.name]) != 'undefined') {
					value = element[res.name];
					break;
				}
				if (element.nodeType == 1) {
					value = element.getAttribute("data-source-" + res.name);
					
					if (value) {
						break;
					}
				}
				
			}
		}

		if (!value) {
			// get data-source
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];
				
				if (typeof(element['source']) != 'undefined') {
					value = element['source'];
					break;
				}
				if (element.nodeType == 1) {
					var attrValue = element.getAttribute("data-source");
					
					if (attrValue) {
						value = attrValue;
						break;
					}
				}
			}
		}
		
		if (!value) {
			// get src
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];
				if (element.nodeType == 1) {
					var attrValue = element.getAttribute("src");
					if (attrValue) {
						value = element.getAttribute(attrName);
						break;
					}	
				}
			}
		}
		return value;
	}
	
	function isLoadable(elem) {
		
		if (elem.nodeType != 1) return false;
		
		// image
		if (elem.nodeName.toLowerCase() == "img") {
			return true;
		}
		
		// css-image
		if (getCSSImage(elem)) {
			return true;
		}

		// loadable component
		if (elem.isLoadable && elem.isLoadable()) {
			return true;
		}
		

		return false;
	}
	
	function getLoadableElements(elem) {
		var result = [];
		if (elem) {
			if (isLoadable(elem)) {
				result.push(elem);
			} else {
				for (var i = 0; i < elem.childNodes.length; i++) {
					var child = elem.childNodes[i];
					result = result.concat(getLoadableElements.call(this, child));
				}
			}
		}
		return result;
	}
	
	
	function getCSSImage(elem) {
		var bgImgStyle = Element.getComputedStyle(elem, 'background');
		if (!bgImgStyle && elem.style) {
			bgImgStyle = elem.style.backgroundImage;
		}
		if (bgImgStyle && bgImgStyle != 'none') {
			var match = /url\(["]?([^"]*)["]?\)/g.exec(bgImgStyle);
			if (match != null) {
//				console.log("LOAD ELEM: ", elem, bgImgStyle);
				return match[1];
			}
		}
		return null;
	}
	
	function getCSSLoaderImageElem(elem) {
		var url = getCSSImage(elem);
		var img = null;
		if (url) {
			var doc = elem.ownerDocument;
			for (var i = 0; i < doc.body.childNodes.length; i++) {
				var child = doc.body.childNodes[i];
				if (child.nodeName.toLowerCase() == 'img' 
					&& child.getAttribute('src') == url) {
					img = child;
					break;
				}
			}
			if (!img) {
				img = doc.createElement('img');
				img.setAttribute('src', url);
				img.style.display = "none";
				doc.body.appendChild(img);
			}	
		}
		return img;
	}
	
	function isElementLoaded(elem) {
		
		var img = null;
		
		// css image

		if (elem.nodeName.toLowerCase() == 'img') {
			img = elem;
		} else {
			img = getCSSLoaderImageElem(elem);
		}
		
		if (!img) {
			return true;
		}
		
		var src = img.getAttribute('src');
		
		if (src == null && img.getAttribute("data-source") != null) {
			
			return false;
			
		} else if (typeof(img.complete) != "undefined") {
			
			return img.complete === true;
			
	    } else if (img.naturalHeight && img.naturalWidth) {
	    	return true;
		}
	    
	    return true;

	}
	
	function loadStart(elem) {
		var loadStartEvent = new Event(ImageLoader.LOAD_START, false, false);
		this.dispatchEvent(loadStartEvent);
	}
	
	function loaded(elem) {
		var loadEvent = new Event(ImageLoader.LOAD, false, false);
		loadEvent.element = elem;
		this.dispatchEvent(loadEvent);
	}
	
	function complete() {
		this.dispatchEvent(new Event(ImageLoader.COMPLETE, false, false));
	}
	
	ImageLoader.hasErrors = function(img) {
		return (img.getAttribute('src') && img.complete && img.naturalWidth == 0);
	}
	
	ImageLoader.isComplete = function(elem) {
		
		if (elem.nodeType == 1) {
			
			var images = getLoadableElements(elem);
			
			if (images.length) {
				var result = true;
				for (var i = 0; i < images.length; i++) {
					var img = images[i];
					
					if (!isElementLoaded.call(this, img)) {
						return false;
					} else {
						// complete
					}
				}
				
				return result;
			}
			return true;
		}
		return true;
	}
	
	return ImageLoader;
})();
(function() {
	
	var Class = benignware.core.Class;
	
	/**
	 *  the Point class
	 *  @class benignware.geom.Point
	 */
	
	return Class.create('benignware.geom.Point', (function() {
		
		/**
		 * @constructor
		 * @param {Number} x
		 * @param {Number} y
		 */
		function Point(x, y) {
			
			this.x = x;
			this.y = y;
			
		}
		
		/**
		 * returns the distance between two points.
		 * @static
		 * @method distance 
		 * @param {Object} p1 first point
		 * @param {Object} p2 second point 
		 */
		Point.distance = function(p1, p2) {
			var xs = p2.x - p1.x;
			var ys = p2.y - p1.y;
			return Math.sqrt( xs * xs + ys * ys );
		}
		
		return Point;
		
	})(), {
		/**
		 * returns the distance to the specified point.
		 * @method distance 
		 * @param {Point} point
		 */
		distance: function(point) {
			Point.distance(this, point);
		}
	});

})();
(function() {
	
	var Class = benignware.core.Class;
	var Point = Class.require('benignware.geom.Point');
	
	/**
	 *  the Vector class
	 *  @class benignware.geom.Vector
	 */
	
	Class.create('benignware.geom.Vector', Point, (function() {
		
		/**
		 * @constructor
		 * @param {Number} x the x-coordinate
		 * @param {Number} y the y-coordinate
		 */
		function Vector(x, y) {
			
			this.x = x;
			this.y = y;
		}

		return Vector;
		
	})(), {
		/**
		 * returns a copy of the vector
		 * @method clone
		 */
		clone: function () {
			return new Vector(this.x, this.y);
		}, 
		/**
		 * scales the vector to the specified length
		 * @method scale
		 * @param {Number} length
		 */
		scale: function (length) {
			this.x = this.x * length;
			this.y = this.y * length;
		}, 
		/**
		 * normalizes the vector
		 * @method normalize
		 */
		normalize: function() {
			this.scale(1 / this.magnitude());
		}, 
		/**
		 * returns the vector's magnitude
		 * @method magnitude
		 */
		magnitude: function () {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		}
	});
	
})();
(function() {
	
	/**
	 * basic geometric shapes and vector utility methods
	 * @package benignware.geom
	 */
	
	var Class = benignware.core.Class;
	var Point = Class.require('benignware.geom.Point');
	
	/**
	 *  the Circle class
	 *  @class benignware.geom.Circle
	 *  @extends benignware.geom.Point
	 */
	
	return Class.create('benignware.geom.Circle', Point, (function() {
		
		/**
		 * @constructor
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} radius
		 */
		function Circle(x, y, radius) {
			
			this.x = x;
			this.y = y;
			this.radius = radius;
			
		}
		
		
		/**
		 * tests if two circles intersect
		 * @static
		 * @method distance 
		 * @param {Object} c1 the first circle
		 * @param {Object} c2 the second circle 
		 */
		Circle.intersect = function(c1, c2) {
			return false;
		}
		
		return Circle;
		
	})());

	
	
})();
(function() {
	
	var Class = benignware.core.Class;
	
	/**
	 *  the Rectangle class
	 *  @class benignware.geom.Rectangle
	 */
	
	return Class.create('benignware.geom.Rectangle', (function() {
		
		/**
		 * @constructor
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Number} width the width of the rectangle
		 * @param {Number} height the height of the rectangle
		 */
		function Rectangle(x, y, width, height) {
			
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			
		}
		
		/**
		 * tests if two Rectangles intersect
		 * @static
		 * @method distance 
		 * @param {Object} r1 the first Rectangle
		 * @param {Object} r2 the second Rectangle 
		 */
		Rectangle.intersect = function(r1, r2) {
			return (r1.x <= r2.x + r2.width &&
			          r2.x <= r1.x + r1.width &&
			          r1.y <= r2.y + r2.height &&
			          r2.y <= r1.y + r1.height);
		}
		
		return Rectangle;
		
	})());

	
	
})();
(function() {
	
	var Class = benignware.core.Class;
	var Element = Class.require('benignware.core.Element');
	
	/**
	 * base layout class
	 * @class Layout
	 */
	function Layout(element, orientation, horizontalAlign, verticalAlign) {
		
		this.element = element;
		
		this.orientation = orientation || Layout.ORIENTATION_HORIZONTAL;
		this.verticalAlign = verticalAlign || Layout.ALIGN_CENTER;
		this.horizontalAlign = horizontalAlign || Layout.ALIGN_CENTER;

	}
	
	Class.register('benignware.core.Layout', Layout);
	
	/**
	 * string identifier for horizontal-oriented layout
	 * @field ORIENTATION_HORIZONTAL
	 * @return {String} horizontal
	 */
	Layout.ORIENTATION_HORIZONTAL = "horizontal";
	
	/**
	 * string identifier for vertical-oriented layout
	 * @field ORIENTATION_VERTICAL
	 * @return {String} vertical
	 */
	Layout.ORIENTATION_VERTICAL = "vertical";
	
	/**
	 * string identifier for left-aligned layout
	 * @field ALIGN_LEFT
	 * @return {String} left
	 */
	Layout.ALIGN_LEFT = "left";
	
	/**
	 * string identifier for top-aligned layout
	 * @field ALIGN_TOP
	 * @return {String} top
	 */
	Layout.ALIGN_TOP = "top";
	
	/**
	 * string identifier for center-aligned layout
	 * @field ALIGN_CENTER
	 * @return {String} center
	 */
	Layout.ALIGN_CENTER = "center";

	/**
	 * string identifier for right-aligned layout
	 * @field ALIGN_RIGHT
	 * @return {String} right
	 */
	Layout.ALIGN_RIGHT = "right";
	
	/**
	 * string identifier for bottom-aligned layout
	 * @field ALIGN_BOTTOM
	 * @return {String} bottom
	 */
	Layout.ALIGN_BOTTOM = "bottom";
	
	/**
	 * retrieves the content size of the specified container element
	 * @method getContentSize
	 * @param {benignware.core.Container} element
	 * @returns an object containing width and height properties
	 */
	Layout.prototype.getContentSize = function() {
//		console.log("Layout::getContentSize(", element, ")");
		var element = this.element;
		var items = Layout.getItems(element);
		var width = 0;
		var height = 0;
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var xmax, ymax;

			xmax = item.offsetLeft + Element.getWidth(item); 
			ymax = item.offsetTop + Element.getHeight(item); 

			width = xmax > width ? xmax : width;
			height = ymax > height ? ymax : height;

		}
		return {
			width: width, 
			height: height
		}
	}
	
	/**
	 * applies the layout to the specified container element
	 * @method perform
	 * @param {benignware.core.Element} element
	 * @returns an object containing width and height properties
	 */
	Layout.prototype.perform = function(element) {
//		console.log("Layout::perform(", element, ")");
	}
	
	/**
	 * the element to which the layout is applied
	 * @property element
	 * @return {benignware.core.Element} element
	 */
	Layout.prototype.element = null;
	
	/**
	 * the layout's orientation
	 * @property orientation
	 * @return {String} the orientation identifier
	 */
	Layout.prototype.orientation = Layout.ORIENTATION_VERTICAL;
	
	/**
	 * the layout's horizontal align
	 * @property horizontalAlign
	 * @return {String} the align identifier
	 */
	Layout.prototype.horizontalAlign = null;
	
	/**
	 * the layout's vertical align
	 * @property verticalAlign
	 * @return {String} the align identifier
	 */
	Layout.prototype.verticalAlign = null;
	

	/**
	 * returns an itemset for the specified element.
	 * @static
	 * @method getItems
	 */
	Layout.getItems = function(element) {
		var items = [];
		if (element.size && element.get) {
			for (var i = 0; i < element.size(); i++) {
				items.push(element.get(i));
			}
		} else {
			for (var i = 0; i < element.childNodes.length; i++) {
				var child = element.childNodes[i];
				if (isItem(child)) {
					items.push(child);
				}
			}
		}
		return items;
	}
	
	
	// TODO: remove helper methods
	
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
	
	function isItem(item) {
		return item.nodeType == 1
			&& !contains(["br", "script", "link", "map"], item.nodeName.toUpperCase()) 
			|| item.nodeType == 3 && trim(item.nodeValue);
	}
	
	
	var layouts = [];
	
	/**
	 * registers a layout class with a string identifier
	 * @static
	 * @method register
	 * @param {String} id
	 * @param {benignware.core.Class} clazz
	 * @param {Object} options
	 */
	
	Layout.register = function(id, clazz, options) {
//		console.log("Layout::register(", id, clazz, options, ")");
		layouts[id] = {
			clazz: clazz, 
			options: options
		}
	}
	
	/**
	 * returns a layout instance registered with the specified identifier
	 * @static
	 * @method get
	 * @param {String} id the layout identifier
	 * @param {benignware.core.Element} element
	 * @return {benignware.core.Layout} the layout instance
	 */
	Layout.get = function(id, element) {
		
		var layoutItem = layouts[id];
		
		if (layoutItem && layoutItem.clazz) {
			var clazz = layoutItem.clazz;
			var options = layoutItem.options;
			var layout = new clazz(element);
			layout.element = element;
			for (var name in options) {
				Class.callSetter(layout, name, options[name]);
			}
			return layout;
		}
	}
	
	
})();
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
		return this;
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
		return this;
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
(function() {
	
	// class imports
	var Class = benignware.core.Class;
	var Event = Class.require('benignware.core.Event');
	var EventDispatcher = Class.require('benignware.core.EventDispatcher');
	var DOM = Class.require('benignware.util.DOM');
	var StringUtils = Class.require('benignware.util.StringUtils');
	// init parent
	var _parent;
	
	/**
	 * Ajax loader
	 * @package benignware.core
	 * @class Loader
	 * @extends benignware.core.EventDispatcher
	 */
	
	// helper methods
	
	// returns cross browser http request
	function getXMLHttpRequest() {
		return typeof XMLHttpRequest != undefined ? new XMLHttpRequest() : typeof ActiveXObject != undefined ? new ActiveXObject('Microsoft.XMLHTTP') : null; 
	}
	
	// merge arrays
	function merge(a1, a2) {
		var result = [];
		for (var i = 0; i < arguments.length; i++) {
			var a = arguments[i];
			for (var x in a) {
				if (parseInt(x)) {
					result.push(a[x]);
				} else {
					result[x] = a[x];
				}
			}
		}
		return result;
	}
	
	
	/**
	 * Constructs a new loader.
	 * @constructor
	 * @param {String} method
	 * @param {Boolean} async
	 */
	
	var _parent;
	
	function Loader(method, async, type) {
		
		var __parent = _parent.apply(this, arguments);
		
		// setup public variables
		this.complete = true;
		this.method = method || "GET";
		this.async = typeof async != "undefined" ? async : true;
		this.type = type;
		this.variables = [];
		
		var queue = [];
		var requests = [];

		// privileged
		
		/**
		 * adds a new url to the request queue and starts loading immediately
		 * @privileged
		 * @method load
		 * @param {String} url the url of the request
		 * @param {Object} options an object containing optional arguments
		 */
		this.load = function(url, options) {
			
			options = options || {}

			queue.push({
				url: url, 
				status: 0, 
				options: {
					// options
					method: options.method || this.method, 
					async: typeof(options.async) != 'undefined' ? options.async : this.async, 
					variables: options.variables || this.variables, 
					type: options.type || this.type || getTypeByUrl(url) || Loader.TYPE_XML, 
					success: options.success, 
					error: options.error, 
					jsonp: options.jsonp || Loader.JSONP_CALLBACK_PARAM
				
			}, ready: function(item) {
				
				// remove item from current requests
				for (var i = 0; i < requests.length; i++) {
					if (item == requests[i]) {
						requests.splice(i, 1);
						break;
					}
				}

				// next
				next.call(this);
				
			}});
			
			if (!this.queued || requests.length == 0) {
				// start loading the queue
				next.call(this);
			}
			
		}
		
		
		// private
		function next() {
			
			
			
			if (queue.length > 0) {
				var item = queue.shift();
				requests.push(item);
				load.call(this, item);
			} else if (requests.length == 0) {

				complete.call(this);
			}
			
		}
		
		
	}
	
	
	// extend
	Class.extend(EventDispatcher, Loader);
	_parent = Class.getParent(Loader);
	// register
	Class.register('benignware.core.Loader', Loader);
	
	// private
	
	var jsonpCount = 0;
	
	function load(item) {
		
		// delegate target
		var loader = this;
		
		var request;
		
		var url = item.url;
		var options = item.options;
		var callback = item.callback;
		
		var method = options.method;
		var async = options.async;
		var variables = options.variables;
		
		var type = options.type;
		
		var jsonpCallbackParam = options.jsonp;
		var jsonpCallbackFunction = null;
		//var callbackFuncName = null;
		
		this.complete = false;
		
		// load start
		var loadStartEvent = Event.create("loadstart", false, false);
		loadStartEvent.url = url;
		this.dispatchEvent(loadStartEvent);
		
		// get url query
		var urlQuery = "";
		if (type == Loader.TYPE_JSONP || method == "GET") {
			
			var urlComponents = Loader.getURLComponents(url);
			var urlBase = (urlComponents.protocol ? urlComponents.protocol + "://" : "") + urlComponents.host + urlComponents.pathname;

			// merge with get params
			variables = merge(urlComponents.params, variables);
			
			if (type == Loader.TYPE_JSONP) {
				jsonpCount++;
				jsonpCallbackFunction = "__benignware_utils_Loader_jsonp_callback_" + jsonpCount;
				variables[jsonpCallbackParam] = jsonpCallbackFunction;
			}
			
			urlQuery = Loader.buildHTTPQuery(variables);
			
			url = urlBase + (urlQuery ? "?" + urlQuery : "");
		} else {
			
			urlQuery = Loader.buildHTTPQuery(variables);
		}
		
		var request = {
			status: 0
		}
		
		var head = document.getElementsByTagName('head')[0];
		
		switch (options.type) {
		
		case Loader.TYPE_STYLESHEET:
			
			// css
			
			if (head) {
				
				var linkElem = document.createElement("link");
				linkElem.setAttribute("rel", "stylesheet");
				linkElem.setAttribute("type", "text/css");
				
				linkElem.onerror = function(data) {
					request.status = 404;
					ready.call(loader, item, request);
				}
				
				linkElem.onload = function() {
					request.status = 200;
					ready.call(loader, item, request);
				}
				
				head.appendChild(linkElem);
				
				linkElem.setAttribute('href', url);
				
			}
		  
			break;
		
		case Loader.TYPE_JSONP: 
		case Loader.TYPE_JAVASCRIPT: 
			
			// jsonp/javascript
			if (head) {

				// jsonp callback
				window[jsonpCallbackFunction] = function(data) {
					request.data = data;
					window[jsonpCallbackFunction] = undefined;
				}
				var scriptElem = document.createElement('script');
				scriptElem.onerror = function(data) {
					scriptElem.parentNode.removeChild(scriptElem);
					window[jsonpCallbackFunction] = undefined;
					request.status = 404;
					ready.call(loader, item, request);
				}
				
				scriptElem.onload = function() {
					request.status = 200;
					request.responseText = scriptElem.textContent; 
					
					if (options.type == Loader.TYPE_JSONP) {
						scriptElem.parentNode.removeChild(scriptElem);
					}
					ready.call(loader, item, request);
				}
				
				head.appendChild(scriptElem);
				
				scriptElem.setAttribute('src', url);
				
			}
			
			
			break;
			
		default: 

			// xml http request
			request = getXMLHttpRequest();
		
			
			
			if (async == true) {
				
				// async
				
				request.onreadystatechange = function() {
					if (request.readyState == 4) {
						loader.status = request.status;
						ready.call(loader, item, request);
					}
				}
				
			}
			
			
			request.open(method, url, async);
			
			request.send(urlQuery || null);
		
			if (!async) {
				ready.call(this, item, request);
			}
		}
			
		
		
	}
	
	function ready(item, request) {

		if (request.status == 200) {

			// success
			
			var data = request.data;
			
			if (!data) {
				
				// resolve data
				
				var type = item.options.type;
				
				switch (type) {
				
					case Loader.TYPE_PLAIN_TEXT: 
						data = request.responseText;
						break;
				
					case Loader.TYPE_XML: 
						data = request.responseXML || DOM.parseFromString(request.responseText);
						break;
						
					case Loader.TYPE_HTML: 
						data = DOM.parseFromString(request.responseText, "text/html");
						break;
						
					case Loader.TYPE_JSON: 
						data = StringUtils.jsonDecode(request.responseText);
						break;
						
					case Loader.TYPE_JAVASCRIPT: 
						data = request.responseText;
						break;
						
					default: 
						// unknown data type
				}

			}
			
//			if (!data) {
//				// dispatch no data error
//				error.call(this, item);
//				return;
//			}
			
			// success
			this.data = data;
			
			loaded.call(this, item, data, request);
			
		} else {
			// network error
			error.call(this, item);
		}

		// next
		item.ready.call(this, item);
	}
	
	function loaded(item, data, request) {
		var loadEvent = Event.create("load", false, false);
		loadEvent.url = item.url;
		loadEvent.data = data;
		loadEvent.responseXML = request.responseXML;
		loadEvent.responseText = request.responseText;
		this.dispatchEvent(loadEvent);
		var callback = item.options.success;
		if (typeof callback == "function") {
			callback(loadEvent);
		}
	}
	
	function error(item) {
		var errorEvent = Event.create("error", false, false);
		errorEvent.url = item.url;
		var callback = item.options.error;
		if (typeof callback == "function") {
			callback(errorEvent);
		}
		this.dispatchEvent(errorEvent);
	}
	
	
	function complete() {
		
		this.complete = true;
		var completeEvent = Event.create("complete", false, false);
		this.dispatchEvent(completeEvent);
		
	}
	
	
	/**
	 * returns an object containing the components of the specified url
	 * @static
	 * @method getURLComponents
	 * @param {String} url the url
	 * @return {Object} an object containing the url components
	 */
	
	Loader.getURLComponents = function(url) {
		
		var result = {protocol: "", host: "", pathname:"", queryString:"", params:[]};
		var pattern = /^\s*(?:([a-z]*)\:\/\/([^\\\/]*))?(.*)?(.*)/i;
		var regex = new RegExp( pattern );
		var match = regex.exec(url);
		if (match) {
			result.protocol = match[1] || "";
			result.host = match[2] || "";
			result.pathname = match[3] || "";
			result.queryString = match[4] || "";
		}
		if (result.queryString) {
			var params = [];
			var queryString = result.queryString;
			queryString = StringUtils.startsWith(queryString, "?") ? queryString.substring(1) : queryString;
			if (queryString) {
				
				var pairs = queryString.split("&");
				for (var i = 0; i < pairs.length; i++) {
					var pair = pairs[i].split("=");
					var name = decodeURIComponent(pair[0]);
					var value = decodeURIComponent(pair[1]);
					var match = new RegExp(/^([a-z0-9_-]*)\[(.*)\]$/).exec(name);
					if (match) {
						name = match[1];
						key = match[2];
						if (!params[name]) {
							params[name] = [];
						}
						if (key) {
							params[name][key] = value;
						} else {
							params[name].push(value);
						}
					} else {
						params[name] = value;
					}
				}
				
			}
			result.params = params;
		}
		var base = result.protocol ? result.protocol + "//" + result.host : "";
		base+= result.pathname;
		result.base = base;
		return result;
	}
	
	
	/**
	 * constructs an url query with the specified params
	 * @static
	 * @method buildHTTPQuery
	 * @param {Object} params an object containing url params
	 * @param {Boolean} urlencoded specifies whether the resulting params should be encoded.
	 * @return {String} the url query
	 */
	
	Loader.buildHTTPQuery = function(params, urlencoded){
		urlencoded = typeof urlencoded == "boolean" ? urlencoded : true;
		var queryString = "";
		for (var name in params) {
			queryString += !queryString ? "" : "&";
			var value = urlencoded ? encodeURIComponent(params[name]) : params[name];
			queryString += name + "=" + value;
		}
		return queryString;
	}
	
	
	function getTypeByUrl(url) {
		var extension = StringUtils.getFileExtension(url);
		var type = null;
		switch (extension) {
		case 'xml':
		case 'html': 
		case 'json': 
		case 'jsonp': 
			type = extension;
			break;
		case 'txt': 
			type = Loader.TYPE_PLAIN_TEXT;
			break;
		case 'js':
			type = Loader.TYPE_JAVASCRIPT;
			break;
		case 'css': 
			type = Loader.TYPE_STYLESHEET;
			break;
		}
		return type;
	}
	
	// constants
	
	/**
	 * handles plain text data
	 * @field TYPE_PLAIN_TEXT
	 * @return {String} the plain text data type identifier - 'text'
	 */
	Loader.TYPE_PLAIN_TEXT = "text";
	
	/**
	 * handles xml data
	 * @field TYPE_XML
	 * @return {String} the xml data type identifier - 'xml'
	 */
	Loader.TYPE_XML = "xml";
	
	/**
	 * handles html data
	 * @field TYPE_HTML
	 * @return {String} the html data type identifier - 'html'
	 */
	Loader.TYPE_HTML = "html";
	
	
	/**
	 * loads and executes a css stylesheet
	 * @field TYPE_STYLESHEET
	 * @return {String} the css data type identifier - 'stylesheet'
	 */
	Loader.TYPE_STYLESHEET = "stylesheet";
	
	/**
	 * handles json data
	 * @field TYPE_JSON
	 * @return {String} the json data type identifier - 'json'
	 */
	Loader.TYPE_JSON = "json";
	
	/**
	 * loads and executes javascript code
	 * @field TYPE_JAVASCRIPT
	 * @return {String} the json data type identifier - 'json'
	 */
	Loader.TYPE_JAVASCRIPT = "javascript";
	
	/**
	 * handles jsonp data
	 * @field TYPE_JSONP
	 * @return {String} the jsonp data type identifier - 'json'
	 */
	Loader.TYPE_JSONP = "jsonp";
	
	
	/**
	 * the jsonp callback name. defaults to 'callback'
	 * @field TYPE_JSONP
	 * @return {String} the jsonp callback name
	 */
	Loader.JSONP_CALLBACK_PARAM = 'callback'
	
	/**
	 * the loadstart event fires when a request is sent.
	 * @event loadstart
	 */
	Loader.EVENT_LOADSTART = "loadstart";
	
	/**
	 * the load event fires when a request has been loaded.
	 * @event load
	 */
	Loader.EVENT_LOAD = "load";
	
	/**
	 * the complete event fires when the load queue has completed.
	 * @event complete
	 */
	Loader.EVENT_COMPLETE = "complete";
	
	/**
	 * the method of the request.
	 * @property method
	 * @return {String} the request method
	 */
	Loader.prototype.method = "GET";
	
	/**
	 * specifies if the request is asynchronous
	 * @property async
	 * @return {Boolean} a boolean value
	 */
	Loader.prototype.async = true;
	
	/**
	 * the expected data type
	 * @property type
	 * @return {String} the expected data type
	 * @see benignware.utils.Loader#TYPE_PLAIN_TEXT
	 * @see benignware.utils.Loader#TYPE_XML
	 * @see benignware.utils.Loader#TYPE_JSON
	 * @see benignware.utils.Loader#TYPE_JSONP
	 */
	Loader.prototype.type = true;
	
	/**
	 * the http status code
	 * @property status
	 * @return {Number} the http status code
	 */
	Loader.prototype.status = null;
	
	/**
	 * holdes the response data
	 * @property data
	 * @return {Object} the response data
	 */
	Loader.prototype.data = null;
	
	/**
	 * specifies if requests should be queued.
	 * @property queued
	 * @return {Boolean} true, if requests are queued.
	 */
	Loader.prototype.queued = null;
	
	return Loader;
	
})();
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
(function() {
	
	var Class = benignware.core.Class;
	
	var Event = Class.require('benignware.core.Event');
	var EventDispatcher = Class.require('benignware.core.EventDispatcher');
//
	var Delegate = Class.require('benignware.util.Delegate');
	var CSS = Class.require('benignware.util.CSS');
	var ArrayUtils = Class.require('benignware.util.ArrayUtils');
	var StringUtils = Class.require('benignware.util.StringUtils');
	var Element = Class.require('benignware.core.Element');
	var Timer = Class.require('benignware.util.Timer');
	// helper methods
	
	function toMilliseconds(timeString) {
		if (typeof timeString == "number") {
			// assume seconds
			return timeString;
		}
		// regex
		var up = /\s*(-?\d+\.?\d*)\s*(ms|s|m|h|d|M|y)?\s*/i;
		var match = up.exec(timeString);
		if (match) {
			var value = parseFloat(match[1]);
			var unit = parseFloat(match[2]);
			switch (unit) {
				case 'ms':
					return value;
				case 'm': 
					return value * 60 * 1000;
				case 'h': 
					return value * 60 * 60 * 1000;
				case 'd': 
					return value * 60 * 60 * 24 * 1000;
				case 'M': 
					// TODO: calendar year
					return value * 60 * 60 * 24 * 365.25 * 1000;
				case 'y': 
					return value * 60 * 60 * 24 * 365.25 * 12 * 1000;
				default: 
					// assume seconds
					return value * 1000;
				
			}
			if (!unit) {
				// no unit, assume seconds
				return parseFloat(value) * 1000;
			} else {
				
			}
		}
		return 0;
	}
	
	function parseUnit(string) {
		var match = /\s*(-?\d+\.?\d*)\s*(\w*|%)?\s*/i.exec(string);
		if (match && match[0]) {
			var value = parseFloat(match[0]);
			if (!isNaN(value)) {
				return {value: value, unit: match[2] ? match[2] : ""}
			}
		}
		return null;
	}
	
	function isElement(obj) {
		return obj && obj.tagName && typeof obj.style == "object";
	}
	
	function isStyle(obj, propertyName) {
		return obj.style && typeof obj.style[propertyName] == "string";
	}
	
	function getProperties(prop) {
		var propNames = [];
		if (typeof prop == 'string') {
			propNames = prop.split(",");
		} else if (typeof prop == 'object' && prop instanceof Array) {
			propNames = prop;
		}
		return propNames;
	}
	
	function setValues(obj, props, values, style) {
		style = typeof style != "undefined" ? style : true;
		values = ArrayUtils.fill(typeof values == 'object' && values instanceof Array ? values : [values], props.length);
		var isElem = isElement(obj);
		for (var i = 0; i < props.length; i++) {
			var name = props[i];
			var value = values[i];
			setValue(obj, name, value, style);
		}
	}
	
	function setValue(obj, name, value, style) {
		style = typeof style != "undefined" ? style : true;
		var isElem = isElement(obj);
		if (style && isElem && typeof obj.style[name] != "undefined") {
//			console.log("set style: ", name, value);
			obj.style[name] = value;
		} else if (typeof obj[name] != "undefined") {
			obj[name] = value;
		}
	}
	
	function getValues(obj, props) {
		var values = [];
		var isElem = isElement(obj);
		for (var i = 0; i < props.length; i++) {
			var prop = props[i];
			if (isElem && typeof obj.style[prop] != "undefined") {
				values[i] = Element.getComputedStyle(obj, prop);
			} else {
				values[i] = obj[prop];
			}
		}
		return values;
	}
	
	function getTransitionArguments(properties, startValue, endValue, duration, timingFunction) {
		var args = {
			startValue: ArrayUtils.fill(typeof startValue == 'object' && startValue instanceof Array ? startValue : [startValue], properties.length), 
			endValue: ArrayUtils.fill(typeof endValue == 'object' && endValue instanceof Array ? endValue : [endValue], properties.length), 
			duration: ArrayUtils.fill(typeof duration == 'object' && duration instanceof Array ? duration : [duration], properties.length, 0),  
			timingFunction: ArrayUtils.fill(typeof timingFunction == 'object' && timingFunction instanceof Array ? timingFunction : [timingFunction], properties.length)
		}
		// convert duration to milliseconds of type number 
		for (var i = 0; i < args.duration.length; i++) {
			var duration = args.duration[i];
			if (typeof duration == "number") {
				// assume seconds
				args.duration[i] = duration * 1000;
			} else if (typeof duration == "string") {
				args.duration[i] = toMilliseconds(duration);
			}
		}

		return args;
	}
	
	
	
	function getTransitionValues(args, time) {
		var values = [];
		for (var i = 0; i < args.propertyName.length; i++) {
			values[i] = getTransitionValue(args.startValue[i], args.endValue[i], time, args.duration[i], args.timingFunction[i]);
		}
		return values;
	}
	
	function getTransitionValue(startValue, endValue, time, duration, timingFunction) {
		
		if (time >= duration) {
			return endValue;
		}
		
		var func = getTimingFunction(timingFunction);

		var p = 0;
		if (typeof(func) == "function") {
			p = func(time, 0, 1, duration);
		} else {
			p = time / duration;
		}
		
		p = p < 0 ? 0 : p > 1 ? 1 : p;
		
		var result = null;
		
		if (typeof endValue == 'number') {
			
			// number
			startValue = parseFloat(startValue);
			result = startValue + (endValue - startValue) * p;
			
			
			
		} else if (typeof endValue == 'string') {
			
			// perform regex replace on digit sequences
			var up = /\s*(-?\d+\.?\d*)\s*(px|%|em)?\s*/i;

			var search = "(-\?[\\d\\.\?]+\(\?\:px\|%\|em\)\?)";
			var regexp = new RegExp(search, "g");
			
			var pattern = startValue;
			pattern = pattern.replace(/\(/g, "\\(");
			pattern = pattern.replace(/\)/g, "\\)");
			pattern = pattern.replace(regexp, search);
			pattern = pattern.replace(/,\s+/g, ",\\s*");
			
			result = pattern;

			var ma = new RegExp(pattern).exec(startValue);
			var mb = new RegExp(pattern).exec(endValue);
			
			if (mb) {
				for (var i = 1; i < mb.length; i++) {
					
					var amu = up.exec(ma[i]);
					var bmu = up.exec(mb[i]);
					
					var av = amu ? parseFloat(amu[1]) : 0;
					var bv = bmu ? parseFloat(bmu[1]) : 0;
					
					var au = amu && amu[2] ? amu[2] : "";
					var bu = bmu && bmu[2] ? bmu[2] : "";
					var u = au ? au : bu;
					
					var value = av + (bv - av) * p;
					result = result.replace(search, value + u);
				}
			}
			
			
			result = result.replace(/,\\s\*/g, ",");
			result = result.replace(/\\\(/g, "(");
			result = result.replace(/\\\)/g, ")");

		}
		
		
		return result;
	}
	
	function getTimingFunction(func) {
		
		var timingFunction = null;
		if (typeof(this.timingFunction) == "function") {
			timingFunction = this.timingFunction;
		} else if (typeof(this.timingFunction) == "string") {
			timingFunction = timingFunctions[this.timingFunction];
		}
		return timingFunction;
	}

	
	/**
	 * class for transition and animation
	 * @class benignware.core.Transition
	 * @extends benignware.core.EventDispatcher
	 */
	
	/**
	 * dispatched when a property has been finished.
	 * @event end
	 */
	
	/**
	 * dispatched when all properties have been finished.
	 * @event complete
	 */
	
	Class.create('benignware.core.Transition', (function() {
		
		var _parent;
		
		// private static 
		var transitionCount = 0;

		// we use a global timer
		var timer = new Timer(25);
		
		var transitionStyle = CSS.getVendorStyle('transition');
		var isFirefox = navigator.userAgent.match(/Firefox/);
		
		var transitionEndEvent = transitionStyle ? isFirefox ? 'transitionend' : transitionStyle.substring(0, 1).toLowerCase() + transitionStyle.substring(1) + "End" : '';

		if (transitionStyle) {
//			alert("css transitions supported");
		}
		
		
		/**
		 * @constructor
		 * @param {Element} element an element or object to apply the transition on.
		 */
		function Transition(element) {
			
			var __parent = _parent.apply(this);
			
			this.element = element;
			
			// private variables
			
			var isPlaying = false;
			var finished = {};
			var cssTimeouts = [];
			
			var initialValues = [];
			
			var time;
			
			var startTime;
			
			var elem = element;
			var isElem = isElement(elem);
			
			var properties = [];
			
			var timerArgs = {};
			var cssArgs = {}
			
			var transition = this;

			
			// private privileged methods
			
			function timerHandler(event) {

				time+= timer.getInterval();
				
				for (var i = 0; i < timerArgs.propertyName.length; i++) {
					
					var name = timerArgs.propertyName[i];
					
					var t = time;
					var d = timerArgs.duration[i];
					if (t >= d) {
						t = d;
					}

					var value = getTransitionValue(timerArgs.startValue[i], timerArgs.endValue[i], t, d, timerArgs.timingFunction[i]);

					setValue(elem, name, value);

//					transitionChange.call(this);
					
					if (t == d) {
						transitionEndHandler({propertyName: name});
					}
				}
			}
			
			function transitionEndHandler(event) {

				propertyName = event.propertyName;
				
//				console.log("transition end: ", propertyName);
				
				if (!isPlaying) {
					return;
				}
				
				if (!propertyName && properties.length == 1) {
//					propertyName = StringUtils.hyphenatedToCamelCase(props[0]);
				}

				window.clearTimeout(cssTimeouts[propertyName]);
				
//				console.log("transition prop finish? ", propertyName, finished[propertyName]);
				
				if (typeof(finished[propertyName]) == 'undefined' || !finished[propertyName]) {
					
					finished[propertyName] = true;
					
					var doc = elem && elem.ownerDocument ? elem.ownerDocument : document;
					
					var event = Event.create(doc, 'end', false, false);
					event.propertyName = propertyName;
					transition.dispatchEvent(event);
					// test for complete
					
					var complete = (properties.length == 1);
					
					
					if (!complete) {
						
						complete = true;
						for (var i = 0; i < properties.length; i++) {
							if (!finished[properties[i]]) {
								// incomplete
								complete = false;
								break;
							}
						}
					}

					if (complete) {
						transition.stop();
						var doc = elem && elem.ownerDocument ? elem.ownerDocument : document;
						transition.dispatchEvent(Event.create(doc, 'transitioncomplete', false, false));
						
						// deprecated:
						transition.dispatchEvent(Event.create(doc, 'complete', false, false));
						
					}
					
				}
				
			}
			
			function transitionChange() {
				var doc = elem && elem.ownerDocument ? elem.ownerDocument : document;
				this.dispatchEvent(Event.create(doc, Transition.TRANSITION_CHANGE, false, false));
			}
			
			
			this.isPlaying = function() {
				return isPlaying;
			} 
			
			// public privileged methods
			
			/**
			 * starts the transition
			 * @method start
			 */
			this.start = function() {
				
				// start
				if (!this.isPlaying()) {

					elem = this.element;

					isElem = isElement(elem);

					isPlaying = true;
					finished = [];
					cssTimeouts = [];

					properties = getProperties(this.property);
					
					// get args
					var startValue = this.startValue || getValues(elem, properties);
					var args = getTransitionArguments(properties, startValue, this.endValue, this.duration, this.timingFunction);
					
					// css arguments
					cssArgs = {
						propertyName: [], 
						startValue: [], 
						endValue: [], 
						duration: [], 
						timingFunction: []
					};
					
					// timer args
					timerArgs = {
						propertyName: [], 
						startValue: [], 
						endValue: [], 
						duration: [], 
						timingFunction: []
					};
					
					
					for (var i = 0; i < properties.length; i++) {
						
						var name = properties[i];

						if (this.useCSS && transitionStyle && isStyle(elem, name)) {
							
							// css
							//
							
							cssArgs.propertyName.push(name);
							cssArgs.duration.push(args.duration[i] / 1000 + "s");
							cssArgs.timingFunction.push(args.timingFunction[i]);
							cssArgs.startValue.push(args.startValue[i]);
							cssArgs.endValue.push(args.endValue[i]);
							
							
							// init timeout
							var duration = args.duration[i];
							(function() {
								var propertyName = name;
								cssTimeouts[name] = window.setTimeout(function() {
									console.warn('css transition timeout', propertyName);
									transitionEndHandler({propertyName: propertyName});
								}, args.duration[i] + 1000);
							})();
							
							
						} else {
			
							//if (typeof elem[name] != "undefined")
							
							
							// timer
							timerArgs.propertyName.push(name);
							timerArgs.duration.push(args.duration[i]);
							timerArgs.timingFunction.push(args.timingFunction[i]);
							timerArgs.startValue.push(args.startValue[i]);
							timerArgs.endValue.push(args.endValue[i]);
							
							// init timer
						}
						
					}

					setValues(elem, properties, args.startValue);
					
					
					if (cssArgs.propertyName.length > 0) {

						window.setTimeout(function() {

						var propName = cssArgs.propertyName.join(",");

						elem.style[transitionStyle + "Property"] = StringUtils.hyphenate(propName);
						elem.style[transitionStyle + "TimingFunction"] = cssArgs.timingFunction.join(",");
						elem.style[transitionStyle + "Duration"] = cssArgs.duration.join(",");
						
						setValues(elem, cssArgs.propertyName, cssArgs.endValue);
						
							
						}, 50); 
							
							
						elem.addEventListener(transitionEndEvent, transitionEndHandler);
						
					}

					
					if (timerArgs.propertyName.length > 0) {
						transitionCount++;
						timer.addEventListener('tick', timerHandler);
						if (!timer.isRunning()) {
							timer.start();
						}
					}
					
					time = 0;
				}
			}
			
			
			
			/**
			 * stops the transition
			 * @method stop
			 */
			this.stop = function() {
				
				// stop
				if (isPlaying) {

					isPlaying = false;
					
					if (cssArgs.propertyName.length > 0) {
						
						elem.style[transitionStyle + "Duration"] = "0s";
						
						// css
						
						// clear timeouts
						for (var x in cssTimeouts) {
							window.clearTimeout(cssTimeouts[x]);
						}
						
						// remove listener
						elem.removeEventListener(transitionEndEvent, transitionEndHandler);
						
						// apply current values
						if (isElem && this.useCSS && transitionStyle) {
							setValues(elem, properties, getValues(elem, properties));
						}
					} 
					
					
					// timer
					if (timerArgs.propertyName.length > 0) {
						// remove listener
						timer.removeEventListener('tick', timerHandler);
						// decrease transition count
						transitionCount--;
						
						// stop timer if no transition running
						if (timer.isRunning()) {
							if (transitionCount <= 0) {
								timer.stop();
							}
						}
					}
					
				}
			
			}
		}
		
		
		Class.extend(EventDispatcher, Transition);
		
		_parent = Class.getParent(Transition);
		
		
		/**
		 * the target element or other object to apply the transition on.
		 * @property element
		 * @return {Object} the target object
		 */
		Transition.prototype.element = null;
		
		/**
		 * start value(s) of the transition
		 * @property startValue
		 * @return {Array} the start value(s)
		 */
		Transition.prototype.startValue = null;
		
		
		/**
		 * end value(s) of the transition
		 * @property endValue
		 * @return {Array} the end value(s)
		 */
		Transition.prototype.endValue = null;
		
		/**
		 * the duration of the transition.
		 * @property duration
		 * @return {Number} the duration in seconds
		 */
		Transition.prototype.duration = null;
		
		/**
		 * the timing-function
		 * @property timingFunction
		 * @return {String} the direction
		 */
		Transition.prototype.timingFunction = "linear";

		
		
		/**
		 * specifies if css transitions should be used. defaults to true
		 * @property useCSS
		 * @return {Boolean} true or false
		 */
		Transition.prototype.useCSS = true;

		return Transition;
		
	})());
})();
(function() {
	
	// class imports
	var Class = benignware.core.Class;
	var Element = Class.require('benignware.core.Element');
	var Layout = Class.require('benignware.core.Layout');
	
	// init parent object
	var _parent;
	
	/**
	 * this package contains predefined layout classes. 
	 * @package benignware.layout
	 */
	
	/**
	 * a simple item layout
	 * @class ItemLayout
	 * @extends benignware.core.Layout
	 */
	function ItemLayout() {
		_parent.apply(this, arguments);
	}
	
	/**
	 * layout identifier for an item layout with horizontal orientation
	 * @field HORIZONTAL
	 * @return {String} the identifier string
	 */
	ItemLayout.HORIZONTAL = "horizontal";
	
	/**
	 * layout identifier for an item layout with vertical orientation
	 * @field VERTICAL
	 * @return {String} the identifier string
	 */
	ItemLayout.VERTICAL = "vertical";
	
	Layout.register(ItemLayout.HORIZONTAL, ItemLayout, {orientation: Layout.ORIENTATION_HORIZONTAL});
	Layout.register(ItemLayout.VERTICAL, ItemLayout, {orientation: Layout.ORIENTATION_VERTICAL});
	
	Class.extend(Layout, ItemLayout);
	
	_parent = Class.getParent(ItemLayout);
	
	Class.register('benignware.layout.ItemLayout', ItemLayout);
	
	/**
	 * returns the calculated content size
	 * @method getContentSize
	 * @return {Object} an object containing width and height properties
	 */
	ItemLayout.prototype.getContentSize = function() {
		
		var element = this.element;
		var items = Layout.getItems(element);

		var width = this.orientation == Layout.ORIENTATION_HORIZONTAL ? 0 : element.clientWidth;
		var height = this.orientation == Layout.ORIENTATION_VERTICAL ? 0 : element.clientHeight;
		
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			item.style.position = "absolute";
			if (item.nodeType == 1) {
				var itemWidth = Element.getOuterWidth(item);
				var itemHeight = Element.getOuterHeight(item);

				width+= this.orientation == Layout.ORIENTATION_HORIZONTAL ? itemWidth : 0;
				height+= this.orientation == Layout.ORIENTATION_VERTICAL ? itemHeight : 0;
			}
		}

		return {
			width: width, 
			height: height
		}
	}
	
	/**
	 * applies the item layout
	 * @method apply
	 */
	ItemLayout.prototype.perform = function() {
		
		var contentSize = this.getContentSize();

		var element = this.element;
		var clientWidth = element.clientWidth;
		var clientHeight = element.clientHeight;
		
		var items = Layout.getItems(element);
		
		var horizontalAlign = this.horizontalAlign == Layout.ALIGN_LEFT ? 0 : this.horizontalAlign == Layout.ALIGN_RIGHT ? 1 : 0.5;
		var verticalAlign = this.verticalAlign == Layout.ALIGN_TOP ? 0 : this.verticalAlign == Layout.ALIGN_BOTTOM ? 1 : 0.5;
		
		var x = Math.max(0, (clientWidth - contentSize.width) * horizontalAlign);
		var y = Math.max(0, (clientHeight - contentSize.height) * verticalAlign);
		
		var width = 0;
		var height = 0;
		
		
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item.nodeType == 1) {
				
				var itemWidth = Element.getOuterWidth(item);
				var itemHeight =  Element.getOuterHeight(item);
				
				if (this.orientation == Layout.ORIENTATION_HORIZONTAL) {
					item.style.left = (x + width) + "px";
					item.style.top = (clientHeight - itemHeight) * verticalAlign + "px";
				} else {
					
					item.style.left = (clientWidth - itemWidth) * horizontalAlign + "px";
					item.style.top = (y + height) + "px";
				}
				
				width+= itemWidth;
				height+= itemHeight;
			}
		}
		
	}
	
	
})();
(function() {
	
	var Class = benignware.core.Class;
	var Layout = Class.require('benignware.core.Layout');

	var _parent;
	
	/**
	 * layouts items to fit client size
	 * @class ClientFitLayout
	 */
	var ClientFitLayout = Class.create('benignware.layout.ClientFitLayout', function ClientFitLayout() {
		_parent.apply(this, arguments);
	});
	ClientFitLayout = Class.extend(Layout, ClientFitLayout);
	_parent = Class.getParent(ClientFitLayout);
	
	/**
	 * layout identifier for a client fit layout with horizontal orientation
	 * @field HORIZONTAL_CLIENT_FIT
	 * @return {String} the identifier string
	 */
	ClientFitLayout.HORIZONTAL_CLIENT_FIT = "horizontal-client-fit";
	
	/**
	 * layout identifier for an client fit layout with vertical orientation
	 * @field VERTICAL_CLIENT_FIT
	 * @return {String} the identifier string
	 */
	ClientFitLayout.VERTICAL_CLIENT_FIT = "vertical";
	
	
	Layout.register('horizontal-client-fit', ClientFitLayout, {orientation: Layout.ORIENTATION_HORIZONTAL});
	Layout.register('vertical-client-fit', ClientFitLayout, {orientation: Layout.ORIENTATION_VERTICAL})
	
	/**
	 * returns the calculated content size
	 * @method getContentSize
	 * @return {Object} an object containing width and height properties
	 */
	ClientFitLayout.prototype.getContentSize = function() {
		var element = this.element;
		var items = Layout.getItems(element);
		var width = this.orientation == Layout.ORIENTATION_HORIZONTAL ? items.length * element.clientWidth : element.clientWidth;
		var height = this.orientation == Layout.ORIENTATION_VERTICAL ? items.length * element.clientHeight : element.clientHeight;
		return {width: width, height: height}
	}

	
	/**
	 * applies the item layout
	 * @method perform
	 */
	
	ClientFitLayout.prototype.perform = function() {
		
		var element = this.element;
		var items = Layout.getItems(element);
		
		for (var i = 0; i < items.length; i++) {
			
			var item = items[i];
			if (item.nodeType == 1) {
				item.style.position = "absolute";
				if (this.orientation == Layout.ORIENTATION_HORIZONTAL) {
					
					item.style.left = i * 100 + "%";
					item.style.top = "0";
				} else {
					item.style.left = "0";
					item.style.top = i * 100 + "%";
				}
				
				item.style.width = "100%";
				item.style.height = "100%";
			}
		}
	}
	
	return ClientFitLayout;
})();
(function() {
	
	var Class = benignware.core.Class;
	var Layout = Class.require('benignware.core.Layout');
	var Element = Class.require('benignware.core.Element');
	var CSS = Class.require("benignware.util.CSS");
	
	var _parent;
	
	
	// static helpers
	
	function fits(elem) {
		var size = typeof(elem.size) == "function" ? elem.size() : elem.childNodes.length;
		var mw = 0;
		for (var i = 0; i < size; i++) {
			var item = typeof(elem.get) == "function" ? elem.get(i) : elem.childNodes[i];
			mw+= parseInt(Element.getComputedStyle(item, 'min-width'));
//			iw+= Element.getOuterWidth(item);
		}
		var ew = Element.getWidth(elem);
		if (mw > ew) {
//			alert(iw + " - " + ew);
			return false;
		}
		return true;
	}
	
	
	/**
	 * layouts items to fit content size
	 * @class ContentFitLayout
	 */
	var ContentFitLayout = Class.create('benignware.layout.ContentFitLayout', function ClientFitLayout() {
		_parent.apply(this, arguments);
	});
	Class.extend(Layout, ContentFitLayout);
	_parent = Class.getParent(ContentFitLayout);
	
	/**
	 * layout identifier for content fit layout with horizontal orientation
	 * @field HORIZONTAL_CONTENT_FIT
	 * @return {String} the identifier string
	 */
	ContentFitLayout.HORIZONTAL_CONTENT_FIT = "horizontal-content-fit";
	
	/**
	 * layout identifier for content fit layout with vertical orientation
	 * @field VERTICAL_CONTENT_FIT
	 * @return {String} the identifier string
	 */
	ContentFitLayout.VERTICAL_CONTENT_FIT = "vertical-content-fit";
	
	
	Layout.register(ContentFitLayout.HORIZONTAL_CONTENT_FIT, ContentFitLayout, {orientation: Layout.ORIENTATION_HORIZONTAL});
	Layout.register(ContentFitLayout.VERTICAL_CONTENT_FIT, ContentFitLayout, {orientation: Layout.ORIENTATION_VERTICAL})
	
	/**
	 * returns the calculated content size
	 * @method getContentSize
	 * @return {Object} an object containing width and height properties
	 */
	ContentFitLayout.prototype.getContentSize = function() {
		var element = this.element;
		var items = Layout.getItems(element);
		if (!fits(element)) {
			return ItemLayout.prototype.getContentSize.call(this);
		}
		return {width: element.clientWidth, height: element.clientHeight}
	}

	
	/**
	 * applies the item layout
	 * @method perform
	 */
	
	ContentFitLayout.prototype.perform = function() {
		
		var element = this.element;
		var items = Layout.getItems(element);
		
		if (!fits(element)) {
			ItemLayout.prototype.perform.call(this, element);
			return;
			
		}
		
		
		var pw = 100 / items.length;
		var ph = 100 / items.length;
		
		var ew = Element.getWidth(element);
		var eh = Element.getHeight(element);
		
		var boxSizingStyle = CSS ? CSS.getVendorStyle('boxSizing') : null;
		
		for (var i = 0; i < items.length; i++) {
			
			var item = items[i];
			if (item.nodeType == 1) {
				item.style.position = "absolute";
				
				if (boxSizingStyle) {
					item.style[boxSizingStyle] = "border-box";
				}
				
				var is = Element.getSize(item);
				if (this.orientation == Layout.ORIENTATION_HORIZONTAL) {
					
					var xp = pw + is.width / ew;
					item.style.width = pw + "%";
					item.style.left = i * pw + "%";
					item.style.top = "0";
				} else {
					item.style.height = ph + "%";
					item.style.left = "0";
					item.style.top = i * ph + "%";
				}
			}
		}
		
		
	}
	
	return ContentFitLayout;
})();
(function() {
	
	/**
	 * game development kit (in development)
	 * @package benignware.motion
	 */
	
	var Class = benignware.core.Class;
	var Element = Class.require('benignware.core.Element');
	var Component = Class.require('benignware.core.Component');
	var Timer = Class.require('benignware.util.Timer');
	var CSS = Class.require('benignware.util.CSS');
	
	var Point = Class.require('benignware.geom.Point');
	var Circle = Class.require('benignware.geom.Circle');
	var Rectangle = Class.require('benignware.geom.Rectangle');
	
	var Vector = Class.require('benignware.geom.Vector');
	
	var _parent;
	
	
	CSS.setDefaultStyle(".benignware-motion-Sprite", "position", "absolute");
	
	/**
	 *  the Sprite class is the base class for motion elements. 
	 *  @class benignware.motion.Sprite
	 */
	
	var Sprite = Class.create('benignware.motion.Sprite', (function() {
		
		/**
		 * @constructor
		 */
		function Sprite() {
			
			console.log("call sprite constructor", _parent);
			
			var __parent = _parent.apply(this, arguments);
			
			this.velocity = new Vector(0, 0);
			this.anchorPoint = new Point(0, 0);
			this.collisionShape = 'rectangle';
			
		}
		
		Class.extend(Component, Sprite);
		_parent = Class.getParent(Sprite);
		
		Sprite.COLLISION_SHAPE_RECTANGLE = "rectangle";
		Sprite.COLLISION_SHAPE_CIRCLE = "circle";
		Sprite.COLLISION_SHAPE_POINT = "point";
		
		return Sprite;
		
	})(), {
		/**
		 * anchor point of the element
		 * @property {benignware.geom.Vector} velocity the velocity vector
		 */
		anchorPoint: null, 
		/**
		 * sets the Position of the element relative to its anchor point. 
		 * @property {benignware.geom.Vector} velocity the velocity vector
		 */
		setPosition: function(x, y) {
			var s = this.getSize();
			_parent.setPosition.call(this, x - this.anchorPoint.x * s.width, y - this.anchorPoint.y * s.height);
		}, 
		/**
		 * sets the Position of the element relative to its anchor point. 
		 * @property {benignware.geom.Vector} velocity the velocity vector
		 */
		getPosition: function(x, y) {
			var pos = _parent.getPosition.call(this);
			var s = this.getSize();
			return {
				x: pos.x + this.anchorPoint.x * s.width, 
				y: pos.y + this.anchorPoint.y * s.height
			}
		}, 
		/**
		 * the velocity vector
		 * @property {benignware.geom.Vector} velocity the velocity vector
		 */
		velocity: null, 
		/**
		 * moves the element based on its velocity vector
		 * @method motion 
		 */
		motion: function() {
			console.log("motion: ", this);
			var pos = this.getPosition();
			this.setPosition(pos.x + this.velocity.x, pos.y + this.velocity.y);
		}, 
		/**
		 * detects for collision of two sprite elements
		 * @property collisionShape 
		 * @return {String} collision string identifier or the specified geometrical form
		 */
		collisionShape: null, 
		/**
		 * detects for collision of two sprite elements contained within the same offset layer
		 * @method detectCollision 
		 * @param {Sprite} sprite
		 */
		detectCollision: function(sprite) {

			var shape1 = getCollisionShape(this);
			var shape2 = getCollisionShape(sprite);

			if (shape1.width && shape2.width) {
				return Rectangle.intersect(shape1, shape2);
			}
			
			return false;
		}
	});
	
	
	function getCollisionShape(sprite) {
		
		var collisionShape = sprite.collisionShape || Sprite.COLLISION_SHAPE_RECT;
		
		var result = null;
		
		if (typeof collisionShape == "string") {
			
			var size = sprite.getSize();
			var pos = sprite.getPosition();
			var anchorPoint = sprite.anchorPoint;
			
			var x = pos.x - anchorPoint.x * size.width;
			var y = pos.y - anchorPoint.y * size.height;
			
			switch (collisionShape) {
			
				case Sprite.COLLISION_SHAPE_RECTANGLE: 
					return new Rectangle(x, y, size.width, size.height);
				
				case Sprite.COLLISION_SHAPE_CIRCLE: 
					return new Circle(x, y, size.width, Math.min(size.width, size.height));
					
				case Sprite.COLLISION_SHAPE_POINT: 
					return new Point(x, y);
					
			}
			
		}
	}
	
	
	return Sprite;
	
})();
