GollumJS.config = GollumJS.Utils.extend ({
	
	node: {
		gollumjs_component_path: typeof __dirname !== 'undefined' ? __dirname : "" 
	},

	src: {
		path: [ '%node.gollumjs_component_path%/index.js' ],
		excludesPath: ["%node.gollumjs_component_path%/src"],
	},

	component: {
		baseUrl: 'components/'
	},
	
	sass: {
		worker: null
	},
	
	className: {
		component: {
			manager       : 'GollumJS.Component.Manager',
			loader        : 'GollumJS.Component.Loader',
			tplLoader     : 'GollumJS.Component.Loader.Tpl',
			styleLoader   : 'GollumJS.Component.Loader.Style',
			jsLoader      : 'GollumJS.Component.Loader.Js',
			imgLoader     : 'GollumJS.Component.Loader.Img',
			compiledLoader: 'GollumJS.Component.Loader.Compiled',
			renderer      : 'GollumJS.Component.Renderer',
			eventBinder   : 'GollumJS.Component.EventBinder',
			optionsParser : 'GollumJS.Component.OptionsParser',
			namer         : 'GollumJS.Component.Namer',
			sass          : 'Sass',
			
			styleLoaderIncludeCore: 'GollumJS.Component.Loader.Style.IncludeCore'
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
				'@componentLoaderImg',
				'@componentLoaderCompiled'
			]
		},
		
		componentLoaderTpl: {
			class: '%className.component.tplLoader%',
			args: [
				'%component.baseUrl%',
				'@ajaxProxy'
			]
		},

		componentLoaderStyle: {
			class: '%className.component.styleLoader%',
			args: [
				'%component.baseUrl%',
				'@ajaxProxy',
				'%className.component.sass%',
				'%sass.worker%'
			],
			'inject': {
				'addInclude': 'component.style.include'
			}
		},
		
		componentLoaderStyleIncludeCore: {
			class: '%className.component.styleLoaderIncludeCore%',
			args: [
				'%component.baseUrl%',
			],
			tags: [
				{ 'name': 'component.style.include' }
			]
		},

		componentLoaderJs: {
			class: '%className.component.jsLoader%',
			args: [
				'%component.baseUrl%',
			]
		},
		
		componentLoaderImg: {
			class: '%className.component.imgLoader%',
			args: [
				'%component.baseUrl%',
			]
		},
		
		componentLoaderCompiled: {
			class: '%className.component.compiledLoader%',
			args: [
				'%component.baseUrl%',
				'@componentLoaderTpl',
				'@componentLoaderStyle'
			]
		},
		
		componentPreloader: {
			class: 'GollumJS.Component.Preloader',
			args: [
				'%component.baseUrl%',
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
