GollumJS.NS(GollumJS.Component.Loader, function() {
	
	var Promise = GollumJS.Promise;
	
	this.Img = new GollumJS.Class({
		
		Extends: GollumJS.Component.Loader.ALoader,

		loadedDiv: null,
		
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
				
				if (!this.loadedDiv) {
					this.loadedDiv = $('<div style="width: 0; height: 0; overflow: hidden;position: fixed; top: -30000px; left: -30000px;" ></div>').appendTo(document.body);
				}
				
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
					_this.loadedDiv.append(image);
					
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