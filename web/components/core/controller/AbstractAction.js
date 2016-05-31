GollumJS.NS(GollumJS.Component, function() {
		
	this.AbstractAction = new GollumJS.Class({
		
		Extends: GollumJS.Component.Element,
		
		layerManager: null,
		
		getRequest: function() {
			var request = {
				dest : URI(window.location.href).path(true),
				query: URI(window.location.href).query(true)
			};
			
			var hash = window.location.hash;
			if (hash && hash[0] == '#') {
				hash = hash.substr(1);
			}
			
			if (hash) {
				request.path  = hash.split('/');
				request.action = request.path.shift();
			}
			return request;
		},
		
		getUri: function() {
			var request = this.getRequest();
			var path = request.path ? '/'+request.path.join('/') : '';
			return this.name + path;
		}
		
		
	});

});
