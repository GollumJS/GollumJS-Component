GollumJS.NS(GollumJS.Component, function() {
	
	var ComponentTag = GollumJS.Component.ComponentTag;
	
	this.ControllerTag = new GollumJS.Class({
		
		Extends: ComponentTag, 
		
		Static: {
			tag: 'gjs-controller'
		},
		
		getSrc: function() {
			return 'core:controller';
		},
		
		getName: function() {
			var name = this.parent().getName();
			return name ? name : 'controller';
		},
		
		getHome: function() {
			return this.getAttribute('home');
		}

	});

});