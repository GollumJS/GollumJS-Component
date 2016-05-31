GollumJS.NS(function() {
	
	this.App = new GollumJS.Class({
		
		initialize: function () {
			console.log("Start App");
			
			GollumJS.set('app', this);
			var componentManager = GollumJS.get('componentManager');
			componentManager.start();
		}

	});

});