App.ComponentElement = App.ComponentElement || {};
App.ComponentElement.Main = App.ComponentElement.Main || {};

GollumJS.NS(App.ComponentElement.Main, function() {
		
	this.Parent = new GollumJS.Class({
		
		Extends: GollumJS.Component.Element,

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
		}
		
	});

});
