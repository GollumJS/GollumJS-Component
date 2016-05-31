GollumJS.NS(GollumJS.Component, function() {
	
	var JSON = JSON3;
	
	this.AHierarchyTree = new GollumJS.Class({

		Static: {
			KEYWORD_TARGET: '_target',
			KEYWORD_PARENT: '_parent',
			KEYWORD_ROOT: '_root',

			isKeyword: function (str) {
				return
					str == this.KEYWORD_TARGET ||
					str == this.KEYWORD_PARENT ||
					str == this.KEYWORD_ROOT
				;
			},
		},

		dom: null,
		
		// TODO FIXME
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
		
		getChilds: function () {
			
			var manager = this.getManager();
			var selector = 'body, '+manager.htmlTags.join(', ');
			var result = {};
			var search = this.dom.find(selector);
			for (var i = 0; i < search.length; i++) {
				if (
					search[i].GJSElement &&
					search[i].GJSElement.getParentElement() == this
				) {
					result[search[i].GJSElement.name] = search[i].GJSElement; 
				}
			}
			
			return result;
		},

		getChildByName: function (name) {
			var childs = this.getChilds();
			for (var key in childs) {
				if (key == name) {
					return childs[key];
				}
			}
			console.warn('Element '+name+' not found in ', this);
			return null;
		},

		getParentElement: function () {
			throw GollumJS.Exception('must be override');
		},

		getManager: function () {
			throw GollumJS.Exception('must be override');
		}

	});

});