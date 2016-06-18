GollumJS.NS(GollumJS.Component.Loader, function() {

	var Promsie = GollumJS.Promise;

	this.Compiled = new GollumJS.Class({

		Extends: GollumJS.Component.Loader.ALoader,

		/**
		 * @var {GollumJS.Component.Loader.Tpl}
		 */
		loaderTpl: null,

		/**
		 * @var {GollumJS.Component.Loader.Style}
		 */
		loaderStyle: null,

		initialize: function (baseUrl, loaderTpl, loaderStyle) {
			this.parent()(baseUrl);
			this.loaderTpl   = loaderTpl;
			this.loaderStyle = loaderStyle;
		},

		/**
		 * Load component
		 */
		load: function(component) {
			var _this = this;
			return new Promsie(function (resolve, reject) {
				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.async = true;
				script.onload = function(){
					resolve(component);
				};
				script.onerror = function(e){
					reject(e);
				};
				script.src = _this.getBaseUrl(component)+'compiled.min.js';
				document.getElementsByTagName('body')[0].appendChild(script);
			});
		},

		parseJson: function(component, compiledJson) {
			this.loading = true;

			for (var f in compiledJson.css) {
				this.loaderStyle.injectStyle(f, compiledJson.css[f]);
			}
			for (var f in compiledJson.js) {
				var script = $('<script type="text/javascript" data-src="'+f+'" >'+"\n/* "+f+" */\n\n"+compiledJson.js[f]+'</script>');
				script.appendTo(document.body);
			}
			component.infos = this.loaderTpl.parseInfos(compiledJson.ejs);

			console.log('Load compiled component:: ', component);
			
			return Promise.resolve(compiledJson);
		}

	});

});