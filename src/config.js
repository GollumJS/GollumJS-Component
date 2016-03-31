GollumJS.config = GollumJS.Utils.extend ({
	
	node: {
		gollumjs_component_path: typeof __dirname !== 'undefined' ? __dirname : "" 
	},

	src: {
		path: [ '%node.gollumjs_component_path%/index.js' ],
		excludesPath: ["%node.gollumjs_component_path%/src"],
	},
	
	services: {
		
		componentManager: {
			class: 'GollumJS.Component.Manager',
			args: [
				'@ajaxProxy'
			]
		},
		
		componentPreloader: {
			class: 'GollumJS.Component.Preloader',
			args: [
				'@componentManager'
			]
		}
		
	}
	
}, GollumJS.config);
