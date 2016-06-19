
console.log ("=== Pack GollumJSComponent ===");

if (
	process.argv.indexOf('--help') != -1 ||
	process.argv.indexOf('-h') != -1
) {
	console.log ('Help:');
	console.log ('  --web-path:	   Set the web path');
	console.log ('  --component-dir:  Set the component directory');
	return;
}

fs = require('fs');
var glob       = require("glob");

// loading GollumJS Lib
var GollumJS  = require('gollumjs');
var uglifyjs  = require('uglifyjs');
var uglifycss = require('uglifycss');
global.JSON3  = require('json3');
global.ejs    = require('ejs');
global.Sass   = require('sass.js');

require(__dirname+'/../index.js');

var tplLoader   = GollumJS.get('componentLoaderTpl');
var styleLoader = GollumJS.get('componentLoaderStyle');


var webPath = './web';
var argpos = process.argv.indexOf('--web-path');
if (argpos != -1 && argpos+1 < process.argv.length) {
	webPath = process.argv[argpos+1];
}

var componentDir = 'components';
argpos = process.argv.indexOf('component-dir');
if (argpos != -1 && argpos+1 < process.argv.length) {
	componentDir = process.argv[argpos+1];
}

var pathComponent = fs.realpathSync(webPath+'/'+componentDir);

var writeCompiledJS = function (path, compiled, cb) {
	
	var content = '';
	content += 'GollumJS.Component.Manager.instance().then(function(m){m.registerCompiled(';
	content += JSON.stringify(compiled);
	content += ')});';
	
	return fs.writeFile(path, content, function(err) {
		if(err) {
			return console.error(err);
		}
		fs.realpath(path, function (err, path) {
			console.log ('      '+path+' => OK');
		});
	});
};

fs.readdir(pathComponent, function (err, controllers) {
	controllers.forEach(function (controller) {
		try {
			
			if (err) {
				console.error (err);
				return;
			}
			
			var controllerPath = pathComponent+'/'+controller;
			var sates          = fs.statSync(controllerPath);
			
			if (sates.isDirectory()) {
				
				console.log ('  Controller found:', controller);
				
				var actions = glob.sync(controllerPath+'/**/*.cpt.ejs');
				actions.forEach(function(ejsPath) {
					var fullAction = ejsPath.substr(controllerPath.length+1);
					fullAction = fullAction.substr(0, fullAction.lastIndexOf('/'));
					var pos = fullAction.lastIndexOf('/');
					var path = (pos != -1) ? fullAction.substr(0, pos+1) : '';
					var action = (pos != -1) ? fullAction.substr(pos+1) : fullAction;

					var actionPath = controllerPath+'/'+path+action;
					
					var sates = fs.statSync(ejsPath);
					if (sates.isFile()) {
						console.log ('    Action found:', path+action);

						var compiled = {
							src: controller + ':' + path + action,
							ejs: fs.readFileSync(ejsPath, "utf8"),
							js : {},
							css: {}
						};
						var json = tplLoader.parseInfos(compiled.ejs);

						// JS

						var filesJS = json.js;
						if (filesJS) {
							if (typeof filesJS == 'string') {
								filesJS = [filesJS];
							}
							for (var i = 0; i < filesJS.length; i++) {
								var fileJS = filesJS[i];
								compiled.js[fileJS] = fs.readFileSync(actionPath+'/'+fileJS, "utf8");
							}
						}

						// CSS

						var filesCSS = json.css;
						if (filesCSS) {

							if (typeof filesCSS == 'string') {
								filesCSS = [filesCSS];
							}

							for (var i = 0; i < filesCSS.length; i++) {
								var fileCSS = filesCSS[i];
								var css = fs.readFileSync(actionPath+'/'+fileCSS, "utf8");
								compiled.css[fileCSS] = css;
							}

						}

						GollumJS.Utils.Collection.eachStep(compiled.css, function (file, content, step) {
							
							content = styleLoader.coreMixin(controller+':'+path+action) + content;
							Sass.compile(content, function(result) {
								try {
									if (result.status) {
										throw new GollumJS.Exception(result.message);
									} else {
										compiled.css[file] = result.text;
										step();
									}
								} catch (e) {
									console.error('Error on compile component CSS:', actionPath+'/'+file, e);
									step();
								}
							});
						})
							.then(function () {

								writeCompiledJS(actionPath + '/compiled.js', compiled);

								for (var f in compiled.css) {
									if (compiled.css[f]) {
										compiled.css[f] = uglifycss.processString(
											compiled.css[f],
											{ maxLineLen: 500, expandVars: true }
										);
									}
								}

								for (var f in compiled.js) {
									if (compiled.js[f]) {
										compiled.js[f] = uglifyjs.minify(
											compiled.js[f],
											{ fromString: true }
										).code;
									}
								}

								writeCompiledJS(actionPath + '/compiled.min.js', compiled);

							})
							.catch(console.error)
						;

					}
					
				});
			}
			
		} catch (e) {
			console.error(e);
		}
	});
});

console.log ('Component path:', pathComponent);
