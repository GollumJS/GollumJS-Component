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

			return Collection.eachStep (preloadEl, function (i, value, step) {
				
				var el = $(value);
				var id = el.attr('id');
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
				
			});
		}

	});

});