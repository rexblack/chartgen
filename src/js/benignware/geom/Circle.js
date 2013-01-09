(function() {
	
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