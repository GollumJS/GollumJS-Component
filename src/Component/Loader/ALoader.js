GollumJS.NS(GollumJS.Component.Loader, function() {
	
	this.ALoader = new GollumJS.Class({
		
		getBaseUrl: function(component) {
			var controller = component.getPathName();
			var action     = component.getActionName();
			return 'components/'+controller+'/'+action+'/';
		}
		
	});

});