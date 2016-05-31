GollumJS.NS(GollumJS.Component, function() {
	
	this.OptionsParser = new GollumJS.Class({
		
		Static: {
			PARAM_KEY_OPTION: 'opt-',
			PARAM_NAME_OPTION_JSON: 'opts-json'
		},
		
		parse: function(element) {
			
			var el      = element.dom[0];
			var options = element.options ? element.options : {};
			
			var jsonOptionStr = element.dom.attr(this.self.PARAM_NAME_OPTION_JSON);
			if (jsonOptionStr) {
				try {
					options = JSON.parse(jsonOptionStr)
				} catch (e) {
					console.error(e);
				}
			}
			
			for (var i = 0; i < el.attributes.length; i++) {
				var n = el.attributes[i].name;
				if (n.substr(0, this.self.PARAM_KEY_OPTION.length) == this.self.PARAM_KEY_OPTION) {
					options[n.substr(this.self.PARAM_KEY_OPTION.length)] = el.attributes[i].value;
				}
			}
			
			return options;
		}
		
	});

});