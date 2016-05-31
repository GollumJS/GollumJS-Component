GollumJS.NS(GollumJS.Component, function() {
	
	var Promise = GollumJS.Promise;
	
	this.Renderer = new GollumJS.Class({
		
		_lock: false,
		_lockedElements: [],
		
		render: function(element) {
			
			var _this = this;
			var render = function () {
				var html = element.component.infos.template(element)
						.replace(new RegExp('>\\s+<', 'g'), '><')
					;
				var inner = $.parseHTML(html);
				_this.clean(element);
				element.dom.append(inner);
			};
			
			if (this._lock) {
				this._lockedElements.push(element);
			} else {
				render();
			}
			
		},

		clean: function (element) {
			element.dom.empty();
		},

		lock: function () {
			this._lock = true;
		},

		unlock: function () {
			this._lock = false;
			for (var i = 0; i < this._lockedElements.length; i++) {
				this.render(this._lockedElements[i]);
			}
			this._lockedElements = [];
		}
		
	});

});