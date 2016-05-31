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
				element.dom.trigger('gjs-attach', element);
			})
		;
	};
	
	var detach = function (el) {
		var manager = el.getGJSComponentManager();
		var element = el.GJElement;

		if (element && element.rendered) {
			manager.renderer.clean(element);
			element.dom.trigger('gjs-detach', element);
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