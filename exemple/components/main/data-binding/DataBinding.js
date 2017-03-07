App.ComponentElement = App.ComponentElement || {};
App.ComponentElement.Main = App.ComponentElement.Main || {};

GollumJS.NS(App.ComponentElement.Main, function() {
	
	this.DataBinding = new GollumJS.Class({
		
		Extends: GollumJS.Component.AbstractAction,
		
		interval: null,
		value: 0,

		/**
		 * Can be attached
		 */
		onAttached: function() {
			var _this = this;
			this.value = 0;
			this.interval = setInterval(function() {
				_this.value ++;
			}, 1000);
		},
		
		/**
		 * Can be detached
		 */
		onDetached: function() {
			clearInterval(this.interval);
		},
		
	});

});
