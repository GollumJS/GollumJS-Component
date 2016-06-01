GollumJS.NS(GollumJS.Component.Loader, function() {
	
	var JSON = JSON3;
	
	this.Tpl = new GollumJS.Class({
		
		Extends: GollumJS.Component.Loader.ALoader,
		
		load: function(component) {
			var base   = this.getBaseUrl(component);
			var action = component.getActionName();
			return this.ajaxProxy.request({
				url: base+action+'.ejs'
			})
				.then(this.parseInfos.bind(this))
			;
		},

		parseInfos: function(tpl) {
			var json = {};
			var match = tpl.match(/<{[\s\S]+}>/);
			if (match) {
				var data = match[0].substr(match[0].indexOf('{'));
				data = data.substr(0, data.lastIndexOf('}')+1);
				try {
					json = JSON.parse(data);
					if (json) {
						tpl = tpl.substr(match[0].length);
					}
				} catch (e) {
					console.error(e);
				}
			}
			
			var template = ejs.compile(tpl, 'utf8');
			return GollumJS.Utils.extend({
				template: template,
				'class' : null,
				js      : null,
				css     : null,
			}, json);
		}

	});

});