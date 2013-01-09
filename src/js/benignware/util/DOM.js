(function() {
	
	var Class = benignware.core.Class;
	var StringUtils = Class.require("benignware.util.StringUtils");
	var ArrayUtils = Class.require("benignware.util.ArrayUtils");
	var Element = Class.require("benignware.core.Element");
	
	/**
	 * DOM utility methods
	 * @package benignware.util
	 * @class DOM
	 */
	
	function DOM() {
	}
	
	Class.register('benignware.util.DOM', DOM);
	
	DOM.NAMESPACE_XML = "http://www.w3.org/2000/xmlns/";
	DOM.NAMESPACE_XHTML = "http://www.w3.org/1999/xhtml";
	
	
	/**
	 * Checks if the specified element is a childnode of the specified parent.
	 * @static
	 * @method isChildOf
	 * @param {benignware.core.Element} child
	 * @param {benignware.core.Element} parent
	 * @return {Boolean} true if the specified element is a child of the specified parent
	 */
	DOM.isChildOf = function(child, parent) {
		if (parent == child) return false;
		var c = child;
		try {
			while (c) {
				//if (c==child.ownerDocument.body) return false;
				if (child.ownerDocument != null && c == child.ownerDocument.documentElement) return false;
				if (c.parentNode == parent) return true;
				if (c.parentNode == null) return false; 
				c = c.parentNode;
				
			}
		} catch (e) {
			//console.error(e);
		}
		return false;
	}
	
	DOM.getElementsByTagName = function(element, tagName, recursive){
		return DOM.getElementsByTagNameNS(element, null, tagName, recursive);
	}
	
	DOM.getElementsByTagNameNS = function(element, namespaceURI, tagName, recursive) {
		recursive = (typeof(recursive) != "undefined") ? recursive : true;
		var result = [];
		if (!element) return result;
		tagName = tagName.toLowerCase();
		element = (typeof(element.ownerDocument) == "undefined") ? element.documentElement : element;
		for (var i=0;i<element.childNodes.length;i++) {
			var node = element.childNodes[i];
			if (node.nodeType == 1) {
				if (namespaceURI && node.namespaceURI == namespaceURI || !namespaceURI) {
					var localName = DOM.getLocalName(node);
					if (localName != null && localName.toLowerCase() == tagName) { 
						result.push(node);
					}
				}
				if (recursive) {
					var r = DOM.getElementsByTagNameNS(node, namespaceURI, tagName, recursive);
					if (r.length) result = result.concat(r);
				}
			}
		}
		return result;
	}
	
	
	DOM.getParentByClass = function(element, classObj) {
		if (element) {
			var node = element.parentNode;
			while(node) {
				if (node && Class.instanceOf(node, classObj)) {
					return node;
				}
				node = node.parentNode;
			}
		}
		
		return null;
	}
	
	DOM.getParentByTagName = function(elem, tagName) {
		var node = elem;
		while(node != null && node.parentNode != null) {
			node = node.parentNode;
			if (node.nodeName.toLowerCase() == tagName.toLowerCase()) return node;
			if (node == elem.ownerDocument) break;
		}
		return null;
	}
	
	DOM.getParentElementByCSSName = function(elem, cssName) {
		while(elem.parentNode != null) {
			elem = elem.parentNode;
			if (Element.hasCSSName(elem, cssName)) return elem;
		}
		return null;
	}
	
	
	/**
	 * returns the deepest single element
	 */
	DOM.getDeepestElement = function (element, single, first, nodeType) {
		single = typeof(single) == "undefined" ? true : single;
		first = typeof(first) == "undefined" ? true : first;
		nodeType = typeof(nodeType) == "undefined" ? 1 : nodeType;
		while (element) {
			var nodes = element.childNodes;
			if (nodes.length > 0) {
				var child = first ? element.firstChild : nodes[nodes.length - 1];
				if ((!single || nodes.length == 1) && (!nodeType || child.nodeType == nodeType)) {
					element = child;
				} else {
					break;
				}
			} else {
				break;
			}
		}
		return element;
	}
	
	DOM.isComplexElement = function(element) {
		return ArrayUtils.filter(element.attributes, function(obj) {
			return obj.name != 'xmlns';
		}).length > 0 || ArrayUtils.filter(element.childNodes, function(obj) {
			return obj.nodeType == 1;
		}).length > 0;
	}
	
	DOM.isSimpleElement = function(node) {
		return !DOM.isComplexElement(node);
	}
	
	
	DOM.toJSON = function(node, listTypes) {
		listTypes = listTypes || [];
		excludedAttributes = ['xmlns'];
		var result = {}
		if (node.attributes) {
			for (var i = 0; i < node.attributes.length; i++) {
				var attr = node.attributes[i];
				var name = attr.name;
				if (!ArrayUtils.contains(excludedAttributes, name)) {
					result[name] = attr.value;
				}
			}
		}
		if (node.childNodes) {
			for (var i = 0; i < node.childNodes.length; i++) {
				var child = node.childNodes[i];
				
				if (child.nodeType == 1) {
					var name = child.nodeName;
					var isComplex = DOM.isComplexElement(child);
					
					if (!listTypes.length && isComplex || ArrayUtils.contains(listTypes, name)) {
						
						var listName = StringUtils.pluralize(name);
						var obj = DOM.toJSON(child, listTypes);
						var array = result[listName];
						if (!array) {
							
							result[listName] = array = [];
						}
						array.push(obj);
					} else {
						if (!ArrayUtils.contains(excludedAttributes, name)) {
							if (DOM.isSimpleElement(child)) {
								result[name] = child.textContent;
							} else {
								result[name] = DOM.toJSON(child, listTypes);
							}
						}
					}

				}
			}
		}
		
		return result;
	}
	
	
	DOM.serializeToString = function(node) {
		
		if (typeof node.xml != "undefined") {
	        return node.xml;
	    } else if (typeof window.XMLSerializer != "undefined") {
	        return (new window.XMLSerializer()).serializeToString(node);
	    } 

		return null;
	}

	
	DOM.parseFromString = function(string, contentType) {

		contentType = contentType || "text/xml";
		var result = null;
		if (typeof string != "string") {
			return null;
		}
		string = StringUtils.trim(string);
		if (!StringUtils.startsWith(string, "<")) {
			return null;
		}
		if (typeof DOMParser != "undefined") {
			// has dom parser
			
			
			var parser = new DOMParser();
			if (!window.opera) {
				//contentType != "text/html" && 
				try {  
			        // WebKit returns null on unsupported types  
					
					result = parser.parseFromString(string, contentType);
					
			    } catch (ex) {
			    	console.error(ex);
			    }
			}
			
		    
		    if (result) {  
	            // text/html parsing is natively supported  
	            return result;  
	        }  
			
		    if (/^\s*text\/html\s*(?:;|$)/i.test(contentType)) {  
		    	
	            var doc = document.implementation.createHTMLDocument("")
	              , doc_elt = doc.documentElement
	              , first_elt;

	            var div = doc.createElement('div');
	            div.innerHTML = string;
	            
	            var b = doc.body;

	            for (var i = 0; i < div.childNodes.length; i++) {
	            	var child = div.childNodes[i];
	            	var tagName = child.nodeName.toLowerCase();
					if (tagName != "meta" && tagName != "link" && tagName != "title" && tagName != "script") {
						doc.body.appendChild(child);
						i--;
					} else {
						console.log("eliminate script tag");
					}
	            	
	            }

	            return doc;  
	        }

		} else {
			if (typeof ActiveXObject != "undefined") {
				// ie
		         var doc = new ActiveXObject("MSXML.DomDocument");
		         doc.loadXML(str);
		        result = doc;
			} else if (typeof XMLHttpRequest != "undefined") {
		         var req = new XMLHttpRequest;
		         req.open("GET", "data:" + (contentType || "application/xml") +
		                         ";charset=utf-8," + encodeURIComponent(str), false);
		         if (req.overrideMimeType) {
		            req.overrideMimeType(contentType);
		         }
		         req.send(null);
		         result = req.responseXML;
			}
		}
		
		
		if (result && result.documentElement && result.documentElement.nodeName === "parsererror") {
			return null;
		}
		return result;
	}
	
	DOM.unescape = function(element) {

		element = element.documentElement || element; 
		  
		if (element.nodeType == 3 || element.nodeType == 4) {
			var typeAttrValue = element.parentNode.getAttribute("type");
			var namespaceURI = typeAttrValue && typeAttrValue.indexOf("html") >= 0 ? DOM.NAMESPACE_XHTML : element.parentNode.namespaceURI;
			
			var html = DOM.parseFromString("<html><body>" + element.nodeValue + "</body></html>", "text/html");
			
			var body = html.getElementsByTagName("body")[0];
			var children = body.childNodes;
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				var imported = element.ownerDocument.importNode(child, true);
				if (imported.nodeType == 1) {
					imported.setAttribute("xmlns", namespaceURI);
				}
				element.parentNode.insertBefore(imported, element);
			}
			element.parentNode.removeChild(element);
		} else if (element.nodeType == 1) {
			for (var i = 0; i < element.childNodes.length; i++) {
				var child = element.childNodes[i];
				DOM.unescape(child);
			} 
		}
		
	}
	
	DOM.unescapeCData = function(elem, namespaceURI) {
		if (!elem) {
			return;
		}
//		var namespaceURI = namespaceURI || "http://www.w3.org/1999/xhtml";
		var namespaceURI;
		var string = StringUtils.trim(elem.nodeValue);
		if (string) {
			// unescape textnode
			if (elem.nodeType == 4) {
				// cdata
				var fragment = DOM.parseFromString(elem.ownerDocument, string, "text/html");
				var div = elem.parentNode.ownerDocument.createElement("div");
				div.setAttribute("xmlns", namespaceURI);
				div.appendChild(fragment);
				elem.parentNode.appendChild(div);
				elem.parentNode.removeChild(elem);
			}
		}
		
		
		if (elem.childNodes) {
			for (var i = 0; i < elem.childNodes.length; i++) {
				DOM.unescapeCData(elem.childNodes[i]);
			}
		}
		
	}
	
	DOM.stripAttributes = function(elem, attributes) {
		if (!elem) {
			return;
		}
		elem = elem.documentElement ? elem.documentElement : elem;
		if (elem.nodeType == 1) {
			for (var a = 0; a < attributes.length; a++) 
				elem.removeAttribute(attributes[a]);
			
			for (var i = 0; i < elem.childNodes.length; i++) 
				DOM.stripAttributes(elem.childNodes[i], attributes);
		}
		return elem;
	}
	
	DOM.next = function(element) {
		if (element.firstChild) {
			return element.firstChild;
		}
		if (element.nextSibling) {
			return element.nextSibling;
		}
		while (element.parentNode) {
			if (element.parentNode.nextSibling) {
				return element.parentNode.nextSibling;
			}
			element = element.parentNode;
		}
		return null;
	}
	
	DOM.previous = function(element) {
		
		if (element.previousSibling) {
			if (element.previousSibling.lastChild) {
				return element.previousSibling.lastChild;
			}
			return element.previousSibling;
		}
		
		if (element.parentNode) {
			if (element.parentNode.firstChild == element) {
				return element.parentNode;
			}
		}
		while (element.parentNode) {
			if (element.parentNode.previousSibling) {
				return element.parentNode.previousSibling;
			}
			element = element.parentNode;
		}
		return null;
	}
	
	return DOM;
})();