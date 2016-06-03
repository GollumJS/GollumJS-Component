App.ComponentElement = App.ComponentElement || {};
App.ComponentElement.Main = App.ComponentElement.Main || {};

GollumJS.NS(App.ComponentElement.Main, function() {
	
	
	
	this.Hello = new GollumJS.Class({
		
		Extends: GollumJS.Component.AbstractAction,
		
		options: {
			value: 'World'
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

		on: function()  {
			return [
				[ '> button', 'click', this.clickButton ],
				[ '> button', 'mouseover', this.mouseOverButton ],
			];
		},

		clickButton: function () {
			alert('Hello world');
		},

		mouseOverButton: function (e, type, selector) {
			console.log('MOUSE OVER', e, type, selector);
		}
		
	});

});
