GollumJS.NS(GollumJS.Component, function() {
	
	var ComponentTag = GollumJS.Component.ComponentTag;
	
	this.ActionTag = new GollumJS.Class({
		
		Extends: ComponentTag, 
		
		Static: {
			tag: 'gjs-action'
		},
		
		getSrc: function() {
			return this.getControllerPath()+':'+this.getAction();
		},
		
		getName: function() {
			return this.getAction();
		},

		getAction: function() {
			return this.getAttribute('action');
		},
		
		/**
		 * @return string
		 */
		getControllerPath: function() {
			return 'action';
		}

	});

});