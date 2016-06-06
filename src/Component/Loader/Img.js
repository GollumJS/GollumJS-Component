GollumJS.NS(GollumJS.Component.Loader, function() {
	
	var Promise = GollumJS.Promise;
	
	this.Img = new GollumJS.Class({
		
		Extends: GollumJS.Component.Loader.ALoader,
		
		/**
		 * Load component
		 */
		load: function(component, json) {
			
			var _this = this;
			var imgFiles = json.img;
			
			if (imgFiles) {
				if (typeof imgFiles == 'string') {
					imgFiles = [imgFiles];
				}
				
				var loadedDiv = $('<div style="position: fixed; top: -30000px; left: -30000px;" ></div>').appendTo(document.body);
				
				return GollumJS.Utils.Collection.eachStep(imgFiles, function (i, file, step) {
					
					if (!file) {
						step();
						return;
					}
					
					var image = new Image();
					image.onload = function() {
						console.debug ('Preloading image:', file);
						step();
					};
					image.onerrror = function(e) {
						console.error ('Error preloading image: '+file, e);
						step();
					};
					image.src = _this.getBaseUrl(component)+file;
					loadedDiv.append(image);
					
				})
					.then(function () {
						loadedDiv.remove();
						return json;
					})
				;
			}
			
			return Promise.resolve(json);
		}
		
	});

});