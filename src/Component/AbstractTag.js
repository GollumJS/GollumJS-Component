GollumJS.NS(GollumJS.Component, function() {
	
	var currentManager = null;
	
	this.AbstractTag = new GollumJS.Class({
		
		Extends: HTMLElement, 
		
		Static: {
			
			tag: null,
			HTMLElement: null,

			onContextReady: function () {
				var _this = this;
				GollumJS.Component.Manager.instance()
					.then(function (manager) {
						currentManager = manager;
						if (_this.tag) {
							manager.registerHtmlTag(_this.tag);
							_this.HTMLElement = document.registerElement(
								_this.tag, _this
							);
						}
					})
				;
			}
			
		},
		
		getGJSComponentManager: function() {
			return currentManager;
		}

	});

});