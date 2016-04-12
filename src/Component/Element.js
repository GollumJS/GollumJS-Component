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
		beforeRender: function (done, reject) {
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