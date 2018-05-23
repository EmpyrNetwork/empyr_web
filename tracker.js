'use strict';

(function(){
	
	var _e = {
		view: 'WEB_SEARCH_VIEW',
		pixel: '//t.mogl.com/t/t.png',
		setup : function( pI ){	
			if( !pI ){
				throw "Partner id not defined in setup call";
			}
			
			_e.p = pI;
			
			_e.m = arguments[1]["m"] ? 'm=' + arguments[1]["m"] : undefined;
			_e.u = arguments[1]["u"] ? 'u=' + arguments[1]["u"] : undefined;
			_e.h = arguments[1]["h"] ? 'h=' + arguments[1]["h"] : undefined;

			_e.id = _e.m || _e.u || _e.h || "";
			//console.log( _e.id );
			
			var el = document.getElementsByTagName( '*' );
			_e.trackEl( el );
			
			var mo = window.MutationObserver || window.WebKitMutationObserver;
			if( mo && arguments[1]["watch"] ){
				var obs = new mo( function( m, observer ){
					
					var oi = [];
					for( var i = 0; i < m.length; i++ ){
						for( var j = 0; j < m[i].addedNodes.length; j++ ){
							var nodes = m[i].addedNodes[j]
							
							if( !(nodes instanceof HTMLElement ) )
								continue;
							
							nodes = nodes.getElementsByTagName( '*' );
							for( var k = 0; k < nodes.length; k++ ){
								var node = nodes[k];
								if( node instanceof HTMLElement ){
									var oa = node.getAttribute( 'eid' );
									if( oa != null ){
										oi.push( oa );
									}

									_e.view = node.getAttribute( 'vw' ) || _e.view;
								}
							}
						}
					}
					
					_e.track( oi );
				});
				
				obs.observe( document.documentElement, {childList:true, subtree:true} );
			}
			//console.log( _e );
		},
		trackEl: function( el ){
			// Go through and search for all the offers which may be present in the document.
			var oi = [];
			for( var i = 0; i < el.length; i++ ) {
				if( el[i] ){
					if( el[i] instanceof HTMLElement ){
						var oa = el[i].getAttribute( 'eid' );
						if( oa != null ){
							oi.push( oa );
						}
						_e.view = el[i].getAttribute( 'vw' ) || _e.view;
					}
				}
			}
			_e.track( oi );
		},
		track : function( oi ){
			if( oi.length ){
				//console.log( JSON.stringify( oi ) );
				(new Image()).src = _e.pixel + "?pid=" + _e.p + "&" + _e.view + "=" + ((oi instanceof Array) ? oi.join( "," ) : oi) + (_e.id ? ("&" + _e.id) : '');
			}
		}
	}
	
	var Tracker = {
		setup: _e.setup,
		track: _e.track
	};
	
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	    module.exports = Tracker;
	} else {
		if (typeof define === 'function' && define.amd) {
		  define([], function() {
		    return Tracker;
		  });
		}
	}

	window.Tracker = Tracker;
})();