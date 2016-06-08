GollumJS.NS(GollumJS.Component, function() {
	
	var Promise = GollumJS.Promise;
	
	this.Renderer = new GollumJS.Class({
		
		_lock: false,
		_lockedElements: [],
		
		render: function(element) {
			
			var _this = this;
			var render = function () {
				
				var data = {
					element: element,
					content: function () {
						return element.dom[0].originalContent;
					}
				};
				
				var html = element.component.infos.template(data)
					.replace(new RegExp('>\\s+<', 'g'), '><')
				;
				var inner = $.parseHTML(html);
				_this.clean(element);
				element.dom.append(inner);
			};
			
			if (this._lock) {
				return new Promise(function (resolve, reject) {
					_this._lockedElements.push({
						element: element,
						resolve: resolve,
						reject : reject
					});
				});
			}

			render();
			return Promise.resolve(element);
			
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
				waited = this._lockedElements[i];
				try {
					waited.resolve(this.render(waited.element));	
				} catch (e) {
					waited.reject(e);
				}
			}
			this._lockedElements = [];
		}
		
	});

});