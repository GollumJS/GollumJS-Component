GollumJS.NS(GollumJS.Component.Loader, function() {
	
	this.ALoader = new GollumJS.Class({

		/**
		 * @var GollumJS.Ajax.Proxy
		 */
		ajaxProxy: null,
		
		initialize: function (ajaxProxy) {
			this.ajaxProxy = ajaxProxy;
		},

		getBaseUrl: function(component) {
			var controller = component.getPathName();
			var action     = component.getActionName();
			return 'components/'+controller+'/'+action+'/';
		}
		
	});

});