GollumJS.NS(GollumJS.Component.Loader, function() {

	var PRomsie = GollumJS.Promise;

	this.Compiled = new GollumJS.Class({

		/**
		 * @var {GollumJS.Component.Loader.Tpl}
		 */
		loaderTpl: null,

		/**
		 * @var {GollumJS.Component.Loader.Style}
		 */
		loaderStyle: null,

		initialize: function (loaderTpl, loaderStyle) {
			this.loaderTpl   = loaderTpl;
			this.loaderStyle = loaderStyle;
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