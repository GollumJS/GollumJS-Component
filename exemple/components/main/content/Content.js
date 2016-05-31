App.ComponentElement = App.ComponentElement || {};
App.ComponentElement.Main = App.ComponentElement.Main || {};

GollumJS.NS(App.ComponentElement.Main, function() {
		
	this.Content = new GollumJS.Class({
		
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
			setTimeout(function () {
				resolve();
			}, 10000);
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
