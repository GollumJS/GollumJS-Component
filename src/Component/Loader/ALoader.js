GollumJS.NS(GollumJS.Component.Loader, function() {
	
	this.ALoader = new GollumJS.Class({

		baseUrl: null,
		
		initialize: function (baseUrl) {
			this.baseUrl = baseUrl;	
		},
		
		getBaseUrl: function(component) {
			var controller = component.getPathName();
			var path       = component.getPath();
			var action     = component.getActionName();
			return this.baseUrl+controller+'/'+path+action+'/';
		}
		
	});

});