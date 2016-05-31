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