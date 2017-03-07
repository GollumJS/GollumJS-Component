GollumJS.NS(GollumJS.Component, function() {

	this.EventBinder = new GollumJS.Class({
		
		bindElement: function(element) {

			var _this  = this;
			var events = element.on();

			for (var i = 0; i < events.length; i++) {

				var selectors  = events[i][0];
				var types      = events[i][1];
				var callbacks  = events[i][2];
				var fullSearch = events[i][3];

				selectors = Array.isArray(selectors) ? selectors : [selectors];
				types     = Array.isArray(types)     ? types     : [types];
				callbacks = Array.isArray(callbacks) ? callbacks : [callbacks];
				
				for (var j = 0; j < selectors.length; j++) {
					for (var k = 0; k < selectors.length; k++) {
						(function(selector, type, callbacks) {

							var source = fullSearch ? jQuery(document) : element.dom;
							var callbacksExec = function(e) {
								try {
									for (var l = 0; l < callbacks.length; l++) {
										try {
											callbacks[l].call(element, e, jQuery(this), type, selector);
										} catch(e) {
											console.error(e);
										}
									}
								} catch(e) {
									console.error(e);
								}
							};

							source.on(type, selector, callbacksExec);

						})(selectors[j], types[k], callbacks);
					}
				}

			}
		}
		
	});

});