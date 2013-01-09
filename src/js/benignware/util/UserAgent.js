(function() {
	
	var instance;
	
	function UserAgent() {
		detect.call(this);
	}
	
	benignware.core.Class.register('benignware.util.UserAgent', UserAgent);
	
	UserAgent.getInstance = function() {
		if (!instance) {
			instance = new UserAgent();
		}
		return instance;
	};
	
	
	// detection
	
	function detect() {
		
		var userAgent = navigator.userAgent;
		
		var object = this;
		
		
		// detect iPad
		if (navigator.platform.indexOf("iPad") != -1) {
			var iPadVersion = window.devicePixelRatio === 2 ? 3 : window.devicePixelRatio === 1 ? 2 : 1;
			object.iPad = {
				version: iPadVersion
			}
		}
		
		if (navigator.platform.indexOf("iPhone") != -1) {
			object.iPhone = {
				version: -1
			}
		}
		
		if (navigator.platform.indexOf("iPod") != -1) {
			object.iPod = {
				version: -1
			}
		}
		
		// detect iOS
		if (object.iPad || object.iPhone || object.iPod) {
			var start = userAgent.indexOf( 'OS ' );
			object.iOS = {
				version: window.Number( userAgent.substr( start + 3, 3 ).replace( '_', '.' ) )
			}
		}
		
		
		// detect android
		if (userAgent.toLowerCase().indexOf("android") != -1) {
			var androidVersion = parseFloat(userAgent.slice(userAgent.indexOf("Android") + 8));
			androidVersion = androidVersion && !isNaN(androidVersion) ? androidVersion : -1;
			object.android = {
				version: androidVersion
			}
		}
		
		// detect macos
		if (userAgent.indexOf("Mac OS") != -1) {
			object.macOS = {
				version: (function() {
					var re = new RegExp("Mac OS [A-Z]?\\s+([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null)
				      return parseFloat( RegExp.$1 );
				   
				})()
			}
		}
		
		// detect windows
		if (userAgent.indexOf("Windows") != -1) {
			object.windows = {
				version: -1
			}
		}
		
		
		
		// detect linux
		if (navigator.platform.indexOf("Linux") != -1) {
			object.linux = {
				version: -1
			}
		}

		// detect android browser
		
		if (object.android && userAgent.indexOf("Safari") != -1 && userAgent.indexOf("Chrome") == -1) {
			object.androidBrowser = {
				version: (function() {
					var re = new RegExp("Version/([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null)
				      return parseFloat( RegExp.$1 );
				})()
			}
		}
		
		
		// detect firefox
		if (userAgent.indexOf("Firefox") != -1) {
			object.firefox = {
				version: (function() {
					var re = new RegExp("Firefox/([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null)
				      return parseFloat( RegExp.$1 );
				})()
			}
		}

		
		// detect safari
		if (!userAgent.android && userAgent.indexOf("Safari") != -1 && userAgent.indexOf("Chrome") == -1) {
			object.safari = {
				version: (function() {
					var re = new RegExp("Version/([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null)
				      return parseFloat( RegExp.$1 );
				})()
			}
		}
		
		// detect chrome
		if (userAgent.indexOf("Chrome") != -1) {
			object.chrome = {
				version: (function() {
					var re = new RegExp("Chrome/([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null && RegExp.$1)
				      return parseFloat( RegExp.$1 );
				    
				    return -1;
				})()
			}
		}
		
		// detect opera
		if (window.opera) {
			object.opera = {
				version: (function() {
					var re = new RegExp("Version/([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null && RegExp.$1)
				      return parseFloat( RegExp.$1 );
				    
				    return -1;
				})()
			}
		}
		
		// detect internet explorer
		if (navigator.appName == 'Microsoft Internet Explorer') {
			object.internetExplorer = {
				version: (function() {
					var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				    if (re.exec(userAgent) != null)
				      return parseFloat( RegExp.$1 );
				})()
			}
		}
		
		// dip resolution
		object.dipResolution = (function() {
			// density-independent device resolution;
			if (window.devicePixelRatio) {
				if (object.android) {
					return {
						width: screen.width / window.devicePixelRatio, 
						height: screen.height / window.devicePixelRatio
					}
				}
			}
			return {
				width: screen.width,  
				height: screen.height
			}
		})();
		
		// dip resolution
		object.pixelResolution = (function() {
			// density-independent device resolution;
			if (window.devicePixelRatio) {
				if (object.android) {
					return {
						width: screen.width, 
						height: screen.height
					}
				}
			}
			return {
				width: screen.width * window.devicePixelRatio,  
				height: screen.height * window.devicePixelRatio
			}
		})();
		
		return object;
		
	}
	
	UserAgent.prototype.toString = function() {
		return navigator.userAgent;
	}

	
	return UserAgent;
	
})();