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