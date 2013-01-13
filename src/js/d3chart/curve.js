	

	var CP_DISTANCE_FACTOR = 0.3

	/** A cubic bezier curve representation, interpolating all given nodes. Fitting control points are computed as well.
	 */
	function getCurvedGraphCoordSVG(points) {
		var string = ""
		var coords = [];
		var x, y, xCP, yCP;
		var xPre, yPre

		for (i = 0; i < points.length; i++) {
			x = points[i].x;
			y = points[i].y;
			if (i == 0) {
				string += 'M' + x + ',' + y + " ";
			} else if (i == points.length-1) {
				controlPoint0 = [x, y];
				string += 'S' + controlPoint0[0] + ',' + controlPoint0[1] + " " + x + ',' + y + " ";
			} else if (i > 1) {
				controlPoint0 = computeControlPointLeft(points[i-2].x, points[i-2].y, points[i-1].x, points[i-1].y, points[i].x, points[i].y);
				controlPoint1 = computeControlPointRight(points[i-1].x, points[i-1].y, points[i].x, points[i].y, points[i+1].x, points[i+1].y);
//				string += 'S' + controlPoint0[0] + ',' + controlPoint0[1] + " " + x + ',' + y + " ";
				string += 'C' + controlPoint0[0] + ',' + controlPoint0[1] + " " + controlPoint1[0] + ',' + controlPoint1[1] + " " + x + ',' + y + " ";
			} else {
				controlPoint0 = computeControlPointRight(points[i-1].x, points[i-1].y, points[i].x, points[i].y, points[i+1].x, points[i+1].y)
				xCP = (points[i-1].x + points[i].x) / 2.0;
				yCP = points[i-1].y;
				controlPoint1 = [xCP, yCP];
				string += 'C' + controlPoint0[0] + ',' + controlPoint0[1] + " " + controlPoint1[0] + ',' + controlPoint1[1] + " " + x + ',' + y + " ";
			}
			xPre = x
			yPre = y
		}
		return string
	}
	
	/** Control point on the right side of a curve
	 */
	function computeControlPointRight(x0, y0, x1, y1, x2, y2) {
		var deltaX = x2 - x0
		var deltaY = y2 - y0
		if (deltaX != 0) {
			var m = deltaY / deltaX
			var xCP = x1 - CP_DISTANCE_FACTOR * (x1-x0)
			var yCP = m * (xCP-x1) + y1
			return [xCP, yCP]
		} else {
			return [x1, y1]
		}

	}

	/** Control point on the left side of a curve
	*/
	function computeControlPointLeft(x0, y0, x1, y1, x2, y2) {
		var deltaX = x2 - x0
		var deltaY = y2 - y0
		if (deltaX != 0) {
			var m = deltaY / deltaX
			var xCP = x1 + CP_DISTANCE_FACTOR * (x2-x1)
			var yCP = m * (xCP-x1) + y1
			return [xCP, yCP]
		} else {
			return [x1, y1]
		}
	}
	
	/** A polygonal graph of the given nodes
	 */
	function getLinearGraphCoordSVG(points) {
		var string = "";
		var x, y;
		for (i = 0; i < points.length; i++) {
			x = points[i].x;
			y = points[i].y;
			if (i == 0) {
				string += 'M' + x + ',' + y + " ";
			} else {
				string += 'L' + x + ',' + y + " ";
			}
		}
		return string;
	}