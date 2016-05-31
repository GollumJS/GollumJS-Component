GollumJS.NS(GollumJS.Component, function() {
		
	var Component = GollumJS.Component;
	
	this.Controller = new GollumJS.Class({
		
		Extends: GollumJS.Component.Element,
		
		layer: null,
		_popstate : true,
		_rootLoaded: false,
		
		beforeRender: function (done, reject) {
			// Prelaoding
			var homeComponent = this.getManager().getComponent('action:'+this.getHome());
			homeComponent.load()
				.then(done)
				.catch(console.error)
			;
		},
		
		getHome: function () {
			return this.dom[0].getHome();
		},

		onAttached: function() {
			var _this = this;

			var hash = this.getCurrentHash();
			if (hash == '') {
				hash = this.options.root;
			}
			this.replaceState('#');
			this.pushState('#'+hash);


			$(window).on({
				'popstate': function(event) {
					if (_this._popstate) {

						var engine = GollumJS.get('engine');
						var hash = _this.getCurrentHash();

						if (hash == '') {
							if (_this._rootLoaded) {
								engine.close();
							}
							_this.pushState('#'+_this.getHome());
						}
						_this.parseUrl();
					}
				}
			});
			this.parseUrl();
		},

		getCurrentHash: function() {
			var hash = window.location.hash;
			if (hash && hash[0] == '#') {
				hash = hash.substr(1);
			}
			return hash;
		},
		
		parseUrl: function () {
			var hash = this.getCurrentHash();
			
			if (hash == this.getHome()) {
				this._rootLoaded = true;
			}
			
			if (hash) {
				console.log ('Open action:', hash);
				
				var dest  = URI(hash).path(true);
				var query = URI(hash).query(true);
				this.open(dest, query)
					.catch(function(e) {
						console.warn('Error loading action:', hash);
						this.openDefault();
					})
				;
				
			} else {
				this.openDefault();
			}
		},
		
		openDefault: function() {
			var hash = '#'+this.options.root;
			
			if (hash == window.location.hash) {
				console.error('Error loading default action');
			}
			this.replaceState(hash);
			this.parseUrl();
		},

		replaceState: function(hash) {
			history.replaceState(null, null, hash);
		},

		pushState: function(hash) {
			history.pushState(null, null, hash);
		},
		
		open: function (dest, query) {
			
			var _this = this;
			var path = dest.split('/');
			var name = path.shift();
			
			this.setLoading(true);
			if (this.layer) {
				this.layer.remove();
			}

			/*return this.newComponentInstanceById ('action:'+name, {
				name: name
			}, query)
				.then(function (element) {
					if (!element) {
						_this.openDefault();
						return;
					}
					element.layerManager = _this;
					_this.setLoading(false);
					
					_this.action = element;
					
					element.dom.addClass('action');
					element.dom.css({
						'z-index': 10
					});
					_this._bindEventLayer(element);
				})
			;
			*/
		},
		
		setLoading: function (enable) {
			if (enable) {
				this.dom.addClass('loading');
			} else {
				this.dom.removeClass('loading');
			}
		},
		
		_bindEventLayer: function (layer) {
			
			var _this = this;
			
			layer.dom.find('a[type="back"]').click(function(e) {
				var href = this.href ? this.href : _this.options.root;
				if (href && href[0] == '#') {
					href = href.substr(1);
				}
				if (href) {

					e.preventDefault();
					_this._popstate = false;
					if (history.length > 1) {
						history.back();
						var hash = _this.getCurrentHash();
						if (hash == '') {
							_this.pushState(href);
						}

						console.log ('simple back');
					}

					_this.replaceState(href);
					_this.parseUrl();
					_this._popstate = true;
				}
			});
		}
		
	});

});
