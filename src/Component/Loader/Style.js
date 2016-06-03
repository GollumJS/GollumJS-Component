GollumJS.NS(GollumJS.Component.Loader, function() {
	
	var Promise = GollumJS.Promise;
	
	this.Style = new GollumJS.Class({
		
		Extends: GollumJS.Component.Loader.ALoader,

		sassClassName: null,
		_sass: null,
		
		initialize: function (ajaxProxy, sassClassName) {
			this.parent()(ajaxProxy);
			this.sassClassName = sassClassName;
		},
		
		getSass: function () {
			if (!this._sass) {
				var clazz = GollumJS.Reflection.ReflectionClass.getClassByName(this.sassClassName);
				this._sass = new clazz();
			}
			return this._sass;	
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
							
							_this.getSass().compile(content, function(result) {
								
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