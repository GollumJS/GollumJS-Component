GollumJS.NS(GollumJS.Component, function() {
	
	var Collection = GollumJS.Utils.Collection;
	
	this.PreloadTag = new GollumJS.Class({

		Extends: HTMLElement,
		
		Static: {
			tag: 'gjs-preload-component',
			HTMLElement: null,

			onContextReady: function () {
			},

			onClassCreated: function () {
				var _this = this;
				GollumJS.Component.Manager.instance()
					.then(function (manager) {
						_this.HTMLElement = document.registerElement(
							_this.tag, _this
						);
					})
				;
			}
		},

		getComponentsSrc: function() {
			var content = this.innerHTML;
			return content.match(/[a-zA-Z0-9]+:[a-zA-Z0-9]+/g);
		},

		_getComponent: function(src) {
			return GollumJS.Component.Manager.instance()
				.then(function (manager) {
					return manager.getComponent(src);
				})
			;
		},

		loadComponents: function () {
			
			var _this = this;
			var srcs = this.getComponentsSrc();
			
			return Collection.eachStep(srcs, function (i, src, step) {
				console.log ('Preloading component started:', src);
				_this._getComponent(src)
					.then(function(component) {
						return component.load()
					})
					.catch(console.error)
					.finally(step)
				;
			});
		},

		_lockRenderer: function() {
			GollumJS.Component.Manager.instance()
				.then(function (manager) {
					return manager.renderer.lock();
				})
				.catch(console.error)
			;
		},

		_unlockRenderer: function() {
			GollumJS.Component.Manager.instance()
				.then(function (manager) {
					return manager.renderer.unlock();
				})
				.catch(console.error)
			;
		},

		createdCallback: function() {
		},
		
		attachedCallback: function() {
			var _this = this;
			setTimeout(function () {
				$(_this).remove();
			}, 100);
			
			this._lockRenderer();
			this.loadComponents()
				.catch(console.error)
				.finally(function () {
					console.log ('End preloading');
					_this._unlockRenderer();
				});
			;
		},
		
		detachedCallback: function() {
		}

	});

});