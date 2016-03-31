GollumJS.NS(GollumJS.Component, function() {
	
	var Collection = GollumJS.Utils.Collection;
	var Promise = GollumJS.Promise;
	
	this.Preloader = new GollumJS.Class({
		
		manager: null,
		
		initialize: function (manager) {
			this.manager = manager;
		}
		,
		
		load: function () {
			
			var _this = this;
			var preloadEl = $('componentprelaod');
			
			var jsPromiseLoading = Promise.resolve();
			
			var loadedDiv = $('<div style="position: fixed; top: -30000px; left: -30000px;" ></div>').appendTo(document.body);
			
			return Collection.eachStep (preloadEl, function (i, value, step) {
				
				var el = $(value);
				var id = el.attr('id');
				
				if (id) {
					
					var component = _this.manager.getComponent(id)
						.setJsPromiseLoading(jsPromiseLoading)
					;
					
					jsPromiseLoading = component.load()
						.then(function () {
							console.log ('Preloading component:', id);
							step();
						})
						.catch(console.error)
					;
				}
				
				var img = el.attr('img');
				if (img) {
					var image = new Image();
					image.onload = function() {
						console.log ('Preloading image:', img);
						step();
					};
					image.src = img;
					loadedDiv.append(image);
				}
				
			})
				.then(function () {
					loadedDiv.remove();
				})
			;
		}
		

	});

});