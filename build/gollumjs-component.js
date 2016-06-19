GollumJS.config = GollumJS.Utils.extend ({
	
	node: {
		gollumjs_component_path: typeof __dirname !== 'undefined' ? __dirname : "" 
	},

	src: {
		path: [ '%node.gollumjs_component_path%/index.js' ],
		excludesPath: ["%node.gollumjs_component_path%/src"],
	},

	component: {
		baseUrl: 'components/'
	},
	
	sass: {
		worker: null
	},
	
	className: {
		component: {
			manager       : 'GollumJS.Component.Manager',
			loader        : 'GollumJS.Component.Loader',
			tplLoader     : 'GollumJS.Component.Loader.Tpl',
			styleLoader   : 'GollumJS.Component.Loader.Style',
			jsLoader      : 'GollumJS.Component.Loader.Js',
			imgLoader     : 'GollumJS.Component.Loader.Img',
			compiledLoader: 'GollumJS.Component.Loader.Compiled',
			renderer      : 'GollumJS.Component.Renderer',
			eventBinder   : 'GollumJS.Component.EventBinder',
			optionsParser : 'GollumJS.Component.OptionsParser',
			namer         : 'GollumJS.Component.Namer',
			sass          : 'Sass',
			
			styleLoaderIncludeCore: 'GollumJS.Component.Loader.Style.IncludeCore'
		}
	},
	
	services: {
		
		componentManager: {
			class: '%className.component.manager%',
			args: [
				'@componentLoader',
				'@componentRenderer',
				'@componentEventBinder',
				'@componentOptionsParser',
				'@componentNamer'
			]
		},
		
		componentLoader: {
			class: '%className.component.loader%',
			args: [
				'@componentLoaderTpl',
				'@componentLoaderStyle',
				'@componentLoaderJs',
				'@componentLoaderImg',
				'@componentLoaderCompiled'
			]
		},
		
		componentLoaderTpl: {
			class: '%className.component.tplLoader%',
			args: [
				'%component.baseUrl%',
				'@ajaxProxy'
			]
		},

		componentLoaderStyle: {
			class: '%className.component.styleLoader%',
			args: [
				'%component.baseUrl%',
				'@ajaxProxy',
				'%className.component.sass%',
				'%sass.worker%'
			],
			'inject': {
				'addInclude': 'component.style.include'
			}
		},
		
		componentLoaderStyleIncludeCore: {
			class: '%className.component.styleLoaderIncludeCore%',
			args: [
				'%component.baseUrl%',
			],
			tags: [
				{ 'name': 'component.style.include' }
			]
		},

		componentLoaderJs: {
			class: '%className.component.jsLoader%',
			args: [
				'%component.baseUrl%',
			]
		},
		
		componentLoaderImg: {
			class: '%className.component.imgLoader%',
			args: [
				'%component.baseUrl%',
			]
		},
		
		componentLoaderCompiled: {
			class: '%className.component.compiledLoader%',
			args: [
				'%component.baseUrl%',
				'@componentLoaderTpl',
				'@componentLoaderStyle'
			]
		},
		
		componentPreloader: {
			class: 'GollumJS.Component.Preloader',
			args: [
				'%component.baseUrl%',
				'@componentManager'
			]
		},
		
		componentRenderer: {
			class: '%className.component.renderer%'
		},
		
		componentEventBinder: {
			class: '%className.component.eventBinder%'
		},
		
		componentOptionsParser: {
			class: '%className.component.optionsParser%'
		},
		
		componentNamer: {
			class: '%className.component.namer%'
		}
		
	}
	
}, GollumJS.config);


GollumJS.NS(GollumJS, function() {
	
	var Promise = GollumJS.Promise;
	
	this.Component = new GollumJS.Class({

		src    : null,
		manager: null,
		infos  : null,
		loading: false,

		_loadingCompleteCbs: [],
		
		/**
		 * @param {string}                      src
		 * @param {GollumJS.Compoenent.Manager} manager
		 */
		initialize: function (src, manager) {
			this.src = src;
			this.manager = manager;
		},

		/**
		 * Render a component element after the component tag
		 * @param {JQElement} dom 
		 */
		render: function (dom) {
			
			var _this = this;
			return this.load()
				.then(function() {
					
					var element = _this.createElement(dom);
					var mostRendered = true;
					var parent = element.getParentElement();
					if (
						parent instanceof GollumJS.Component.Element
					) {
						mostRendered = parent.rendered;
					}
					if (!parent || !mostRendered) {
						return new Promise(function (resolve, reject) {
							if (!dom._differedRender) {
								dom._differedRender = [];
							}
							dom._differedRender.push({
								resolve: resolve,
								reject: reject
							});
						});
					}
					
					// TODO Factoring into Renderer service
					
					var promise = new Promise(function (resolve, reject) {
						try {
							element.beforeRender(function () {
								resolve(_this.manager.renderer.render(element));
							}, reject);
						} catch(e) {
							reject(e);
						}
					});
					
					return promise
						.then(function () {
							element.afterRender();
							element.rendered = true;
							
							if (dom._differedRender) {
								for (var i = 0; i < dom._differedRender.length; i++) {
									dom._differedRender[i].resolve(element);
								}
								delete dom._differedRender;
							}
							
							// Render child not rendered
							var childs = element.getChilds();
							return GollumJS.Utils.Collection.eachStep(childs, function (name, child, step) {
								if (child.rendered) {
									step();
									return;
								}
								child.component.render(child.dom)
									.then(function() {
										step();
									})
								;
							})
								.then(function() {
									element.dom.trigger( 'gjs-render', [ element ]);
									return element;
								})
							;
						});
					;
				})
				.catch(function(e) {
					console.error(e);
					if (dom._differedRender) {
						for (var i = 0; i < dom._differedRender.length; i++) {
							dom._differedRender[i].reject(e);
						}
						delete dom._differedRender;
					}
					return null;
				})
			;
		},

		createElement: function(dom) {
			
			var element = null
			var className = this.infos['class'];

			try {
				if (className) {

					var clazz = GollumJS.Reflection.ReflectionClass.getClassByName(className);
					if (!clazz) {
						throw new GollumJS.Exception('Class '+className+' not found for component:', this);
					}
					if (!GollumJS.Utils.isGollumJsClass(clazz) || clazz.getExtendsClass().indexOf(GollumJS.Component.Element) == -1) {
						throw new GollumJS.Exception('Class '+className+' not an extend of GollumJS.Component.Element for component:', this);
					}
					element = new clazz(this, dom);
				}
			} catch (e) {
				console.error(e);
			}
			
			if (!element) {
				element = new GollumJS.Component.Element(this, dom);
			}
			
			dom[0].GJSElement = element;
			return element;
		},
					
		/**
		 * Load component
		 * @return {Promise}
		 */
		load: function() {
			var _this = this;
			if (this.loading) {
				return new Promise(function (success, reject) {
					_this.onLoadingComplete(success, reject);
				});
			}
			
			this.loading = true;
			return this.manager.loader.load(this)
				.then(function() {
					_this._callLoadingCompleteCbs();
				})
				.catch(function (e) {
					_this._callLoadingCompleteCbs(e);
					_this.loading = false;
					throw e;
				})
			;
		},
		
		/**
		 * Load component compileds json
		 * @return {Promise}
		 */
		loadCompiled: function(compiled) {
			this.loading = true;
			try {
				this.manager.loader.loaderCompiled.parseJson(this, compiled)
				this._callLoadingCompleteCbs();
			} catch (e) {
				this._callLoadingCompleteCbs(e);
				this.loading = false;
				throw e;
			}
		},

		_callLoadingCompleteCbs: function (error) {
			for (var i = 0; i < this._loadingCompleteCbs.length; i++) {
				if (error) {
					this._loadingCompleteCbs[i].reject(this);
				} else {
					this._loadingCompleteCbs[i].success(this);
				}
			}
			this._loadingCompleteCbs = [];
		},

		onLoadingComplete: function(success, reject) {
			if (this.isLoaded()) {
				success(this);
			} else {
				this._loadingCompleteCbs.push({
					success: success,
					reject : reject
				});
			}
		},

		/**
		 * @return {boolean}
		 */
		isLoaded: function () {
			return !!this.infos;
		},
		
		getPathName: function() {
			var split      = this.src.split(':');
			return split[0] ? split[0] : '';
		},

		getPath: function() {
			var split      = this.src.split(':');
			var fullAction = split[1] ? split[1] : '';
			var pos = fullAction.lastIndexOf('/');
			if (pos == -1) {
				return '';
			}
			return fullAction.substr(0, pos+1);
		},

		getActionName: function() {
			var split      = this.src.split(':');
			var fullAction = split[1] ? split[1] : '';
			var pos = fullAction.lastIndexOf('/');
			if (pos == -1) {
				return fullAction;
			}
			return fullAction.substr(pos+1);
		}
		
	});
});

GollumJS.NS(GollumJS.Component, function() {
	
	var JSON = JSON3;
	
	this.AHierarchyTree = new GollumJS.Class({

		Static: {
			KEYWORD_TARGET: '_target',
			KEYWORD_PARENT: '_parent',
			KEYWORD_ROOT: '_root',

			isKeyword: function (str) {
				return str == this.KEYWORD_TARGET || str == this.KEYWORD_PARENT || str == this.KEYWORD_ROOT;
			},
		},

		dom: null,
		
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
		
		getChilds: function () {
			
			var manager = this.getManager();
			var selector = 'body, '+manager.htmlTags.join(', ');
			var result = {};
			var search = this.dom.find(selector);
			for (var i = 0; i < search.length; i++) {
				if (
					search[i].GJSElement &&
					search[i].GJSElement.getParentElement() == this
				) {
					result[search[i].GJSElement.name] = search[i].GJSElement; 
				}
			}
			
			return result;
		},

		getChildByName: function (name) {
			var childs = this.getChilds();
			for (var key in childs) {
				if (key == name) {
					return childs[key];
				}
			}
			console.warn('Element '+name+' not found in ', this);
			return null;
		},

		getParentElement: function () {
			throw GollumJS.Exception('must be override');
		},

		getManager: function () {
			throw GollumJS.Exception('must be override');
		}

	});

});

GollumJS.NS(GollumJS.Component, function() {
	
	var Promise       = GollumJS.Promise;
	var instance      = null;
	var startResolves = [];
	
	this.Manager = new GollumJS.Class({
		
		Extends: GollumJS.Component.AHierarchyTree,
		
		Static: {
			instance: function () {
				if (instance) {
					return Promise.resolve(instance);
				}
				return new Promise(function(resolve, reject) {
					startResolves.push(resolve);
				});
			}
		},
		
		components: {},
		htmlTags: [],
		
		/**
		 * @var GollumJS.Component.Loader
		 */
		loader: null,
		
		/**
		 * @var GollumJS.Component.Renderer
		 */
		renderer: null,
		
		/**
		 * @var GollumJS.Component.EventBinder
		 */
		eventBinder: null,
		
		/**
		 * @var GollumJS.Component.OptionsParser
		 */
		optionsParser: null,
		
		/**
		 * @var GollumJS.Component.Namer
		 */
		namer: null,
		
		initialize: function (loader, renderer, eventBinder, optionsParser, namer) {
			this.loader        = loader;
			this.renderer      = renderer;
			this.eventBinder   = eventBinder;
			this.optionsParser = optionsParser;
			this.namer         = namer;
		},
		
		start: function () {
			if (instance) {
				throw new GollumJS.Exception('Component manager already started.');
			}
			
			console.log('Start component manager');
			
			this.dom = $(document.body);
			instance = this;

			for (var i = 0; i < startResolves.length; i++) {
				startResolves[i](this);
			}
			delete startResolves;
			$(window).trigger('gjs-component-start', [ this ]);
		},
		
		registerHtmlTag: function(htmlTag) {
			this.htmlTags.push(htmlTag);
		},
		
		getComponent: function (src) {
			if (!this.components[src]) {
				 this.components[src] = new GollumJS.Component(src, this);
			}
			return this.components[src];
		},

		registerCompiled: function (json) {
			var component = this.getComponent(json.src);
			component.loadCompiled(json);
			
		},

		getManager: function () {
			return this;
		},

		getParentElement: function () {
			return this;
		}

	});

});

GollumJS.NS(GollumJS.Component, function() {

	var componentIndex = 0;
	
	this.Element = new GollumJS.Class({
		
		Extends: GollumJS.Component.AHierarchyTree,

		component: null,
		uniqId   : null,
		name     : null,
		options  : null,
		rendered : false,
		
		initialize: function (component, dom) {
			this.component = component;
			this.dom       = dom;
			this.uniqId    = ++componentIndex;
			this.name      = this.getManager().namer.named(this);
			this.options   = this.getManager().optionsParser.parse(this);
			
			this.init();
		},
		
		/**
		 * @return GollumJS.Component.Manager
		 */
		getManager: function () {
			return this.component.manager;
		},
		
		/**
		 * @return GollumJS.Component.Element
		 */
		getParentElement: function () {
			
			var manager = this.getManager();
			var selector = 'body, '+manager.htmlTags.join(', ');
			
			var search = function(el) {
				if (!el.length) {
					return null;
				}
				var p = el.parent(selector);
				if (p.length) {
					return p;
				}
				return search(el.parent());
			};
			
			var p = search(this.dom);
			
			if (!p || !p.length) {
				return null;
			}
			if (p[0] == document.body) {
				return this.getManager();
			}
			
			return p[0].GJSElement ? p[0].GJSElement : null;
		},
		
		remove: function () {
			this.dom.remove();
		},
		
		getOriginalContent: function () {
			return this.dom[0].originalContent;	
		},
		
		getOption: function(name, defaultValue, type) {
			defaultValue = typeof defaultValue == 'undefined' ? null : defaultValue;
			
			if (typeof this.options[name] == 'undefined') {
				return defaultValue;
			}
			var value = this.options[name];
			
			if (type == 'int') {
				value = parseInt(value, 10);
			} else
			if (type == 'float') {
				value = parseFloat(value, 10);
			} else
			if (type == 'bool') {
				if (typeof value == 'string') {
					if (value.toLowerCase() == 'false') {
						value = false;
					} else if (value.toLowerCase() == 'true') {
						value = true;
					}
				}
				value = !!value;
			}
			
			return value;
		},
		
		/**
		 * Can be override
		 */
		init: function () {
		},
		
		/**
		 * Can be override
		 */
		beforeRender: function (resolve, reject) {
			resolve();
		},
		
		/**
		 * Can be override
		 */
		afterRender: function() {
		},
		
		/**
		 * Can be attached
		 */
		onAttached: function() {
		},
		
		/**
		 * Can be detached
		 */
		onDetached: function() {
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
	
	var Promise = GollumJS.Promise;
	
	this.Renderer = new GollumJS.Class({
		
		_lock: false,
		_lockedElements: [],
		
		render: function(element) {
			
			var _this = this;
			var render = function () {
				
				var data = {
					element: element,
					content: function () {
						return element.dom[0].originalContent;
					}
				};
				
				var html = element.component.infos.template(data)
					.replace(new RegExp('>\\s+<', 'g'), '><')
				;
				var inner = $.parseHTML(html);
				_this.clean(element);
				element.dom.append(inner);
			};
			
			if (this._lock) {
				return new Promise(function (resolve, reject) {
					_this._lockedElements.push({
						element: element,
						resolve: resolve,
						reject : reject
					});
				});
			}

			render();
			return Promise.resolve(element);
			
		},

		clean: function (element) {
			element.dom.empty();
		},

		lock: function () {
			this._lock = true;
		},

		unlock: function () {
			this._lock = false;
			for (var i = 0; i < this._lockedElements.length; i++) {
				waited = this._lockedElements[i];
				try {
					waited.resolve(this.render(waited.element));	
				} catch (e) {
					waited.reject(e);
				}
			}
			this._lockedElements = [];
		}
		
	});

});

GollumJS.NS(GollumJS.Component, function() {

	this.EventBinder = new GollumJS.Class({
		
		bindElement: function(element) {

			var _this  = this;
			var events = element.on();

			for (var i = 0; i < events.length; i++) {

				var selectors  = events[i][0];
				var types      = events[i][1];
				var callbacks  = events[i][2];
				var fullSearch = events[i][3];

				selectors = Array.isArray(selectors)  ? selectors : [selectors];
				types     = Array.isArray(types)     ? types     : [types];
				callbacks = Array.isArray(callbacks) ? callbacks : [callbacks];
				
				for (var j = 0; j < selectors.length; j++) {
					for (var k = 0; k < selectors.length; k++) {
						(function(selector, type, callbacks) {

							var source = fullSearch ? $(document) : element.dom;
							var callbacksExec = function(e) {
								try {
									for (var l = 0; l < callbacks.length; l++) {
										try {
											callbacks[l].call(element, e, $(this), type, selector);
										} catch(e) {
											console.error(e);
										}
									}
								} catch(e) {
									console.error(e);
								}
							};

							source.on(type, selector, callbacksExec);

						})(selectors[j], types[k], callbacks);
					}
				}

			}
		}
		
	});

});

GollumJS.NS(GollumJS.Component, function() {

	this.Namer = new GollumJS.Class({
		
		Static: {
			DEFAULT_INSTANCE_NAME: 'instance'
		},

		named: function(element) {

			var name = element.dom[0].getName();

			var isKeyword = GollumJS.Component.AHierarchyTree.isKeyword(element.name);

			if (!name || isKeyword) {
				if (isKeyword) {
					console.warn('Can not use keyword \''+name+'\' for name a component instance. This component will be renamed.');
				}
				name = this.self.DEFAULT_INSTANCE_NAME + '_'+element.uniqId;
			}

			// while (this.childs[element.name]) {
			// 	element.name += '_'+element.uniqId;
			// }
			// this.childs[element.name] = element;

			return name;
		}
		
	});

});

GollumJS.NS(GollumJS.Component, function() {
	
	this.OptionsParser = new GollumJS.Class({
		
		Static: {
			PARAM_KEY_OPTION: 'opt-',
			PARAM_NAME_OPTION_JSON: 'opts-json'
		},
		
		parse: function(element) {
			
			var el      = element.dom[0];
			var options = element.options ? element.options : {};
			
			var jsonOptionStr = element.dom.attr(this.self.PARAM_NAME_OPTION_JSON);
			if (jsonOptionStr) {
				try {
					options = JSON.parse(jsonOptionStr)
				} catch (e) {
					console.error(e);
				}
			}
			
			for (var i = 0; i < el.attributes.length; i++) {
				var n = el.attributes[i].name;
				if (n.substr(0, this.self.PARAM_KEY_OPTION.length) == this.self.PARAM_KEY_OPTION) {
					options[n.substr(this.self.PARAM_KEY_OPTION.length)] = el.attributes[i].value;
				}
			}
			
			return options;
		}
		
	});

});

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
		 * @var {GollumJS.Component.Loader.Img}
		 */
		loaderImg: null,

		/**
		 * @var {GollumJS.Component.Loader.Compiled}
		 */
		loaderCompiled: null,
		
		initialize: function (loaderTpl, loaderStyle, loaderJs, loaderImg, loaderCompiled) {
			this.loaderTpl      = loaderTpl;
			this.loaderStyle    = loaderStyle;
			this.loaderJs       = loaderJs;
			this.loaderImg      = loaderImg;
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
			
			if (!GollumJS.config.debug) {
				return this.loaderCompiled.load(component)
					.then(function(component) {
						return _this.loaderImg.load(component, component.infos);
					})
					.then(function() {
						console.log('Load min component:', component);
						return component;
					})
				;
			} 
			
			return this.loaderTpl.load(component)
				.then(function(json) {
					console.debug('Tpl load:', component.src, component);
					return _this.loaderStyle.load(component, json);
				})
				.then(function(json) {
					console.debug('Style load:', component.src, component);
					return _this.loaderJs.load(component, json);
				})
				.then(function(json) {
					console.debug('Js load:', component.src, component);
					return _this.loaderImg.load(component, json);
				})
				.then(function(json) {
					component.infos = json;
					console.debug('Img load:', component.src, component);
					console.debug('Load component finish:', component.src, component);
					return component;
				})
			;
		}

	});

});

GollumJS.NS(GollumJS.Component.Loader, function() {
	
	this.ALoader = new GollumJS.Class({

		baseUrl: null,
		
		initialize: function (baseUrl) {
			this.baseUrl = baseUrl;	
		},
		
		getBaseUrl: function(component) {
			var controller = component.getPathName();
			var path       = component.getPath();
			var action     = component.getActionName();
			return this.baseUrl+controller+'/'+path+action+'/';
		}
		
	});

});

GollumJS.NS(GollumJS.Component.Loader, function() {
	
	var JSON = JSON3;
	
	this.Tpl = new GollumJS.Class({
		
		Extends: GollumJS.Component.Loader.ALoader,
		
		/**
		 * @var GollumJS.Ajax.Proxy
		 */
		ajaxProxy: null,

		initialize: function (baseUrl, ajaxProxy) {
			this.parent()(baseUrl);
			this.ajaxProxy = ajaxProxy;
		},
		
		load: function(component) {
			var base   = this.getBaseUrl(component);
			var action = component.getActionName();
			return this.ajaxProxy.request({
				url: base+action+'.cpt.ejs'
			})
				.then(this.parseInfos.bind(this))
			;
		},

		parseInfos: function(tpl) {
			var json = {};
			var match = tpl.match(/<{[\s\S]+}>/);
			if (match) {
				var data = match[0].substr(match[0].indexOf('{'));
				data = data.substr(0, data.lastIndexOf('}')+1);
				try {
					json = JSON.parse(data);
					if (json) {
						tpl = tpl.substr(match[0].length);
					}
				} catch (e) {
					console.error(e);
				}
			}
			
			var template = ejs.compile(tpl, 'utf8');
			return GollumJS.Utils.extend({
				template: template,
				'class' : null,
				js      : null,
				css     : null,
			}, json);
		}

	});

});

GollumJS.NS(GollumJS.Component.Loader, function() {
	
	var Promise = GollumJS.Promise;
	
	this.Style = new GollumJS.Class({
		
		Extends: GollumJS.Component.Loader.ALoader,
		
		/**
		 * @var {GollumJS.Ajax.Proxy}
		 */
		ajaxProxy: null,
		
		/**
		 * @var {[GollumJS.Component.Loader.Style.Include]}
		 */
		_includes: [],
		
		sassClassName: null,
		workerPath: null,
		_sass: null,
		
		initialize: function (baseUrl, ajaxProxy, sassClassName, workerPath) {
			this.parent()(baseUrl);
			this.ajaxProxy     = ajaxProxy;
			this.sassClassName = sassClassName;
			this.workerPath    = workerPath;
		},

		addInclude: function (include) {
			this._includes.push(include);
		},
		
		getSass: function () {
			if (!this._sass) {
				var clazz = GollumJS.Reflection.ReflectionClass.getClassByName(this.sassClassName);
				if (this.workerPath) {
					Sass.setWorkerUrl(this.workerPath);
				}
				this._sass = new clazz();
			}
			return this._sass;	
		},
		
		coreMixin: function(src) {
			var content = '';
			for (var i = 0; i < this._includes.length; i++) {
				content += this._includes[i].getContent(src);
			}
			return content;
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
							
							content = _this.coreMixin(component.src) + content;
							
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

GollumJS.NS(GollumJS.Component.Loader.Style, function() {
    
	this.Include = new GollumJS.Class({
		
		getContent: function (src) {
			return '';
		}
		
	});
	
});

GollumJS.NS(GollumJS.Component.Loader.Style, function() {
	
	this.IncludeCore = new GollumJS.Class({
		
		Extends: GollumJS.Component.Loader.Style.Include,
		
		getContent: function (src) {
			return '' +
				'@function str-replace($string, $search, $replace: \'\') {'+"\n"+
				'	$index: str-index($string, $search);'                  +"\n"+
				'	@if $index {'                                          +"\n"+
				'		@return '                                          +"\n"+
				'			str-slice($string, 1, $index - 1) +'           +"\n"+
				'			$replace + '                                   +"\n"+
				'			str-replace(str-slice('                        +"\n"+
				'				$string, $index + str-length($search)),'   +"\n"+
				'				$search,'                                  +"\n"+
				'				$replace'                                  +"\n"+
				'			)'                                             +"\n"+
				'		;'                                                 +"\n"+
				'	}'                                                     +"\n"+
				'	@return $string;'                                      +"\n"+
				'}'                                                        +"\n\n"+

				'@function gjs-component-path($component, $path: null) {'+"\n"+
				'	@if $path == null {'                                 +"\n"+
				'		$path: $component;'                              +"\n"+
				'		$component: \''+src+'\';'                        +"\n"+
				'	}'                                                   +"\n"+
				'	$component: str-replace($component, \':\', \'/\');'   +"\n"+
				'	@return \'components/\'+$component+\'/\'+$path;'     +"\n"+
				'}'                                                      +"\n\n"+

				'@mixin gjs-component($src: null) {'       +"\n"+
				'	@if $src == null {'                    +"\n"+
				'		$src: \''+src+'\';'                +"\n"+
				'	}'                                     +"\n"+
				'	gjs-component[src="#{$src}"] {'        +"\n"+
				'	   @content;'                          +"\n"+
				'	}'                                     +"\n"+
				'}'                                        +"\n\n"
			;
		}
		
	});
	
});

GollumJS.NS(GollumJS.Component.Loader, function() {
	
	var JSON = JSON3;
	var Promise = GollumJS.Promise;
	
	this.Js = new GollumJS.Class({
		
		Extends: GollumJS.Component.Loader.ALoader,
		
		/**
		 * Load component
		 */
		load: function(component, json) {
			
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
					
					// _this._jsPromiseLoading
					// .then(function () {
							var script = document.createElement('script');
							script.type = 'text/javascript';
							script.async = true;
							script.onload = function(){
								step();
							};
							script.onerror = function(e){
								reject(e);
							};
							script.src = _this.getBaseUrl(component)+file;
							document.getElementsByTagName('body')[0].appendChild(script);
					// 	})
					// ;
					
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

HTMLElement = typeof HTMLElement !== 'undefined' ? HTMLElement : new GollumJS.Class({});

GollumJS.NS(GollumJS.Component, function() {
	
	var Collection = GollumJS.Utils.Collection;
	
	this.PreloadTag = new GollumJS.Class({

		Extends: HTMLElement,
		
		Static: {
			tag: 'gjs-preload-component',
			HTMLElement: null,

			onContextReady: function () {
			},

			onClassCreated: function () {
				var _this = this;
				GollumJS.Component.Manager.instance()
					.then(function (manager) {
						_this.HTMLElement = document.registerElement(
							_this.tag, _this
						);
					})
				;
			}
		},

		getComponentsSrc: function() {
			var content = this.innerHTML;
			return content.match(/[-a-zA-Z0-9-]+:[-a-zA-Z0-9]+/g);
		},

		_getComponent: function(src) {
			return GollumJS.Component.Manager.instance()
				.then(function (manager) {
					return manager.getComponent(src);
				})
			;
		},

		loadComponents: function () {
			
			var _this = this;
			var srcs = this.getComponentsSrc();
			
			return Collection.eachStep(srcs, function (i, src, step) {
				console.log ('Preloading component started:', src);
				_this._getComponent(src)
					.then(function(component) {
						return component.load()
					})
					.catch(console.error)
					.finally(step)
				;
			});
		},

		_lockRenderer: function() {
			GollumJS.Component.Manager.instance()
				.then(function (manager) {
					return manager.renderer.lock();
				})
				.catch(console.error)
			;
		},

		_unlockRenderer: function() {
			GollumJS.Component.Manager.instance()
				.then(function (manager) {
					return manager.renderer.unlock();
				})
				.catch(console.error)
			;
		},

		createdCallback: function() {
		},
		
		attachedCallback: function() {
			var _this = this;
			setTimeout(function () {
				$(_this).remove();
			}, 100);
			
			this._lockRenderer();
			this.loadComponents()
				.catch(console.error)
				.finally(function () {
					console.log ('End preloading');
					_this._unlockRenderer();
				});
			;
		},
		
		detachedCallback: function() {
		}

	});

});

GollumJS.NS(GollumJS.Component, function() {
	
	var currentManager = null;
	
	this.AbstractTag = new GollumJS.Class({
		
		Extends: HTMLElement, 
		
		Static: {
			
			tag: null,
			HTMLElement: null,

			onContextReady: function () {
				var _this = this;
				GollumJS.Component.Manager.instance()
					.then(function (manager) {
						currentManager = manager;
						if (_this.tag) {
							manager.registerHtmlTag(_this.tag);
							_this.HTMLElement = document.registerElement(
								_this.tag, _this
							);
						}
					})
				;
			}
			
		},
		
		getGJSComponentManager: function() {
			return currentManager;
		}

	});

});

GollumJS.NS(GollumJS.Component, function() {
	
	var attach = function (el) {
		var dom       = $(el);
		var manager   = el.getGJSComponentManager();
		var component = el.getComponent();
		
		return component.render(dom)
			.then(function (element) {
				if (!element) {
					return null;
				}
				manager.eventBinder.bindElement(element);
				element.onAttached();
				element.dom.trigger('gjs-attach', [ element ]);
			})
		;
	};
	
	var detach = function (el) {
		var manager = el.getGJSComponentManager();
		var element = el.GJElement;

		if (element && element.rendered) {
			manager.renderer.clean(element);
			element.dom.trigger('gjs-detach', [ element ]);
		}
	};
	
	this.ComponentTag = new GollumJS.Class({
		
		Extends: GollumJS.Component.AbstractTag, 
		
		Static: {
			tag: 'gjs-component'
		},
		
		originalContent: "",
		
		getSrc: function() {
			return this.getAttribute("src");
		},
		
		getName: function() {
			return this.getAttribute("name");
		},
		
		getComponent: function() {
			var src     = this.getSrc();
			var manager = this.getGJSComponentManager();
			return manager.getComponent(src);
		},

		loadComponent: function () {
			var component = this.getComponent();
			return component.load();
		},

		createdCallback: function() {
			this.originalContent = this.innerHTML;
			this.loadComponent()
				.catch(console.error)
			;
		},
		
		attachedCallback: function() {
			attach(this)
				.catch(console.error)
			;
		},
		
		detachedCallback: function() {
			detach(this);
		}

	});

});

GollumJS.NS(GollumJS.Component, function() {
	
	var ComponentTag = GollumJS.Component.ComponentTag;
	
	this.ControllerTag = new GollumJS.Class({
		
		Extends: ComponentTag, 
		
		Static: {
			tag: 'gjs-controller'
		},
		
		getSrc: function() {
			return 'core:controller';
		},
		
		getName: function() {
			var name = this.parent().getName();
			return name ? name : 'controller';
		},
		
		getHome: function() {
			return this.getAttribute('home');
		}

	});

});

GollumJS.NS(GollumJS.Component, function() {
	
	var ComponentTag = GollumJS.Component.ComponentTag;
	
	this.ActionTag = new GollumJS.Class({
		
		Extends: ComponentTag, 
		
		Static: {
			tag: 'gjs-action'
		},
		
		getSrc: function() {
			return this.getControllerPath()+':'+this.getAction();
		},
		
		getName: function() {
			return this.getAction();
		},

		getAction: function() {
			return this.getAttribute('action');
		},
		
		/**
		 * @return string
		 */
		getControllerPath: function() {
			return 'action';
		}

	});

});

GollumJS.Component.Manager.instance().then(function(m){m.registerCompiled({"src":"core:controller","ejs":"<{\n\t\"js\": [\n\t\t\"Controller.js\",\n\t\t\"AbstractAction.js\"\n\t],\n\t\"class\": \"GollumJS.Component.Controller\"\n}>\n<div class=\"gjs-controller\" ></div>","js":{"Controller.js":"GollumJS.NS(GollumJS.Component,function(){GollumJS.Component;this.Controller=new GollumJS.Class({Extends:GollumJS.Component.Element,actions:null,_popState:!0,_rootLoaded:!1,beforeRender:function(t){var e=this.getManager().getComponent(\"action:\"+this.getHome());e.load().then(t)[\"catch\"](console.error)},getHome:function(){return this.dom[0].getHome()},onAttached:function(){var t=this,e=this.getCurrentHash();e||(e=this.getHome().root),this.replaceState(\"#\"),this.pushState(\"#\"+e),$(window).on({popstate:function(){if(t._popState){var e=GollumJS.get(\"engine\"),o=t.getCurrentHash();\"\"==o&&(t._rootLoaded&&e.close(),t.pushState(\"#\"+t.getHome())),t.parseUrl()}}}),this.parseUrl()},getCurrentHash:function(){var t=window.location.hash;return t&&\"#\"==t[0]&&(t=t.substr(1)),t},parseUrl:function(){var t=this,e=this.getCurrentHash();if(e==this.getHome()&&(this._rootLoaded=!0),e){console.log(\"Open action:\",e);var o=URI(e).path(!0),n=URI(e).query(!0);this.open(o,n)[\"catch\"](function(){console.warn(\"Error loading action:\",e),t.openDefault()})}else this.openDefault()},openDefault:function(){var t=\"#\"+this.getHome();return t==window.location.hash?void console.error(\"Error loading default action\"):(this.replaceState(t),void this.parseUrl())},replaceState:function(t){history.replaceState(null,null,t)},pushState:function(t){history.pushState(null,null,t)},open:function(t){var e=this,o=t.split(\"/\"),n=o.shift();this.setLoading(!0),this.action&&this.action.remove();var a=this.getManager().getComponent(\"action:\"+n);return a.load().then(function(){var t=$('<gjs-action action=\"'+n+'\" ></gjs-action>');e.dom.bind(\"gjs-render\",function(o,n){n===t[0].GJSElement&&(e.action=n,n.layerManager=e,e.setLoading(!1),n.dom.find(\"> div\").addClass(\"gjs-action\"))}),e.dom.find(\"> div.gjs-controller\").append(t)})},setLoading:function(t){t?this.dom.addClass(\"loading\"):this.dom.removeClass(\"loading\")},_bindEventLayer:function(t){var e=this;t.dom.find('a[type=\"back\"]').click(function(t){var o=this.href?this.href:e.options.root;if(o&&\"#\"==o[0]&&(o=o.substr(1)),o){if(t.preventDefault(),e._popState=!1,history.length>1){history.back();var n=e.getCurrentHash();\"\"==n&&e.pushState(o),console.log(\"simple back\")}e.replaceState(o),e.parseUrl(),e._popState=!0}})}})});","AbstractAction.js":"GollumJS.NS(GollumJS.Component,function(){this.AbstractAction=new GollumJS.Class({Extends:GollumJS.Component.Element,layerManager:null,getRequest:function(){var t={dest:URI(window.location.href).path(!0),query:URI(window.location.href).query(!0)},n=window.location.hash;return n&&\"#\"==n[0]&&(n=n.substr(1)),n&&(t.path=n.split(\"/\"),t.action=t.path.shift()),t},getUri:function(){var t=this.getRequest(),n=t.path?\"/\"+t.path.join(\"/\"):\"\";return this.name+n}})});"},"css":{}})});

