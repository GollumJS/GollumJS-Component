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
		
		/**
		 * @return string
		 */
		content: function () {
			return this.dom[0].originalContent;
		},
		
		remove: function () {
			this.dom.remove();
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