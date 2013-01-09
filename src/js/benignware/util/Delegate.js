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