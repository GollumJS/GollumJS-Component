GollumJS.NS(GollumJS, function() {
	
	var JSON = JSON3;
	var Promise = GollumJS.Promise;

	this.Component = new GollumJS.Class({

		id: null,
		manager: null,
		infos: null,

		/**
		 * Promise wait before load the JS. For synchronise JS file loading.
		 * @var Promise
		 */
		_jsPromiseLoading: null,
		
		/**
		 * @param string id
		 * @param GollumJS.Compoenent.Manager manager
		 */
		initialize: function (id, manager) {
			this.id = id;
			this.manager = manager;
			this.setJsPromiseLoading(Promise.resolve());
		},

		/**
		 * Add promise for difere the loading js file. For synchronise JS file loading.
		 * @var Promise p
		 * @return GollumJS.Component
		 */
		setJsPromiseLoading: function (p) {
			this._jsPromiseLoading = p;
			return this;
		},

		/**
		 * Inject and display a component element after the component tag
		 * @param jQuery el Dom compopent tag
		 * @param GollumJS.Component.Element parentElement 
		 */
		display: function (el, parentElement) {
			
			var _this = this;

			return this.load()
				.then(function (infos) {

					infos = GollumJS.Utils.clone(infos);
					var data = _this._elAttr2Data(el);
					var element = _this._createElementInstanceByClass(infos['class'], parentElement, data);

					var render = function() {
						
						var options = {};
						$.extend(options, element.options, {
							element: element,
							JSON: JSON
						});
						
						var html = ejs.render(element.infos.tpl, options).replace(new RegExp('>\\s+<', 'g'), '><');
						var dom  = $.parseHTML(html);
						var div  = $('<div>').append(dom);
						
						element.dom = $(dom);
						element.afterRender();
						
						return _this.manager.match(div, element)
							.then(function () {
								el.after(dom);
								el.remove();
							})
						;
					}
					

					return new Promise(function (resolve, reject) {
						try {
							element.infos   = infos;
							element.beforeRender(function () {
								render().
									then(function () {
										resolve(element);
									})
								;
							});
						} catch(e) {
							reject(e);
						}
					});

					
				})
				.catch(function(e) {
					console.error(e);
					return null;
				})
			;
		},

		_elAttr2Data: function(el) {

			var name = el.attr('name') ? el.attr('name') : null;
			var options = {};
			var jsonOptionStr = el.attr('options-json');
			if (jsonOptionStr) {
				try {
					options = JSON.parse(jsonOptionStr)
				} catch (e) {
					console.error(e);
				}
			}
			for (var i = 0; i < el[0].attributes.length; i++) {
				var n = el[0].attributes[i].name;
				if (n.substr(0, 'option-'.length) == 'option-') {
					options[n.substr('option-'.length)] = el[0].attributes[i].value;
				}
			}
			
			options.content = el.html();
			
			return {
				name: name,
				options: options
			};
		},

		_createElementInstanceByClass: function (className, parentElement, data) {

			var element = null

			try {
				if (className) {

					var clazz = GollumJS.Reflection.ReflectionClass.getClassByName(className);
					if (!clazz) {
						throw new GollumJS.Exception('Class '+className+' not found for component id:', this.id);
					}
					if (!GollumJS.Utils.isGollumJsClass(clazz) || clazz.getExtendsClass().indexOf(GollumJS.Component.Element) == -1) {
						throw new GollumJS.Exception('Class '+className+' not an extend of GollumJS.Component.Element for component id:', this.id);
					}
					return new clazz(this, parentElement, data);
				}
			} catch (e) {
				console.error(e);
			}
			
			return new GollumJS.Component.Element(this, parentElement, data);
		},
					
		/**
		 * Load component
		 */
		load: function() {
			if (this.infos) {
				return Promise.resolve(this.infos);
			}

			var _this = this;
			return this._loadTpl()
				.then(function(tpl) {
					return _this._parseInfos(tpl);
				})
				.then(this._loadJS.bind(this))
				.then(this._loadCSS.bind(this))
				.then(function (infos) {
					_this.infos = infos;
					return _this.infos;
				})
			;
		},

		_loadTpl: function() {
			return this.manager.ajaxProxy.request({
				url: this.getBaseUrl(this.id)+this.id.split(':')[1]+'.ejs'
			});
		},

		_parseInfos: function(tpl) {
			var match = tpl.match(/<% \/\*{[\s\S]+}\*\/ %>/);
			if (match) {
				var data = match[0].substr(match[0].indexOf('{'));
				data = data.substr(0, data.lastIndexOf('}')+1);
				var json = {};
				try {
					json = JSON.parse(data);
				} catch (e) {
					console.error(e);
				}
				json = $.extend({
					id: this.id,
					tpl: tpl,
					'class': null,
					js: null,
					css: null,
				}, json);
				return json;
			}

		},

		_loadJS: function(json) {
			
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
					
					_this._jsPromiseLoading
						.then(function () {
							var script = document.createElement('script');
							script.type = 'text/javascript';
							script.async = true;
							script.onload = function(){
								step();
							};
							script.src = _this.getBaseUrl(json.id)+file;
							document.getElementsByTagName('body')[0].appendChild(script);
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

		_loadCSS: function(json) {
			
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

					var url = _this.getBaseUrl(json.id)+file;

					_this.manager.ajaxProxy.request({
						url: url,
						dataType: 'text'
					})
						.then(function (content) {
							_this.manager.sass.compile(content, function(result) {
								try {
									if (result.status) {
										throw new GollumJS.Exception(result.message);
									} else {
										// TODO replace if exist
										var style = $('<style data-src="'+url+'" >'+"\n/* "+url+" */\n\n"+result.text+'</style>');
										style.appendTo(document.head);
										step();
									}
								} catch (e) {
									console.error('Error on compile component CSS:', json.id, e);
								}
							});
						})
						.catch(function (e) {
							console.error('Error on load component CSS:', json.id, e);
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

		getBaseUrl: function() {

			var split      = this.id.split(':');
			var controller = split[0];
			var action     = split[1];
			
			return 'components/'+controller+'/'+action+'/';
		}

	});
});