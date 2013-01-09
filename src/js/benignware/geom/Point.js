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