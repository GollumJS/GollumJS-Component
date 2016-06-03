GollumJS.config = GollumJS.Utils.extend ({
	
	node: {
		gollumjs_component_path: typeof __dirname !== 'undefined' ? __dirname : "" 
	},

	src: {
		path: [ '%node.gollumjs_component_path%/index.js' ],
		excludesPath: ["%node.gollumjs_component_path%/src"],
	},
	
	className: {
		component: {
			manager       : 'GollumJS.Component.Manager',
			loader        : 'GollumJS.Component.Loader',
			tplLoader     : 'GollumJS.Component.Loader.Tpl',
			styleLoader   : 'GollumJS.Component.Loader.Style',
			jsLoader      : 'GollumJS.Component.Loader.Js',
			compiledLoader: 'GollumJS.Component.Loader.Compiled',
			renderer      : 'GollumJS.Component.Renderer',
			eventBinder   : 'GollumJS.Component.EventBinder',
			optionsParser : 'GollumJS.Component.OptionsParser',
			namer         : 'GollumJS.Component.Namer',
			sass          : 'Sass'
		}
	},
	
	services: {
		
		componentManager: {
			class: '%className.component.manager%',
			args: [
				'@componentLoader',
				'@componentRenderer',
				'@componentEventBinder',
				'@componentOptionsParser',
				'@componentNamer'
			]
		},
		
		componentLoader: {
			class: '%className.component.loader%',
			args: [
				'@componentLoaderTpl',
				'@componentLoaderStyle',
				'@componentLoaderJs',
				'@componentLoaderCompiled'
			]
		},
		
		componentLoaderTpl: {
			class: '%className.component.tplLoader%',
			args: [
				'@ajaxProxy'
			]
		},
		
		componentLoaderStyle: {
			class: '%className.component.styleLoader%',
			args: [
				'@ajaxProxy',
				'%className.component.sass%',
			]
		},
		
		componentLoaderJs: {
			class: '%className.component.jsLoader%',
			args: [
				'@ajaxProxy'
			]
		},

		componentLoaderCompiled: {
			class: '%className.component.compiledLoader%',
			args: [
				'@componentLoaderTpl',
				'@componentLoaderStyle'
			]
		},
		
		componentPreloader: {
			class: 'GollumJS.Component.Preloader',
			args: [
				'@componentManager'
			]
		},
		
		componentRenderer: {
			class: '%className.component.renderer%'
		},
		
		componentEventBinder: {
			class: '%className.component.eventBinder%'
		},
		
		componentOptionsParser: {
			class: '%className.component.optionsParser%'
		},
		
		componentNamer: {
			class: '%className.component.namer%'
		}
		
	}
	
}, GollumJS.config);
