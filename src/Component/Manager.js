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
			
			for (var k = 0; k < events.length; k++) {
				
				var selector  = events[k][0];
				var types     = events[k][1];
				var callbacks = events[k][2];
				types     = Array.isArray(types)     ? types     : [types];
				callbacks = Array.isArray(callbacks) ? callbacks : [callbacks];

				for (var i = 0; i < types.length; i++) {
					
					(function(selector, type, callbacks) {
						
						element.dom.on(type, selector, function(e) {
							try {
								for (var j = 0; j < callbacks.length; j++) {
									callbacks[j].call(element, e, $(this), type, selector);
								}

							} catch(e) {
								console.error(e);
							}
						});

					})(selector, types[i], callbacks);
				}
			}
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