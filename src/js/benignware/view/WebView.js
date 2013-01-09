(function() {
	
	var Class = benignware.core.Class;
	var Event = Class.require('benignware.core.Event'); 
	var Element = Class.require('benignware.core.Element'); 
	var StringUtils = Class.require('benignware.util.StringUtils'); 
	var Loader = Class.require('benignware.core.Loader'); 
	
	var ImageLoader = Class.require('benignware.util.ImageLoader'); 
	
	var ActivityView = Class.require('benignware.view.ActivityView'); 
	var ScrollView = Class.require('benignware.view.ScrollView'); 
	
	
	// private class
	var PageWrap;
	
	
	/**
	 * not yet implemented.
	 * @class ListView
	 */
	var WebView = Class('benignware.view.WebView', (function() {
		
		var _parent;
		
		function WebView() {
			
			var __parent = _parent.apply(this, arguments);
			
			var webView = this;
			
			var _pageWrap = false;
			
			
			this.getPageWrap = function() {
				return _pageWrap;
			}
			
			this.setPageWrap = function(bool) {
				bool = StringUtils.toBoolean(bool);
				if (bool != _pageWrap) {
					_pageWrap = bool;
					this.invalidate();
				}
			}
			
			this.getPageWrap = function() {
				return _pageWrap;
			}
			
			var loader = new Loader();
			var imageLoader = new ImageLoader();
			this.complete = true;
			
			webView.addEventListener('itemadded', function(event) {
				imageLoader.add(event.item);
			});
			
			webView.addEventListener('itemremoved', function(event) {
				imageLoader.remove(event.item);
			});
			
			imageLoader.onloadstart = function(event) {
				webView.contentElem.style.display = "";
				var activityView  = webView.activityView;
				activityView.setStatus(ActivityView.STATUS_PROGRESS, webView.loadingText);
				activityView.show();
			}
			
			imageLoader.oncomplete = function(event) {
				var activityView  = webView.activityView;
				if (loader.complete) {
					complete.call(webView);
				}
			}
			
			function complete() {
				var activityView  = this.activityView;
				activityView.hide();
				this.contentElem.style.display = "";
				this.invalidate();
				this.complete = true;
				this.dispatchEvent(Event.create(this.ownerDocument, 'complete', false, false));
				this.dispatchEvent(Event.create(this.ownerDocument, 'contentcomplete', false, false));
			}
			
			function error() {
				var activityView  = this.activityView;
				activityView.setStatus(ActivityView.STATUS_ERROR, this.errorText);
				this.complete = true;
				this.dispatchEvent(Event.create(this.ownerDocument, 'complete', false, false));
				this.dispatchEvent(Event.create(this.ownerDocument, 'contentcomplete', false, false));
				
			}
			
			this.load = function(url, options) {
				var activityView  = webView.activityView;
				options = options || {};
				var successCallback = options.success;
				var errorCallback = options.error;
				options.type = options.type || Loader.TYPE_HTML;
				options.success = function(event) {
					var html = event.data.body.innerHTML;
					// TODO: remove old style
					var cssName = event.data.body.className;
					webView.addCSSName(cssName);
					webView.setHtml(html);
					if (imageLoader.isComplete()) {
						complete.call(webView);
					}
					if (successCallback) successCallback(event);
				}
				options.error = function(event) {
					error.call(webView);
					if (errorCallback) errorCallback(event);
				}
//				loader.oncomplete = function(event) {
					
//					console.log("LOAD COMPLETE", loader.data);
					
					//webView.setHTML(event.data);
					
					// TODO: check for images to load
					//webView.dispatchEvent(Event.create(this.ownerDocument, 'complete', false, false));
//				}
				
				this.complete = false;
				this.contentElem.style.display = "none";
				activityView.setStatus(ActivityView.STATUS_PROGRESS, webView.loadingText);
				activityView.show();
				loader.load(url, options);
				return loader;
			}
		}
		
		Class.extend(ScrollView, WebView);
		_parent = Class.getParent(WebView);
		
		/**
		 * reference to the webview's activity view
		 * @property activityView
		 * @return {benignware.view.ActivityView} activityView the activity view element
		 */
		WebView.prototype.activityView = null;
		
		function initNestedViews() {
			for (var i = 0; i < this.size(); i++) {
				var item = this.get(i);
				if (item.nodeType == 1) {
					if (!Class.instanceOf(item, ScrollView)) {
						Element.initialize(item, ScrollView);
						
//						item.setScrollerMethod(ScrollView.SCROLLER_METHOD_TRANSFORM);
						console.log("set scroll method: ", item.getScrollerMethod());
					}
					item.style.width = "100%";
					item.style.height = "100%";
				}
				
			}
			
		}
		
		WebView.prototype._initialize = function() {
			_parent._initialize.apply(this, arguments);
			//this.pagingEnabled = true;
//			this.setScrollerMethod(ScrollView.SCROLLER_METHOD_OVERFLOW);
			//this.setLayout('horizontal-client-fit');
			this.setDisplayManagement(false);
		}
		
		WebView.prototype._createChildren = function() {
			_parent._createChildren.apply(this, arguments);
			var activityView = Element.create(this.ownerDocument, ActivityView);
			activityView.hide();
			this.appendChild(activityView);
			this.activityView = activityView;
		}
		
		WebView.prototype._update = function() {

			
			if (this.getPageWrap()) {
				layoutPageWrap.call(this);
			} else {
				initNestedViews.call(this);
			}
			//
			
//			_parent._update.apply(this, arguments);
//
//			var pageWrap = this.getPageWrap();
//			if (pageWrap && __private.pageWrapObj && __private.pageWrapObj.pages.length > 0) {
//				if (!layout || layout == ScrollContainer.NONE) {
//					return ScrollContainer.AUTO;
//				}
//			}
			
			
			_parent._update.apply(this, arguments);
			
			
			this.activityView.invalidate();
			
		}
		
		/**
		 * sets the loading message of the component's activity view
		 * @property loadingText
		 * @return {String} the message to be displayed
		 */
		WebView.prototype.loadingText = 'Loading...';
		
		/**
		 * sets the error message of the component's activity view
		 * @property errorText
		 * @return {String} the message to be displayed
		 */
		WebView.prototype.errorText = 'An error occured.';

		
		WebView.prototype._pageWrapObject = null;
		
		WebView.prototype.add = function(item, index) {
//			console.log("add item to page view: ", item, index, this._pageWrapObject);
			if (this._pageWrapObject) {
				this._pageWrapObject.restore();
			}
			_parent.add.call(this, item, index);
		}
		
		 function layoutPageWrap() {
			
			var pageWrap = this.getPageWrap();
			var pageWrapObject = this._pageWrapObject;
			
			var cls = this.getClientSize();
			var clw = cls.width;
			var clh = cls.height;
			
			var layout = this.getLayout();
			
//			var hap = this.getHorizontalAlign();
//			var vap = this.getVerticalAlign();
			
			if (pageWrap == true) {
				
				if (!pageWrapObject) {
					this._pageWrapObject = pageWrapObject = new PageWrap(this.contentElem);
				}
				
				pageWrapObject.pageWidth = clw;
				pageWrapObject.pageHeight = clh;
				
				// do the page wrap
				var pages = pageWrapObject.update();
				
				if (pages.length > 0) {
					//
					for (var i = 0; i < pages.length; i++) {
						this.contentElem.appendChild(pages[i]);
					}
					// use pages as layout items
					// apply horizontal layout and top alignment
//					layout = layout != ScrollContainer.NONE ? layout : ScrollContainer.AUTO;
//					vap = ScrollContainer.TOP;
					this.contentElem.className = "";
				}
				
			} else if (pageWrapObject) {
				pageWrapObject.restore();
			}
			
//			__super.layoutContent.call(this);
		}
		
		return WebView;
		
	})());
	
	
	
	
	
	/**
	 * private class PageWrap
	 */
	
	
	PageWrap = (function() {

		
		var Element = benignware.core.Element;
		
		
		function PageWrap(content) {
			this.content = content;
			this.pages = [];
		}
		
		PageWrap.prototype.content = null;
		PageWrap.prototype.pages;
		PageWrap.prototype.pageWidth = 0;
		PageWrap.prototype.pageHeight = 0;
		PageWrap.prototype.originalItems = null;

		var currentParent;
		var currentPage;
		var currentPageHeight;
		
		var currentElement;
		var lastElement;
		
		var content;
		
		var pageWidth;
		var pageHeight;
		var pages;
		
		var currentPageFragment;
		var contentFragment;
		var currentPageHeight = 0;
		var pageFragments = null;
		
		var breakBeforeElements = {
			'header': 'always'
		}
		
		var breakAfterElements = {
			'header': 'never'
		}
		
		var breakInsideElements = {
			'header': 'never'
		}
		
		
		PageWrap.MIN_PAGE_HEIGHT = 100;
		
		function processRestore(parent, items) {
			parent.innerHTML = "";
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				var node = item.node;
				if (node.nodeType == 1) {
					if (node.__originalStyleHeight) {
						node.style.height = node.__originalStyleHeight;
						delete node.__originalStyleHeight;
					}
					if (node.__originalElement) {
						delete node.__originalElement;
					}
					processRestore(node, item.children);
				} else if (node.nodeType == 3) {
					node.nodeValue = item.value;
				}
				parent.appendChild(node);
			}
		}
		
		PageWrap.prototype.restore = function() {
			console.log("****** RESTORE", this.content.parentNode);
			if (!this.originalItems) {
				return;
			}
//					var content = this.content;
			// clear content
			this.content.innerHTML = "";
			
			processRestore(this.content, this.originalItems);
			
			this.originalItems = null;
			
		}
		
		function getItems(element, rec) {
			var items = [];
			for (var i = 0; i < element.childNodes.length; i++) {
				var child = element.childNodes[i];
				var item = {
					node: child
				}
				if (child.nodeType == 1) {
					item.children = rec ? getItems(child, rec) : [];
				} else if (child.nodeType == 3) {
					item.value = child.nodeValue.toString();
				}
				items.push(item);
			}
			return items;
		}
		
		var level = 0;
		var pageCreated = false;
		
		// end page
		
		function endPage() {
			
			if (pageCreated) {
				var page = content.cloneNode(false);
				page.__originalNode = content;
//				var page = document.createElement("div");
//				page.setAttribute("class", "contentLayerPage");
				page.removeAttribute("id");
				var p = Element.getBorderMetrics(page, 'padding');
				page.style.width = pageWidth + "px";
				page.style.height = pageHeight + "px";
				page.style.overflow = "";
//				
//				page.style.width = "100%";
				for (var i = 0; i < content.childNodes.length; i++) {
					page.appendChild(content.childNodes[i--]);
				}
				
//				console.log("END PAGE AT ", page);
				pages.push(page);
				pageCreated = false;
				currentPage = page;
				
			}
			
		}
		
		// create page
		function createPage() {
			
			console.log("CREATE PAGE!!!!!!!!!!!!", currentParent);
//			console.time("CREATE PAGE");

			var ancestors = [];
			
			if (currentParent) {
				var parent = currentParent;
				while(parent && parent != content) {
//					console.log("ADD ANCESTOR: ", parent);
					ancestors.push(parent);
					parent = parent.parentNode;
				}
			}
			
			endPage();
			
			pageCreated = true;

			currentParent = content;
			
			for (var a = ancestors.length - 1; a >= 0; a--) {
				var ancestorClone = ancestors[a].cloneNode(false);
				ancestorClone.__originalNode = ancestors[a];
//				console.log("CREATE PAGE: ancestorClone", ancestorClone);
				currentParent.appendChild(ancestorClone);
				currentParent = ancestorClone;
			}
			
//					console.log("CREATE PAGE", currentParent);
//					
//					for (var i = 0; i < addAfterBreak.length; i++) {
//						currentParent.appendChild(addAfterBreak[i]);
//					}
			
			// reset
			
//			console.timeEnd("CREATE PAGE");
			
			currentPageHeight = 0;
			
			return currentParent;
		}
		
		
		// main
		function processChildren(element, level) {
			
			// save items
			var items = [];
			for (var i = 0; i < element.childNodes.length; i++) {
				var child = element.childNodes[i];
				items.push(child);
			}
			
			// clear content
			element.innerHTML = "";

			// process children
			var lastIndex = 0;
			var lastChild = null;
			
			for (var i = 0; i < items.length; i++) {
				var child = items[i];
//				child.style.width = "auto";
//				child.style.height = "auto";
//				
				var p = contentPadding;
				var beforeHeight = Element.getOuterHeight(content) - p.top - p.bottom;
				var breakPage = false;
				
				if (child.nodeType == 3 && !StringUtils.trim(child.nodeValue)) {
//					console.log("EMPTY TEXTNODE");
					continue;
				}
//				console.time("PROCESS CHILD");
//				console.log("PROCESS CHILD", child);
				
				
				
				if (child.nodeType == 1) {
					
					
					// include only static and relative
//					if (Element.getComputedStyle(child, 'position') != 'relative' 
//						|| Element.getComputedStyle(child, 'position') != 'static') {
//						continue;
//					}
					

					// break before
					
					
					if (breakBeforeElements[child.nodeName.toLowerCase()] == "always") {
//						alert("BREAK BEFORE" + currentPage + " - ");
						
						if (content.childNodes.length > 0) {
							
							var firstChild = DOM.getDeepestFirstChild(content);
//							console.log("CREATE BREAK BEFORE PAGE", child, firstChild == currentParent);
							if (firstChild && firstChild != currentParent) {
								createPage();
							}
						}
					} else {
						
						for (var x in breakBeforeElements) {
							var elements = child.getElementsByTagName(x);
							if (elements.length) {
								// has break before children
//								console.log("BREAK BEFORE CHILDREN: ", x);
								breakPage = true;
							}
						}
						
					}
				}
				
				
				// add child
				currentParent.appendChild(child);
				
				if (!breakPage) {
					// height testing
					
					// process percent height
//					if (child.nodeType == 1) {
//						if (child.style.height.indexOf("%") > 0) {
//							if (child.offsetParent == content) {
//								var elemHeight = parseInt(child.style.height) / 100 * pageHeight;
//								child.__originalStyleHeight = child.style.height;
//								Element.setHeight(child, elemHeight);
//							}
//						}
//					}
					
					
					
					var height = content.scrollHeight - p.top - p.bottom;
//					console.timeEnd("ELEMENT HEIGHT TESTING");
					console.log("PROCESS CHILD: ", level, i, " >> ", child, "HEIGHT: ", height, "PAGE HEIGHT: ", pageHeight);
					
//					if (child.__originalStyleHeight && height >= pageHeight) {
//						if (beforeHeight > 0) {
//							currentParent.removeChild(child);
//							createPage();
//							i--;
//							lastChild = null;
//						} else {
//							createPage();
//						}
//						continue;
//					}
					
					
					if (height > pageHeight) {
						console.log("BREAK AT ", child);
						breakPage = true;
					}
					
					if (height == pageHeight) {
						createPage();
						continue;
					}

				}
				
				
				if (breakPage) {
					
					// handle break
					
					// break inside
//					if (breakInsideElements[child.nodeName.toLowerCase()] == "never") {
////						console.log("BREAK INSIDE");
//						currentParent.removeChild(child);
//						createPage();
//						currentParent.appendChild(child);
//						continue;
//					}
//
//					// break after
//					if (lastChild && content.childNodes.length > 1 && 
//							breakAfterElements[lastChild.nodeName.toLowerCase()] == "never") {
////						console.log("BREAK AFTER", child, currentParent, content.childNodes.length);
//						createPage();
//						currentParent.appendChild(lastChild);
//						i--;
//						lastChild = null;
//						continue;
//					}
					
					if (child.nodeType == 1) {
						var breakingElement = child;
						// element break
//						console.log("BREAKING ELEMENT: ", child.nodeName, child.getAttribute ? child.getAttribute('class') : "", height, pageHeight);
						
						if (child.nodeName.toLowerCase() == "img" 
							|| child.nodeName.toLowerCase() == "iframe") {
//							createPage();
//							currentParent.appendChild(child);
						} else if (child.nodeName.toLowerCase() == "br") {
//							createPage();
						} else {
//							console.log("PROCESS CHILDREN");
//							console.time("PROCESS CHILDREN");
							currentParent = child;
							processChildren(child, level + 1);
//							console.timeEnd("PROCESS CHILDREN");
						}

					} else if (child.nodeType == 3) {
						// text break
						console.time("PROCESS TEXT");
						
						processText2(child);
						
//						
//						console.timeEnd("PROCESS TEXT");
					}
					
				} else {
					// fits
//					console.log("FITS!!!");
					if (child.nodeType == 1 || child.nodeType == 3) {
						lastChild = child;
						lastIndex = i;
					}
					
				}
//				console.timeEnd("PROCESS CHILD");
			}
			if (level > 0) {
				// move to parent node
				currentParent = currentParent.parentNode;
			}
			
			
		}
		
		
		function processText1(child) {
			
			currentParent.removeChild(child);
			
			var p = contentPadding;
			var words = child.nodeValue.split(/\s+/);

			var textNode = document.createTextNode("");
			textNode.__originalNode = child;
			currentParent.appendChild(textNode);
			
//			console.log("PROCESS WORDS", words);
			// process text
			var text = "";
			var c = 0;
			
			for (var w = 0; w < words.length; w++) {
				c++
				var word = words[w];
				var lastText = text;				
				text+= word;
				
				if (text && w < words.length - 1) {
					 text+=" ";
				}
				
				
				textNode.nodeValue = text;
				height = content.scrollHeight - p.top - p.bottom;
				if (w < 10) {
//					console.log("MEASURE TEXT HEIGHT", w, word, height, pageHeight);
				}
//				
				if (height >= pageHeight) {
					
//					console.log("BREAKING WORD: ", w, word, " LAST TEXT: ", lastText);
					textNode.nodeValue = lastText;		
					createPage();					
					textNode = document.createTextNode("");
					textNode.__originalNode = child;
					currentParent.appendChild(textNode);
					text = "";
					// start over from last element
//					console.log("START OVER FROM LAST WORD: ", w);
					
					
//					if (w > 1) {
//						w = w - 1;
//					}
					
				 }
				
				if (c > 200) break;
			} 
		}
		
		
	function processText2(child) {
			
			currentParent.removeChild(child);
			
			var p = contentPadding;
			var words = child.nodeValue.split(" ");

//			console.log("PROCESS WORDS", words);
			// process text
			
			var a = 0, b = 0;
			var rest = "";
			var s;
			
			do {
				
				
				
				a++
				if (a > 100) {
					console.log("!!!!!!!!!!!!! INFINITE LOOP A");
					break;
				}
				//
				
				var textNode = document.createTextNode("");
				textNode.__originalNode = child;
				currentParent.appendChild(textNode);
				
				var min = 0;
				var max = words.length - 1;
				s = max;
//				console.log("**** FIND NEXT BREAK", words.length);
				
				var breakText = false;
				
				breakingWord = "";
				
				do {
					
					
					b++
					if (b > 200) {
						console.log("!!!!!!!!!!!! INFINITE LOOP B");
						break;
					}
					//
					
					
					
					var parts = words.slice(0, s + 1);
					var text = parts.join(" ");
					
					textNode.nodeValue = text;
					
//					console.log("*** TEST WORD LEN: ", words.length, " S: ", s, "MIN: ", min, "MAX", max, text);
					

					
					height = content.scrollHeight - p.top - p.bottom;
//					console.log("HEIGHT: ", height, " = ", pageHeight);

					if (height > pageHeight) {
						
//							console.log("TOO BIG", s, min, max, height);
//							textNode.nodeValue = text;		
//							createPage();					
//							textNode = document.createTextNode("");
//							textNode.__originalNode = child;
//							currentParent.appendChild(textNode);
						
//							breakText = true;
//							break;
						
						
						if (max - min <= 1) {
//							console.log("TOO BIG BREAKING WORD IS AT ", s, text, height);
							textNode.nodeValue = s > 0 ? words.slice(0, s - 1).join(" ") : "";
//							console.log("TOO BIG BREAKING WORD IS AT ", textNode.nodeValue);
							breakText = true;
							break;
						}
						max = s;
					 } else if (height < pageHeight) {
//						console.log("TOO SMALL", s, min, max, height);
						min = s;
						if (s == max) {
							break;
						}
						if (max - min <= 1) {
//							console.log("TOO SMALL BREAKING WORD IS AT ", s, text, words[s]);
							textNode.nodeValue = words.slice(0, s - 1).join(" ");
//							textNode.nodeValue+= text;
							breakText = true;
							break;
						}
					 } else if (height == pageHeight) {
						 breakText = true;
						 break;
					 }
					
					
					

					s = min + Math.floor((max - min) / 2);
					
					
					
				} while(!breakText && max > 0);
				
				console.log("END LOOP B", s);
				if (breakText) {
					
//					console.log("BREAKING WORD IS AT ", s, text, words[s]);
					
					words = words.slice(s + 1);
					
					createPage();		
					
					
				} else {
					break;
				}
				
				
			} while (words.length > 0);
			
			
		}
		
	
	function ceil(n) {
		var f = (n << 0),
	    f = f == n ? f : f + 1;
		return f;
//		return Math.ceil(x);
//		var n = Math.abs(x);
//		var f = (n << 0),
//		f = f == n ? f : f + 1;
//		return f;
//		return parseInt (Math.abs (x)) + 1
	}
		
		PageWrap.prototype.update = function() {
			console.time("PageWrap", this.content);
			var ws = this.content.style.width;
			var hs = this.content.style.height;
			var ls = this.content.style.left;
			var ts = this.content.style.top;
			var ps = this.content.style.position;
			var os = this.content.style.overflow;
			//
//			this.content.style.overflow = "hidden";
//			this.content.style.position = "static";
//			this.content.style.left = "0px";
//			this.content.style.top = "0px";
//			this.content.style.width = "100%";
//			this.content.style.height = "100%";
			
			this.content.style.width = "auto";
			this.content.style.height = "auto";
			this.content.style.overflow = "visible";
			
			this.pages = [];
			
			if (this.originalItems) {
				this.restore();
//				console.log("RETURN");
//				this.content.style.height = hs;
//				this.content.style.left = ls;
//				this.content.style.top = ts;
//				this.content.style.position = ps;
//				return [];
			}
			this.originalItems = getItems(this.content, true);
			// setup private variables
			content = this.content;
			
			currentParent = null;
			currentPage = null;
			
			currentPageHeight = 0;
			
			pages = [];
			
			var p = Element.getBorderMetrics(content, 'padding');
			contentPadding = p;
			pageWidth = this.pageWidth - p.left - p.right;
			pageHeight = this.pageHeight - p.top - p.bottom;
//					pageHeight = this.pageHeight;
			pageHeight = pageHeight > PageWrap.MIN_PAGE_HEIGHT ? pageHeight : PageWrap.MIN_PAGE_HEIGHT;
//			console.log("****** PAGE HEIGHT: " + pageHeight);
			console.log("****** PAGEWRAP EXECUTE: ", this.content, pageHeight, Element.getHeight(content));
			currentPageFragment = null;
			pageFragments = [];
			
			// create first page
			
			createPage();
			// start processing
			processChildren(this.content, 0);
			// add rest page
			endPage();
			
			console.log("PAGES: ", pages);
			
			//
			this.pages = pages;
			this.content.style.width = ws;
			this.content.style.height = hs;
			this.content.style.left = ls;
			this.content.style.top = ts;
			this.content.style.position = ps;
			this.content.style.overflow = os;
			console.timeEnd("PageWrap");
			return pages;
		}
		
		return PageWrap;
	})();
	
	
	return WebView;
})();