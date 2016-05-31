GollumJS.NS(GollumJS.Component, function() {

	this.Namer = new GollumJS.Class({
		
		Static: {
			DEFAULT_INSTANCE_NAME: 'instance'
		},

		named: function(element) {

			var name = element.dom[0].getName();

			var isKeyword = GollumJS.Component.AHierarchyTree.isKeyword(element.name);

			if (!name || isKeyword) {
				if (isKeyword) {
					console.warn('Can not use keyword \''+name+'\' for name a component instance. This component will be renamed.');
				}
				name = this.self.DEFAULT_INSTANCE_NAME + '_'+element.uniqId;
			}

			// while (this.childs[element.name]) {
			// 	element.name += '_'+element.uniqId;
			// }
			// this.childs[element.name] = element;

			return name;
		}
		
	});

});