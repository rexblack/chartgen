(function() {
	
	var Class = benignware.core.Class;
	var Event = Class.require('benignware.core.Event');
	var StringUtils = Class.require('benignware.util.StringUtils');
	var Component = Class.require('benignware.core.Component'); 
	var Element = Class.require('benignware.core.Element'); 
	var CSS = Class.require('benignware.util.CSS'); 
	var ItemLayout = Class.require('benignware.layout.ItemLayout'); 
	var ScrollView = Class.require('benignware.view.ScrollView'); 
	
	CSS.setDefaultStyle('.benignware-view-PageControl', 'position', 'relative');
	CSS.setDefaultStyle('.benignware-view-PageControl', 'text-align', 'center');
//	CSS.setDefaultStyle('.benignware-view-PageControl', 'min-height', '28px');
	
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'display', 'inline-block');
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'margin', '10px 3px');
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'width', '8px');
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'height', '8px');
//	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'border', '1px solid #1b1b1b');
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'border-radius', '4px');
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'background', '#9a9a9a');
//	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator', 'cursor', 'pointer');
	
	CSS.setDefaultStyle('.benignware-view-PageControl .page-indicator.selected', 'background', '#efefef');
	
	
	var pushEvent = 'ontouchstart' in window ? 'touchstart' : 'mousedown';
	/**
	 * not yet implemented.
	 * @class benignware.view.PageControl
	 */
	return Class('benignware.view.PageControl', (function() {
		
		var _parent;
		
		function PageControl() {
			var __parent = _parent.apply(this, arguments);
			
			var pageControl = this;
			
			var _pages = 0;
			var _page = 1;
			var _pageIndicatorElements;
			
			var _selectable = false;
			
			var _view = null;
			
			
			this.setPages = function(pages) {
				_pages = pages;
				updatePages.call(this);
			}
			
			this.getPages = function() {
				return _pages;
			}
			
			this.setPage = function(page) {
				if (page != _page) {
					_page = page;
					updatePage.call(this);
				}
			}
			
			this.getPage = function() {
				return _page;
			}
			
			this.setSelectable = function(bool) {
				_selectable = StringUtils.toBoolean(bool);
				updatePages.call(this);
			}
			
			this.isSelectable = function() {
				return _selectable;
			}
			
			function itemChangeHandler(event) {
				updateView.call(pageControl, event.target);
			}
			
			function pageHandler(event) {
				updateView.call(pageControl, event.target);
			}
			
			function positionHandler(event) {
				updateView.call(pageControl, event.target);
			}
			
			
			function updateView(view) {
				if (view.size) {
					_pages = view.size();
					updatePages.call(this);
				}
				if (view.getPage) {
					_page = view.getPage();
					updatePage.call(this);
				} else if (view.getPosition) {
					_page = view.getPosition() + 1;
					updatePage.call(this);
				}
				
			}
			
			this.setView = function(view) {
				
				view = typeof view == 'string' ? document.getElementById(view) : view;
				console.log("set view", view);
				if (view != _view) {
					if (_view) {
						view.removeEventListener('itemchange', itemChangeHandler);
						view.removeEventListener('page', pageHandler);
						view.removeEventListener('position', positionHandler);
					}
					_view = view;
					if (view != null) {
						view.addEventListener('itemchange', itemChangeHandler);
						view.addEventListener('page', pageHandler);
						view.addEventListener('position', positionHandler);
						updateView.call(this, view);
					}
				}
			}
			
			this.getView = function() {
				return _view;
			}
			
			this.getPage = function() {
				return _page;
			}
			
			
		}
		
		Class.extend(Component, PageControl)
		_parent = Class.getParent(PageControl);
		
		PageControl.prototype.scrollView = null;
		
		PageControl.prototype._initialize = function() {
			_parent._initialize.apply(this, arguments);
		}
		
		PageControl.prototype._createChildren = function() {
			_parent._createChildren.apply(this, arguments);
		}
		
		PageControl.prototype._update = function() {
			_parent._update.apply(this, arguments);
//			var layout = new ItemLayout();
//			layout.element = this;
//			layout.orientation = "horizontal";
//			layout.perform();
		}
		
		function updatePage() {
			var page = this.getPage();
			for (var i = 0; i < this.childNodes.length; i++) {
				var pageIndicatorElem = this.childNodes[i];
				if (i == page - 1) {
					Element.addCSSName(pageIndicatorElem, 'selected');
				} else {
					Element.removeCSSName(pageIndicatorElem, 'selected');
				}
			}
		}
		
		function select() {
			var view = this.getView();
			if (view) {
				var page = this.getPage();
				if (view.scrollToPage) {
					view.scrollToPage(page);
				} else if (view.setPage) {
					view.setPage(page);
				} else if (view.setPosition) {
					view.setPosition(page - 1);
				}
			}
			this.dispatchEvent(Event.create(this.ownerDocument, 'select', false, false));
		}
		
		function updatePages() {
			var pageControl = this;
			this.innerHTML = "";
			var pages = this.getPages();
			for (var i = 0; i < pages; i++) {
				var pageIndicatorElem = this.ownerDocument.createElement('div');
				pageIndicatorElem.className = "page-indicator";
				(function() {
					var index = i;
					pageIndicatorElem.addEventListener(pushEvent, function(event) {
						if (pageControl.isSelectable()) {
							pageControl.setPage(index + 1);
							select.call(pageControl);
						}
					}, false);
				})();
				console.log("this.isSelectable(): ", this.isSelectable());
				pageIndicatorElem.style.cursor = this.isSelectable() ?  "pointer" : "";
				this.appendChild(pageIndicatorElem);
			}
			var clearElem = this.ownerDocument.createElement('div');
			clearElem.style.clear = "both";
			
			this.appendChild(clearElem);
			updatePage.call(this);
			this.invalidate();
		}
		
		return PageControl;
		
	})());

})();