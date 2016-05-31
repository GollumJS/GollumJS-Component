GollumJS.NS(GollumJS.Component.Loader, function() {
	
	var Promise = GollumJS.Promise;
	
	this.Style = new GollumJS.Class({
		
		Extends: GollumJS.Component.Loader.ALoader,

		sass: null,
		
		initialize: function (ajaxProxy, sass) {
			this.parent()(ajaxProxy);
			this.sass = sass;
		},
		
		coreMixin: function() {
			return '' +
				'@mixin gjs-component($src) {'     +"\n"+
				'	gjs-component[src="#{$src}"] {'+"\n"+
				'	   @content;'                  +"\n"+
  				'	}'                             +"\n"+
				'}'                                +"\n\n"
			;
		},
		
		load: function(component, json) {
			
			var _this = this;
			var cssFiles = json.css;

			if (cssFiles) {
				if (typeof cssFiles == 'string') {
					cssFiles = [cssFiles];
				}
				
				return GollumJS.Utils.Collection.eachStep(cssFiles, function (i, file, step) {
					
					if (!file) {
						step();
						return;
					}

					var url = _this.getBaseUrl(component)+file;

					_this.ajaxProxy.request({
						url: url,
						dataType: 'text'
					})
						.then(function (content) {
							
							content = _this.coreMixin() + content;
							
							_this.sass.compile(content, function(result) {
								
								try {
									if (result.status) {
										throw new GollumJS.Exception(result.message);
									} else {
										_this.injectStyle(url, result.text);
										step();
									}
								} catch (e) {
									console.error('Error on compile component CSS:', component.src, e);
									step();
								}
							});
						})
						.catch(function (e) {
							console.error('Error on load component CSS:', component.src, e);
							step();
						})
					;
				})
					.then(function () {
						return json;
					})
				;
			}
			return Promise.resolve(json);
		},

		injectStyle: function (src, styleRules) {
			var old = $(document.head).find('style[data-src="src"]');

			var style = $('<style data-src="'+src+'" >'+"\n/* "+src+" */\n\n"+styleRules+'</style>');
			style.appendTo(document.head);

			if (old.length) {
				old.remove();
			}
		}


	});

});