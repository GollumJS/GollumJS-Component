GollumJS.NS(GollumJS.Component, function() {
	
	var Promise = GollumJS.Promise;
	
	this.Loader = new GollumJS.Class({

		/**
		 * @var {Sass}
		 */
		sass: null,
		
		/**
		 * @var {GollumJS.Component.Loader.Tpl}
		 */
		loaderTpl: null,
		
		/**
		 * @var {GollumJS.Component.Loader.Style}
		 */
		loaderStyle: null,

		/**
		 * @var {GollumJS.Component.Loader.Js}
		 */
		loaderJs: null,

		/**
		 * @var {GollumJS.Component.Loader.Compiled}
		 */
		loaderCompiled: null,
		
		initialize: function (loaderTpl, loaderStyle, loaderJs, loaderCompiled) {
			this.loaderTpl      = loaderTpl;
			this.loaderStyle    = loaderStyle;
			this.loaderJs       = loaderJs;
			this.loaderCompiled = loaderCompiled;
		},
					
		/**
		 * Load component
		 */
		load: function(component) {
			if (component.isLoaded()) {
				return Promise.resolve(component);
			}
			
			var _this = this;
			
			return this.loaderTpl.load(component)
				.then(function(json) {
					return _this.loaderStyle.load(component, json);
				})
				.then(function(json) {
					return _this.loaderJs.load(component, json);
				})
				.then(function(json) {
					component.infos = json;
					console.log('Load component:', component);
					return component;
				})
			;
		}

	});

});