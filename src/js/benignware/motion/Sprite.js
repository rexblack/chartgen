(function() {
	
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