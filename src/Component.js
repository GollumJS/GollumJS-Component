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
						return Promise.resolve(null);
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
							element.dom.trigger( 'gjs-render', element);
							return element;
						});
					;
				})
				.catch(function(e) {
					console.error(e);
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

		getActionName: function() {
			var split      = this.src.split(':');
			return split[1] ? split[1] : '';
		}
		
	});
});