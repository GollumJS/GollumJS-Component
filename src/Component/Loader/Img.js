GollumJS.NS(GollumJS.Component.Loader, function() {
	
	var JSON = JSON3;
	var Promise = GollumJS.Promise;
	
	this.Js = new GollumJS.Class({
		
		Extends: GollumJS.Component.Loader.ALoader,
		
		/**
		 * Load component
		 */
		load: function(component, json) {
			
			var _this = this;
			var jsFiles = json.js;
			
			if (jsFiles) {
				if (typeof jsFiles == 'string') {
					jsFiles = [jsFiles];
				}
				
				return GollumJS.Utils.Collection.eachStep(jsFiles, function (i, file, step) {
					
					if (!file) {
						step();
						return;
					}
					
					// _this._jsPromiseLoading
					// .then(function () {
							var script = document.createElement('script');
							script.type = 'text/javascript';
							script.async = true;
							script.onload = function(){
								step();
							};
							script.onerror = function(e){
								reject(e);
							};
							script.src = _this.getBaseUrl(component)+file;
							document.getElementsByTagName('body')[0].appendChild(script);
					// 	})
					// ;
					
				})
					.then(function () {
						return json;
					})
				;
			}
			
			return Promise.resolve(json);
		}
		
	});

});