GollumJS.NS(GollumJS.Component.Loader.Style, function() {
	
	this.IncludeCore = new GollumJS.Class({
		
		Extends: GollumJS.Component.Loader.Style.Include,
		
		getContent: function (src) {
			return '' +
				'@function str-replace($string, $search, $replace: \'\') {'+"\n"+
				'	$index: str-index($string, $search);'                  +"\n"+
				'	@if $index {'                                          +"\n"+
				'		@return '                                          +"\n"+
				'			str-slice($string, 1, $index - 1) +'           +"\n"+
				'			$replace + '                                   +"\n"+
				'			str-replace(str-slice('                        +"\n"+
				'				$string, $index + str-length($search)),'   +"\n"+
				'				$search,'                                  +"\n"+
				'				$replace'                                  +"\n"+
				'			)'                                             +"\n"+
				'		;'                                                 +"\n"+
				'	}'                                                     +"\n"+
				'	@return $string;'                                      +"\n"+
				'}'                                                        +"\n\n"+

				'@function gjs-component-path($component, $path: null) {'+"\n"+
				'	@if $path == null {'                                 +"\n"+
				'		$path: $component;'                              +"\n"+
				'		$component: \''+src+'\';'                        +"\n"+
				'	}'                                                   +"\n"+
				'	$component: str-replace($component, \':\', \'/\');'   +"\n"+
				'	@return \'components/\'+$component+\'/\'+$path;'     +"\n"+
				'}'                                                      +"\n\n"+

				'@mixin gjs-component($src: null) {'       +"\n"+
				'	@if $src == null {'                    +"\n"+
				'		$src: \''+src+'\';'                +"\n"+
				'	}'                                     +"\n"+
				'	gjs-component[src="#{$src}"] {'        +"\n"+
				'	   @content;'                          +"\n"+
				'	}'                                     +"\n"+
				'}'                                        +"\n\n"
			;
		}
		
	});
	
});