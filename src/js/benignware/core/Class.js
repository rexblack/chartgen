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