(function() {
	
	var Class = benignware.core.Class;

	function SVGUtils() {
				
	}
	
	Class.register('benignware.visualization.SVGUtils', SVGUtils);
			
	SVGUtils.SVG_NAMESPACE = "http://www.w3.org/2000/svg";
	
	SVGUtils.create = function(doc, attributes) {
		var svg = doc.createElementNS(SVGUtils.SVG_NAMESPACE, "svg");
		svg.setAttribute('version', "1.1");
		for (var x in attributes) svg.setAttribute(x, attributes[x]);
		return svg;
	}
	
	SVGUtils.createElement = function(doc, tagName, attributes) {
		var elem = doc.createElementNS(SVGUtils.SVG_NAMESPACE, tagName);
		for (var x in attributes) elem.setAttribute(x, attributes[x]);
		return elem;
	}
	
	SVGUtils.clear = function(svg) {
		var svgChildren = svg.childNodes;
		for (var i = 0; i < svgChildren.length; i++) {
			svg.removeChild(svgChildren[i]);
			i--;
		}
	}
	
	SVGUtils.getLineHeight = function(svg) {
		var test = svg.ownerDocument.createTextNode("A");
		svg.appendChild(test);
		var bbox = SVGUtils.getBBox(svg);
		var em = bbox.height;
		svg.removeChild(test);
		return em;
	}
	
	SVGUtils.renderText = function(svg, string, width) {
		
		if (typeof string != 'string') return string;
		
		var doc = svg.ownerDocument;
		
		var textNode = doc.createTextNode("");
		svg.appendChild(textNode);
		
		// wrap lines
		var lines = [];
		var line = [];
		var length = 0;
		var words = string.split(/\s+/);
		
		while(words.length) {
			var word = words[0];
			svg.firstChild.data = line.join(' ') + ' ' + word;
			length = svg.getComputedTextLength();

			if (width > 0 && length > width) {
				
				if (!words.length) {
					line.push(words[0]);
				}
				
				if (line.length == 0) {
					lines.push(words.shift());
				} else {
					lines.push(line.join(' '));
				}
				line = [];
			} else {
				var w = words.shift();
				line.push(w);
			}
			if (words.length == 0 && line.length) {
				lines.push(line.join(' '));
			}
			
		}
		svg.removeChild(textNode);
		
		// layout
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			var tspan = doc.createElementNS(SVGUtils.SVG_NAMESPACE, 'tspan');
			tspan.appendChild(doc.createTextNode(line));
			tspan.setAttribute("x", svg.getAttribute("x"));
			tspan.setAttribute("dy", "1em");
			svg.appendChild(tspan);
		}
		var bbox = SVGUtils.getBBox(svg);
		return {
			width: bbox.width, 
			height: bbox.height
		}
	}
	
	
	SVGUtils.getBBox = function(svg) {
		try {
			return svg.getBBox();
		} catch (e) {
			return {x: 0, y: 0, width: 0, height: 0}
		}
	}
	
	SVGUtils.renderList = function(svg, items, width, options) {
		
		options = options || {};
		
		var optionsBullet = options.bullet || {};
		var optionsBulletStyle = optionsBullet || {};
		
		var doc = svg.ownerDocument;
		// var direction = "vertical";
		var direction = options.direction || 'vertical';
		var x = 0;
		var y = 0;
		var w = 0;
		var h = 0;
		
		for (var i = 0; i < items.length; i++) {
			
			var item = items[i];
			var text = doc.createElementNS(SVGUtils.SVG_NAMESPACE, 'text');
			text.setAttribute("font-size", "13px");
			svg.appendChild(text);
			
			var bulletType = item.bullet && item.bullet.type ? item.bullet.type : optionsBullet.type || 'rect';
			if (bulletType != 'none') {
				var bullet = svg.ownerDocument.createElementNS(SVGUtils.SVG_NAMESPACE, bulletType);
				svg.appendChild(bullet);
			}
			
			// measure em
			var em = SVGUtils.getLineHeight(text);
			
			var bulletSize = em / 2;
			
			text.setAttribute("x", x + bulletSize + 5);
			text.setAttribute("y", y - 4);
			
			// text.setAttribute("alignment-baseline", 'baseline');
			
			var textSpace = direction == 'vertical' ? width - em : 0;
			SVGUtils.renderText(text, item.label, textSpace);
			
			bbox = SVGUtils.getBBox(text);
			
			var textWidth = bbox.width + em;
			var textHeight = bbox.height;

			var bx = x;
			var by = y;
			
			if (bullet) {
				if (bulletType == 'circle') {
					bullet.setAttribute("cx", x + bulletSize / 2);
					bullet.setAttribute("cy", y + em / 2 - 2);
					bullet.setAttribute("r", bulletSize / 2);
				} else {
					bullet.setAttribute("x", x);
					bullet.setAttribute("y", y + (em - bulletSize) / 2 - 2);
					bullet.setAttribute("width", bulletSize);
					bullet.setAttribute("height", bulletSize);
				}
				
				var itemBulletStyle = item.bullet && item.bullet.style ? item.bullet.style : {};
				var fill = itemBulletStyle.fill || optionsBulletStyle.fill || "#ff0000";
				
				bullet.setAttribute("fill", fill);
			}
			
			if (direction == 'horizontal') {
				x+= textWidth;
				if (x > width) {
					y+= textHeight;
					x = 0;
				}
			} else {
				y+= textHeight;
			}
			
		}
		w = width;
		h  = y + textHeight;
		return {
			width: w, 
			height: h
		}
	}
	
	
	return SVGUtils;
})();