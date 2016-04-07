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
						
						var html = ejs.render(element.infos.tpl, options);
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
							return null;
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

GollumJS.NS(GollumJS, function() {
	
	var JSON = JSON3;
	
	this.AHierarchyTree = new GollumJS.Class({

		Static: {
			KEYWORD_TARGET: '_target',
			KEYWORD_PARENT: '_parent',
			KEYWORD_ROOT: '_root'
		},

		childs: {},
		dom: null,

		addChild: function (element, fieldName) {
			fieldName = fieldName || 'childs';
			var isKeyword = this._isKeyword(element.name);

			if (!element.name || isKeyword) {
				if (isKeyword) {
					console.warn('Can not use keyword \''+element.name+'\' for name a component instance. This component will be renamed.');
				}
				element.name = GollumJS.Component.Manager.DEFAULT_INSTANCE_NAME + '_'+element.uniqId;
			}
			while (this.childs[element.name]) {
				element.name += '_'+element.uniqId;
			}
			this.childs[element.name] = element;
		},
		
		inject: function (element) {
			if (element.dom) {
				var dom = this.dom ? $(this.dom) : this.getManager().dom;
				var childDom = $(dom.find('componentchilds')[0]);
				if (childDom) {
					childDom.after(element.dom);
				} else {
					dom.prepend(element.dom);
				}
				this.getManager().callAfterInjectOnElement(element);
			}
		},
		
		newComponentInstanceById: function (id, param, options, contentEjs) {
			
			param      = param      || {};
			options    = options    || null;
			contentEjs = contentEjs || '';
			
			var _this = this;
			var el    = $('<component id="'+id+'" >'+contentEjs+'</component>');
			var div   = $('<div>').append(el);

			for (var i in param) {
				el.attr(param, param[i]);
			}
			if (options) {
				el.attr("options-json", JSON.stringify(options));
			}
			
			return this.getManager().match(div, this)
				.then (function(elements) {
					if (elements.length) {
						_this.inject(elements[0]);
						return elements[0];
					}
					return null;
				})
			;
		},

		find: function (path) {

			var split = path.split('.');
			var name = split.shift();
			var subPath = split.join('.');
			var target = null;

			if (name == this.self.KEYWORD_ROOT) {
				target = this.getManager();
			} else if (name == this.self.KEYWORD_PARENT) {
				target = this.getParentElement();
			} else if (name == this.self.KEYWORD_TARGET) {
				target = this;
			} else {
				target = this.getChildByName(name);
			}

			if (target) {
				if (split.length) {
					return target.find(subPath);
				}
				return target;
			}

			console.warn ('Component with path \''+path+'\' not found');
			return null;

		},

		getChildByName: function (name) {
			for (var key in this.childs) {
				if (key == name) {
					return this.childs[key];
				}
			}
			console.warn('Element '+name+' not found in ', this);
			return null;
		},

		_isKeyword: function (str) {
			return
				str == this.self.KEYWORD_TARGET ||
				str == this.self.KEYWORD_PARENT ||
				str == this.self.KEYWORD_ROOT
			;
		},

		getManager: function () {
			throw GollumJS.Exception('must be override');
		},

		getParentElement: function () {
			throw GollumJS.Exception('must be override');
		}

	});

});

GollumJS.NS(GollumJS.Component, function() {
	
	var Promise = GollumJS.Promise;
	var Collection = GollumJS.Utils.Collection;
		
	this.Manager = new GollumJS.Class({
		
		Extends: GollumJS.AHierarchyTree,

		Static: {
			DEFAULT_INSTANCE_NAME: 'instance'
		},

		components: {},
		sass: null,
				
		/**
		 * @var GollumJS.Ajax.Proxy
		 */
		ajaxProxy: null,

		initialize: function (ajaxProxy) {
			
			this.ajaxProxy = ajaxProxy;
			this.sass      = new Sass();
			this.dom       = $(document.body);
		},
		
		start: function () {
			
			var _this = this;
			var prelaoder = GollumJS.get('componentPreloader');
			
			return prelaoder.load()
				.then ( function() {
					return _this.match();
				})
				.then (function(elements) {
					for (var i = 0; i < elements.length; i++ ) {
						_this.callAfterInjectOnElement(elements[i]);
					}
					return elements;
				})
				.catch (console.error)
			;
		},
		
		callAfterInjectOnElement: function (element) {

			this.bindEvents(element);

			element.afterInject();
			for (var i in element.childs) {
				this.callAfterInjectOnElement(element.childs[i]);
			}
		},

		bindEvents: function (element) {
			var events = element.on();
			for (var selector in events) {
				
				var types     = events[selector][0];
				var callbacks = events[selector][1];
				types     = Collection.isArray(types)     ? types     : [actions];
				callbacks = Collection.isArray(callbacks) ? callbacks : [callbacks];

				for (var i = 0; i < types.length; i++) {
					
					(function(selector, type, callbacks) {
						
						element.dom.on(type, selector, function(e) {
							try {
								var el = element.dom.find(selector);
								for (var j = 0; j < callbacks.length; j++) {
									callbacks[j].call(_this, e, el, type, selector);
								}

							} catch(e) {
								console.error(e);
							}
						});

					})(selector, types[i], callbacks);
				}
			}
			console.log ('events', events);
		},

		getManager: function () {
			return this;
		},

		getParentElement: function () {
			return this;
		},

		match: function (root, parent) {
			root = root || $(document);
			parent = parent || null;
			if (GollumJS.Component.Manager.isInstance(parent)) {
				parent = null;
			}
			var domComponents = root.find('component:not(component component)');
			var _this = this;
			
			return Collection.eachStep(domComponents, function (i, dom, step){
				
				var el   = $(dom);
				var id = el.attr('id');

				var component = _this.getComponent(id);
				
				component.display(el, parent)
					.then(function (element) {
						step(element);
					})
					.catch(console.error)
				;
			});
		},

		getComponent: function (id) {
			if (!this.components[id]) {
				 this.components[id] = new GollumJS.Component(id, this);
			}
			return this.components[id];
		}

	});

});

GollumJS.NS(GollumJS.Component, function() {

	var componentIndex = 0;
	
	this.Element = new GollumJS.Class({
		
		Extends: GollumJS.AHierarchyTree,

		name: null,
		uniqId: null,
		component: null,
		infos: null,
		options: null,
		_parentElement: null,
		
		initialize: function (component, parentElement, data) {
			this.component = component;
			this.uniqId    = ++componentIndex;
			this.name      = data.name    || null;
			this.options   = data.options || null;
			
			this._parentElement = parentElement;
			if (this._parentElement) {
				this._parentElement.addChild(this);
			} else {
				this._parentElement = this.getManager();
				this.getManager().addChild(this);
			}

			this.init();
		},

		getApp: function () {
			return this.component.manager.app;
		},

		getManager: function () {
			return this.component.manager;
		},

		getParentElement: function () {
			return this._parentElement;
		},
		
		remove: function () {
			this.dom.remove();
			delete(this.getParentElement().childs[this.name]);
		},
		
		/**
		 * Can be override
		 */
		init: function () {
		},
		
		/**
		 * Can be override
		 */
		beforeRender: function (done) {
			done();
		},
		
		/**
		 * Can be override
		 */
		afterRender: function() {
		},
		
		/**
		 * Can be override
		 */
		afterInject: function() {
		},

		/**
		 * Can be Override
		 */
		on: function() {
			return {};
		}

	});

});

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

GollumJS.config = GollumJS.Utils.extend ({
	
	node: {
		gollumjs_component_path: typeof __dirname !== 'undefined' ? __dirname : "" 
	},

	src: {
		path: [ '%node.gollumjs_component_path%/index.js' ],
		excludesPath: ["%node.gollumjs_component_path%/src"],
	},
	
	services: {
		
		componentManager: {
			class: 'GollumJS.Component.Manager',
			args: [
				'@ajaxProxy'
			]
		},
		
		componentPreloader: {
			class: 'GollumJS.Component.Preloader',
			args: [
				'@componentManager'
			]
		}
		
	}
	
}, GollumJS.config);


function (err) {
			if(err) {
				return console.error(err);
			}
			console.log (__dirname+"/../index.js => OK");
		}