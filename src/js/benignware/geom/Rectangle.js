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