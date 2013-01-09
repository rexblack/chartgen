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