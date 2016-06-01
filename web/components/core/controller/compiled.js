GollumJS.Component.Manager.instance().then(function(m){m.registerCompiled({"src":"core:controller","ejs":"<{\n\t\"js\": [\n\t\t\"Controller.js\",\n\t\t\"AbstractAction.js\"\n\t],\n\t\"class\": \"GollumJS.Component.Controller\"\n}>\n<div class=\"gjs-controller\" ></div>","js":{"Controller.js":"GollumJS.NS(GollumJS.Component, function() {\n\t\t\n\tvar Component = GollumJS.Component;\n\t\n\tthis.Controller = new GollumJS.Class({\n\t\t\n\t\tExtends: GollumJS.Component.Element,\n\t\t\n\t\tactions: null,\n\t\t_popState : true,\n\t\t_rootLoaded: false,\n\t\t\n\t\tbeforeRender: function (done, reject) {\n\t\t\t// Prelaoding\n\t\t\tvar homeComponent = this.getManager().getComponent('action:'+this.getHome());\n\t\t\thomeComponent.load()\n\t\t\t\t.then(done)\n\t\t\t\t.catch(console.error)\n\t\t\t;\n\t\t},\n\t\t\n\t\tgetHome: function () {\n\t\t\treturn this.dom[0].getHome();\n\t\t},\n\n\t\tonAttached: function() {\n\t\t\tvar _this = this;\n\n\t\t\tvar hash = this.getCurrentHash();\n\t\t\tif (!hash) {\n\t\t\t\thash = this.getHome().root;\n\t\t\t}\n\t\t\tthis.replaceState('#');\n\t\t\tthis.pushState('#'+hash);\n\n\n\t\t\t$(window).on({\n\t\t\t\t'popstate': function(event) {\n\t\t\t\t\tif (_this._popState) {\n\n\t\t\t\t\t\tvar engine = GollumJS.get('engine');\n\t\t\t\t\t\tvar hash = _this.getCurrentHash();\n\n\t\t\t\t\t\tif (hash == '') {\n\t\t\t\t\t\t\tif (_this._rootLoaded) {\n\t\t\t\t\t\t\t\tengine.close();\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t_this.pushState('#'+_this.getHome());\n\t\t\t\t\t\t}\n\t\t\t\t\t\t_this.parseUrl();\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t});\n\t\t\tthis.parseUrl();\n\t\t},\n\n\t\tgetCurrentHash: function() {\n\t\t\tvar hash = window.location.hash;\n\t\t\tif (hash && hash[0] == '#') {\n\t\t\t\thash = hash.substr(1);\n\t\t\t}\n\t\t\treturn hash;\n\t\t},\n\t\t\n\t\tparseUrl: function () {\n\n\t\t\tvar _this = this;\n\t\t\tvar hash = this.getCurrentHash();\n\t\t\t\n\t\t\tif (hash == this.getHome()) {\n\t\t\t\tthis._rootLoaded = true;\n\t\t\t}\n\t\t\t\n\t\t\tif (hash) {\n\t\t\t\tconsole.log ('Open action:', hash);\n\t\t\t\t\n\t\t\t\tvar dest  = URI(hash).path(true);\n\t\t\t\tvar query = URI(hash).query(true);\n\t\t\t\tthis.open(dest, query)\n\t\t\t\t\t.catch(function(e) {\n\t\t\t\t\t\tconsole.warn('Error loading action:', hash);\n\t\t\t\t\t\t_this.openDefault();\n\t\t\t\t\t})\n\t\t\t\t;\n\t\t\t\t\n\t\t\t} else {\n\t\t\t\tthis.openDefault();\n\t\t\t}\n\t\t},\n\t\t\n\t\topenDefault: function() {\n\t\t\tvar hash = '#'+this.getHome();\n\t\t\t\n\t\t\tif (hash == window.location.hash) {\n\t\t\t\tconsole.error('Error loading default action');\n\t\t\t\treturn;\n\t\t\t}\n\t\t\tthis.replaceState(hash);\n\t\t\tthis.parseUrl();\n\t\t},\n\n\t\treplaceState: function(hash) {\n\t\t\thistory.replaceState(null, null, hash);\n\t\t},\n\n\t\tpushState: function(hash) {\n\t\t\thistory.pushState(null, null, hash);\n\t\t},\n\t\t\n\t\topen: function (dest, query) {\n\t\t\t\n\t\t\tvar _this = this;\n\t\t\tvar path = dest.split('/');\n\t\t\tvar name = path.shift();\n\t\t\t\n\t\t\tthis.setLoading(true);\n\t\t\tif (this.action) {\n\t\t\t\tthis.action.remove();\n\t\t\t}\n\n\t\t\tvar component = this.getManager().getComponent('action:'+name);\n\t\t\treturn component.load()\n\t\t\t\t.then(function () {\n\t\t\t\t\tvar gjsAction = $('<gjs-action action=\"'+name+'\" ></gjs-action>');\n\n\t\t\t\t\t_this.dom.bind('gjs-render', function (e, element) {\n\t\t\t\t\t\tif (element === gjsAction[0].GJSElement) {\n\n\t\t\t\t\t\t\t_this.action = element;\n\t\t\t\t\t\t\telement.layerManager = _this;\n\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t_this.setLoading(false);\n\t\t\t\t\t\t\t\n\t\t\t\t\t\t\telement.dom.find('> div').addClass('action');\n\t\t\t\t\t\t}\n\t\t\t\t\t});\n\t\t\t\t\t\n\t\t\t\t\t_this.dom.find('> div.gjs-controller').append(gjsAction);\n\t\t\t\t})\n\t\t\t;\n\t\t\t// return component.load()\n\t\t\t// \t.then(function () {\n\t\t\t// \t\tvar gjsAction = $('<gjs-action action=\"'+name+'\" ></gjs-action>');\n\t\t\t// \t\tthis.dom.find('> div.gjs-controller').append(gjsAction);\n\t\t\t// \t})\n\t\t\t// ;\n\n\t\t\t/*return this.newComponentInstanceById ('action:'+name, {\n\t\t\t\tname: name\n\t\t\t}, query)\n\t\t\t\t.then(function (element) {\n\t\t\t\t\tif (!element) {\n\t\t\t\t\t\t_this.openDefault();\n\t\t\t\t\t\treturn;\n\t\t\t\t\t}\n\t\t\t\t\telement.layerManager = _this;\n\t\t\t\t\t_this.setLoading(false);\n\t\t\t\t\t\n\t\t\t\t\t_this.action = element;\n\t\t\t\t\t\n\t\t\t\t\telement.dom.addClass('action');\n\t\t\t\t\telement.dom.css({\n\t\t\t\t\t\t'z-index': 10\n\t\t\t\t\t});\n\t\t\t\t\t_this._bindEventLayer(element);\n\t\t\t\t})\n\t\t\t;\n\t\t\t*/\n\t\t},\n\t\t\n\t\tsetLoading: function (enable) {\n\t\t\tif (enable) {\n\t\t\t\tthis.dom.addClass('loading');\n\t\t\t} else {\n\t\t\t\tthis.dom.removeClass('loading');\n\t\t\t}\n\t\t},\n\t\t\n\t\t_bindEventLayer: function (action) {\n\t\t\t\n\t\t\tvar _this = this;\n\n\t\t\taction.dom.find('a[type=\"back\"]').click(function(e) {\n\t\t\t\tvar href = this.href ? this.href : _this.options.root;\n\t\t\t\tif (href && href[0] == '#') {\n\t\t\t\t\thref = href.substr(1);\n\t\t\t\t}\n\t\t\t\tif (href) {\n\n\t\t\t\t\te.preventDefault();\n\t\t\t\t\t_this._popState = false;\n\t\t\t\t\tif (history.length > 1) {\n\t\t\t\t\t\thistory.back();\n\t\t\t\t\t\tvar hash = _this.getCurrentHash();\n\t\t\t\t\t\tif (hash == '') {\n\t\t\t\t\t\t\t_this.pushState(href);\n\t\t\t\t\t\t}\n\n\t\t\t\t\t\tconsole.log ('simple back');\n\t\t\t\t\t}\n\n\t\t\t\t\t_this.replaceState(href);\n\t\t\t\t\t_this.parseUrl();\n\t\t\t\t\t_this._popState = true;\n\t\t\t\t}\n\t\t\t});\n\t\t}\n\t\t\n\t});\n\n});\n","AbstractAction.js":"GollumJS.NS(GollumJS.Component, function() {\n\t\t\n\tthis.AbstractAction = new GollumJS.Class({\n\t\t\n\t\tExtends: GollumJS.Component.Element,\n\t\t\n\t\tlayerManager: null,\n\t\t\n\t\tgetRequest: function() {\n\t\t\tvar request = {\n\t\t\t\tdest : URI(window.location.href).path(true),\n\t\t\t\tquery: URI(window.location.href).query(true)\n\t\t\t};\n\t\t\t\n\t\t\tvar hash = window.location.hash;\n\t\t\tif (hash && hash[0] == '#') {\n\t\t\t\thash = hash.substr(1);\n\t\t\t}\n\t\t\t\n\t\t\tif (hash) {\n\t\t\t\trequest.path  = hash.split('/');\n\t\t\t\trequest.action = request.path.shift();\n\t\t\t}\n\t\t\treturn request;\n\t\t},\n\t\t\n\t\tgetUri: function() {\n\t\t\tvar request = this.getRequest();\n\t\t\tvar path = request.path ? '/'+request.path.join('/') : '';\n\t\t\treturn this.name + path;\n\t\t}\n\t\t\n\t\t\n\t});\n\n});\n"},"css":{}})});