(function() {
	
	// class imports
	var Class = benignware.core.Class;
	var Event = Class.require('benignware.core.Event');
	var EventDispatcher = Class.require('benignware.core.EventDispatcher');
	var DOM = Class.require('benignware.util.DOM');
	var StringUtils = Class.require('benignware.util.StringUtils');
	// init parent
	var _parent;
	
	/**
	 * Ajax loader
	 * @package benignware.core
	 * @class Loader
	 * @extends benignware.core.EventDispatcher
	 */
	
	// helper methods
	
	// returns cross browser http request
	function getXMLHttpRequest() {
		return typeof XMLHttpRequest != undefined ? new XMLHttpRequest() : typeof ActiveXObject != undefined ? new ActiveXObject('Microsoft.XMLHTTP') : null; 
	}
	
	// merge arrays
	function merge(a1, a2) {
		var result = [];
		for (var i = 0; i < arguments.length; i++) {
			var a = arguments[i];
			for (var x in a) {
				if (parseInt(x)) {
					result.push(a[x]);
				} else {
					result[x] = a[x];
				}
			}
		}
		return result;
	}
	
	
	/**
	 * Constructs a new loader.
	 * @constructor
	 * @param {String} method
	 * @param {Boolean} async
	 */
	
	var _parent;
	
	function Loader(method, async, type) {
		
		var __parent = _parent.apply(this, arguments);
		
		// setup public variables
		this.complete = true;
		this.method = method || "GET";
		this.async = typeof async != "undefined" ? async : true;
		this.type = type;
		this.variables = [];
		
		var queue = [];
		var requests = [];

		// privileged
		
		/**
		 * adds a new url to the request queue and starts loading immediately
		 * @privileged
		 * @method load
		 * @param {String} url the url of the request
		 * @param {Object} options an object containing optional arguments
		 */
		this.load = function(url, options) {
			
			options = options || {}

			queue.push({
				url: url, 
				status: 0, 
				options: {
					// options
					method: options.method || this.method, 
					async: typeof(options.async) != 'undefined' ? options.async : this.async, 
					variables: options.variables || this.variables, 
					type: options.type || this.type || getTypeByUrl(url) || Loader.TYPE_XML, 
					success: options.success, 
					error: options.error, 
					jsonp: options.jsonp || Loader.JSONP_CALLBACK_PARAM
				
			}, ready: function(item) {
				
				// remove item from current requests
				for (var i = 0; i < requests.length; i++) {
					if (item == requests[i]) {
						requests.splice(i, 1);
						break;
					}
				}

				// next
				next.call(this);
				
			}});
			
			if (!this.queued || requests.length == 0) {
				// start loading the queue
				next.call(this);
			}
			
		}
		
		
		// private
		function next() {
			
			
			
			if (queue.length > 0) {
				var item = queue.shift();
				requests.push(item);
				load.call(this, item);
			} else if (requests.length == 0) {

				complete.call(this);
			}
			
		}
		
		
	}
	
	
	// extend
	Class.extend(EventDispatcher, Loader);
	_parent = Class.getParent(Loader);
	// register
	Class.register('benignware.core.Loader', Loader);
	
	// private
	
	var jsonpCount = 0;
	
	function load(item) {
		
		// delegate target
		var loader = this;
		
		var request;
		
		var url = item.url;
		var options = item.options;
		var callback = item.callback;
		
		var method = options.method;
		var async = options.async;
		var variables = options.variables;
		
		var type = options.type;
		
		var jsonpCallbackParam = options.jsonp;
		var jsonpCallbackFunction = null;
		//var callbackFuncName = null;
		
		this.complete = false;
		
		// load start
		var loadStartEvent = Event.create("loadstart", false, false);
		loadStartEvent.url = url;
		this.dispatchEvent(loadStartEvent);
		
		// get url query
		var urlQuery = "";
		if (type == Loader.TYPE_JSONP || method == "GET") {
			
			var urlComponents = Loader.getURLComponents(url);
			var urlBase = (urlComponents.protocol ? urlComponents.protocol + "://" : "") + urlComponents.host + urlComponents.pathname;

			// merge with get params
			variables = merge(urlComponents.params, variables);
			
			if (type == Loader.TYPE_JSONP) {
				jsonpCount++;
				jsonpCallbackFunction = "__benignware_utils_Loader_jsonp_callback_" + jsonpCount;
				variables[jsonpCallbackParam] = jsonpCallbackFunction;
			}
			
			urlQuery = Loader.buildHTTPQuery(variables);
			
			url = urlBase + (urlQuery ? "?" + urlQuery : "");
		} else {
			
			urlQuery = Loader.buildHTTPQuery(variables);
		}
		
		var request = {
			status: 0
		}
		
		var head = document.getElementsByTagName('head')[0];
		
		switch (options.type) {
		
		case Loader.TYPE_STYLESHEET:
			
			// css
			
			if (head) {
				
				var linkElem = document.createElement("link");
				linkElem.setAttribute("rel", "stylesheet");
				linkElem.setAttribute("type", "text/css");
				
				linkElem.onerror = function(data) {
					request.status = 404;
					ready.call(loader, item, request);
				}
				
				linkElem.onload = function() {
					request.status = 200;
					ready.call(loader, item, request);
				}
				
				head.appendChild(linkElem);
				
				linkElem.setAttribute('href', url);
				
			}
		  
			break;
		
		case Loader.TYPE_JSONP: 
		case Loader.TYPE_JAVASCRIPT: 
			
			// jsonp/javascript
			if (head) {

				// jsonp callback
				window[jsonpCallbackFunction] = function(data) {
					request.data = data;
					window[jsonpCallbackFunction] = undefined;
				}
				var scriptElem = document.createElement('script');
				scriptElem.onerror = function(data) {
					scriptElem.parentNode.removeChild(scriptElem);
					window[jsonpCallbackFunction] = undefined;
					request.status = 404;
					ready.call(loader, item, request);
				}
				
				scriptElem.onload = function() {
					request.status = 200;
					request.responseText = scriptElem.textContent; 
					
					if (options.type == Loader.TYPE_JSONP) {
						scriptElem.parentNode.removeChild(scriptElem);
					}
					ready.call(loader, item, request);
				}
				
				head.appendChild(scriptElem);
				
				scriptElem.setAttribute('src', url);
				
			}
			
			
			break;
			
		default: 

			// xml http request
			request = getXMLHttpRequest();
		
			
			
			if (async == true) {
				
				// async
				
				request.onreadystatechange = function() {
					if (request.readyState == 4) {
						loader.status = request.status;
						ready.call(loader, item, request);
					}
				}
				
			}
			
			
			request.open(method, url, async);
			
			request.send(urlQuery || null);
		
			if (!async) {
				ready.call(this, item, request);
			}
		}
			
		
		
	}
	
	function ready(item, request) {

		if (request.status == 200) {

			// success
			
			var data = request.data;
			
			if (!data) {
				
				// resolve data
				
				var type = item.options.type;
				
				switch (type) {
				
					case Loader.TYPE_PLAIN_TEXT: 
						data = request.responseText;
						break;
				
					case Loader.TYPE_XML: 
						data = request.responseXML || DOM.parseFromString(request.responseText);
						break;
						
					case Loader.TYPE_HTML: 
						data = DOM.parseFromString(request.responseText, "text/html");
						break;
						
					case Loader.TYPE_JSON: 
						data = StringUtils.jsonDecode(request.responseText);
						break;
						
					case Loader.TYPE_JAVASCRIPT: 
						data = request.responseText;
						break;
						
					default: 
						// unknown data type
				}

			}
			
//			if (!data) {
//				// dispatch no data error
//				error.call(this, item);
//				return;
//			}
			
			// success
			this.data = data;
			
			loaded.call(this, item, data, request);
			
		} else {
			// network error
			error.call(this, item);
		}

		// next
		item.ready.call(this, item);
	}
	
	function loaded(item, data, request) {
		var loadEvent = Event.create("load", false, false);
		loadEvent.url = item.url;
		loadEvent.data = data;
		loadEvent.responseXML = request.responseXML;
		loadEvent.responseText = request.responseText;
		this.dispatchEvent(loadEvent);
		var callback = item.options.success;
		if (typeof callback == "function") {
			callback(loadEvent);
		}
	}
	
	function error(item) {
		var errorEvent = Event.create("error", false, false);
		errorEvent.url = item.url;
		var callback = item.options.error;
		if (typeof callback == "function") {
			callback(errorEvent);
		}
		this.dispatchEvent(errorEvent);
	}
	
	
	function complete() {
		
		this.complete = true;
		var completeEvent = Event.create("complete", false, false);
		this.dispatchEvent(completeEvent);
		
	}
	
	
	/**
	 * returns an object containing the components of the specified url
	 * @static
	 * @method getURLComponents
	 * @param {String} url the url
	 * @return {Object} an object containing the url components
	 */
	
	Loader.getURLComponents = function(url) {
		
		var result = {protocol: "", host: "", pathname:"", queryString:"", params:[]};
		var pattern = /^\s*(?:([a-z]*)\:\/\/([^\\\/]*))?(.*)?(.*)/i;
		var regex = new RegExp( pattern );
		var match = regex.exec(url);
		if (match) {
			result.protocol = match[1] || "";
			result.host = match[2] || "";
			result.pathname = match[3] || "";
			result.queryString = match[4] || "";
		}
		if (result.queryString) {
			var params = [];
			var queryString = result.queryString;
			queryString = StringUtils.startsWith(queryString, "?") ? queryString.substring(1) : queryString;
			if (queryString) {
				
				var pairs = queryString.split("&");
				for (var i = 0; i < pairs.length; i++) {
					var pair = pairs[i].split("=");
					var name = decodeURIComponent(pair[0]);
					var value = decodeURIComponent(pair[1]);
					var match = new RegExp(/^([a-z0-9_-]*)\[(.*)\]$/).exec(name);
					if (match) {
						name = match[1];
						key = match[2];
						if (!params[name]) {
							params[name] = [];
						}
						if (key) {
							params[name][key] = value;
						} else {
							params[name].push(value);
						}
					} else {
						params[name] = value;
					}
				}
				
			}
			result.params = params;
		}
		var base = result.protocol ? result.protocol + "//" + result.host : "";
		base+= result.pathname;
		result.base = base;
		return result;
	}
	
	
	/**
	 * constructs an url query with the specified params
	 * @static
	 * @method buildHTTPQuery
	 * @param {Object} params an object containing url params
	 * @param {Boolean} urlencoded specifies whether the resulting params should be encoded.
	 * @return {String} the url query
	 */
	
	Loader.buildHTTPQuery = function(params, urlencoded){
		urlencoded = typeof urlencoded == "boolean" ? urlencoded : true;
		var queryString = "";
		for (var name in params) {
			queryString += !queryString ? "" : "&";
			var value = urlencoded ? encodeURIComponent(params[name]) : params[name];
			queryString += name + "=" + value;
		}
		return queryString;
	}
	
	
	function getTypeByUrl(url) {
		var extension = StringUtils.getFileExtension(url);
		var type = null;
		switch (extension) {
		case 'xml':
		case 'html': 
		case 'json': 
		case 'jsonp': 
			type = extension;
			break;
		case 'txt': 
			type = Loader.TYPE_PLAIN_TEXT;
			break;
		case 'js':
			type = Loader.TYPE_JAVASCRIPT;
			break;
		case 'css': 
			type = Loader.TYPE_STYLESHEET;
			break;
		}
		return type;
	}
	
	// constants
	
	/**
	 * handles plain text data
	 * @field TYPE_PLAIN_TEXT
	 * @return {String} the plain text data type identifier - 'text'
	 */
	Loader.TYPE_PLAIN_TEXT = "text";
	
	/**
	 * handles xml data
	 * @field TYPE_XML
	 * @return {String} the xml data type identifier - 'xml'
	 */
	Loader.TYPE_XML = "xml";
	
	/**
	 * handles html data
	 * @field TYPE_HTML
	 * @return {String} the html data type identifier - 'html'
	 */
	Loader.TYPE_HTML = "html";
	
	
	/**
	 * loads and executes a css stylesheet
	 * @field TYPE_STYLESHEET
	 * @return {String} the css data type identifier - 'stylesheet'
	 */
	Loader.TYPE_STYLESHEET = "stylesheet";
	
	/**
	 * handles json data
	 * @field TYPE_JSON
	 * @return {String} the json data type identifier - 'json'
	 */
	Loader.TYPE_JSON = "json";
	
	/**
	 * loads and executes javascript code
	 * @field TYPE_JAVASCRIPT
	 * @return {String} the json data type identifier - 'json'
	 */
	Loader.TYPE_JAVASCRIPT = "javascript";
	
	/**
	 * handles jsonp data
	 * @field TYPE_JSONP
	 * @return {String} the jsonp data type identifier - 'json'
	 */
	Loader.TYPE_JSONP = "jsonp";
	
	
	/**
	 * the jsonp callback name. defaults to 'callback'
	 * @field TYPE_JSONP
	 * @return {String} the jsonp callback name
	 */
	Loader.JSONP_CALLBACK_PARAM = 'callback'
	
	/**
	 * the loadstart event fires when a request is sent.
	 * @event loadstart
	 */
	Loader.EVENT_LOADSTART = "loadstart";
	
	/**
	 * the load event fires when a request has been loaded.
	 * @event load
	 */
	Loader.EVENT_LOAD = "load";
	
	/**
	 * the complete event fires when the load queue has completed.
	 * @event complete
	 */
	Loader.EVENT_COMPLETE = "complete";
	
	/**
	 * the method of the request.
	 * @property method
	 * @return {String} the request method
	 */
	Loader.prototype.method = "GET";
	
	/**
	 * specifies if the request is asynchronous
	 * @property async
	 * @return {Boolean} a boolean value
	 */
	Loader.prototype.async = true;
	
	/**
	 * the expected data type
	 * @property type
	 * @return {String} the expected data type
	 * @see benignware.utils.Loader#TYPE_PLAIN_TEXT
	 * @see benignware.utils.Loader#TYPE_XML
	 * @see benignware.utils.Loader#TYPE_JSON
	 * @see benignware.utils.Loader#TYPE_JSONP
	 */
	Loader.prototype.type = true;
	
	/**
	 * the http status code
	 * @property status
	 * @return {Number} the http status code
	 */
	Loader.prototype.status = null;
	
	/**
	 * holdes the response data
	 * @property data
	 * @return {Object} the response data
	 */
	Loader.prototype.data = null;
	
	/**
	 * specifies if requests should be queued.
	 * @property queued
	 * @return {Boolean} true, if requests are queued.
	 */
	Loader.prototype.queued = null;
	
	return Loader;
	
})();