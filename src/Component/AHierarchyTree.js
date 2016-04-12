GollumJS.NS(GollumJS, function() {
	
	var JSON = JSON3;
	
	this.AHierarchyTree = new GollumJS.Class({

		Static: {
			KEYWORD_TARGET: '_target',
			KEYWORD_PARENT: '_parent',
			KEYWORD_ROOT: '_root'
		},

		childs: {},
		dom: null,

		addChild: function (element, fieldName) {
			fieldName = fieldName || 'childs';
			var isKeyword = this._isKeyword(element.name);

			if (!element.name || isKeyword) {
				if (isKeyword) {
					console.warn('Can not use keyword \''+element.name+'\' for name a component instance. This component will be renamed.');
				}
				element.name = GollumJS.Component.Manager.DEFAULT_INSTANCE_NAME + '_'+element.uniqId;
			}
			while (this.childs[element.name]) {
				element.name += '_'+element.uniqId;
			}
			this.childs[element.name] = element;
		},
		
		inject: function (element) {
			if (element.dom) {
				var dom = this.dom ? $(this.dom) : this.getManager().dom;
				var childDom = $(dom.find('componentchilds')[0]);
				if (childDom) {
					childDom.after(element.dom);
				} else {
					dom.prepend(element.dom);
				}
				this.getManager().callAfterInjectOnElement(element);
			}
		},
		
		newComponentInstanceById: function (id, param, options, contentEjs) {
			
			param      = param      || {};
			options    = options    || null;
			contentEjs = contentEjs || '';
			
			var _this = this;
			var el    = $('<component id="'+id+'" >'+contentEjs+'</component>');
			var div   = $('<div>').append(el);

			for (var i in param) {
				el.attr(param, param[i]);
			}
			if (options) {
				el.attr("options-json", JSON.stringify(options));
			}
			
			return this.getManager().match(div, this)
				.then (function(elements) {
					if (elements.length && elements[0]) {
						_this.inject(elements[0]);
						return elements[0];
					}
					return null;
				})
			;
		},

		find: function (path) {

			var split = path.split('.');
			var name = split.shift();
			var subPath = split.join('.');
			var target = null;

			if (name == this.self.KEYWORD_ROOT) {
				target = this.getManager();
			} else if (name == this.self.KEYWORD_PARENT) {
				target = this.getParentElement();
			} else if (name == this.self.KEYWORD_TARGET) {
				target = this;
			} else {
				target = this.getChildByName(name);
			}

			if (target) {
				if (split.length) {
					return target.find(subPath);
				}
				return target;
			}

			console.warn ('Component with path \''+path+'\' not found');
			return null;

		},

		getChildByName: function (name) {
			for (var key in this.childs) {
				if (key == name) {
					return this.childs[key];
				}
			}
			console.warn('Element '+name+' not found in ', this);
			return null;
		},

		_isKeyword: function (str) {
			return
				str == this.self.KEYWORD_TARGET ||
				str == this.self.KEYWORD_PARENT ||
				str == this.self.KEYWORD_ROOT
			;
		},

		getManager: function () {
			throw GollumJS.Exception('must be override');
		},

		getParentElement: function () {
			throw GollumJS.Exception('must be override');
		}

	});

});