(function() {
	
	
	
	// constructor
	
	
	/**
	 * The default object class. 
	 * @class benignware.core.Object
	 */
	
	function Object() {
	}
	
	/**
	 * constructor implementation
	 * @protected
	 * @method _construct
	 */
	Object.prototype.__construct = function() {
	}
	
	// static
	
	/**
	 * creates a new instance of the specified class
	 * @static
	 * @method create
	 */
	Object.create = function(clazz, args) {
		clazz = clazz || Object;
		var object = new clazz();
		return Object.initialize(object, clazz, args);
	}
	
	/**
	 * calls the constructor and setup class inheritance
	 * @static
	 * @method initialize
	 * @param {benignware.core.Object} object
	 * @param {benignware.core.Class} clazz
	 */
	Object.initialize = function(object, clazz, args) {
		
		if (typeof object == "object" && typeof clazz == "function") {
			
			if (object.constructor != clazz) {
				// copy the prototype
				for (var x in clazz.prototype) {
					if (typeof(object[x]) == "undefined" || typeof(object[x]) == "function") {
						try {
							object[x] = clazz.prototype[x];
						} catch (e) {}
					}
				}
				
				// constructor property 
				object.constructor = clazz;
			}
			
			// call the constructor
			clazz._initialize = true;
			clazz.apply(object, args);
			clazz._initialize = undefined;
			
			// call _construct
			if (object._construct) {
				object._construct.apply(object, args);
			}

		}
		
		return object;
	}
	
	// create namespace
	window.benignware = window.benignware || {};
	window.benignware.core = window.benignware.core || {};
	window.benignware.core.Object = Object;

	return Object;
})();