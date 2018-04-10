'use strict';

var Tracker = (function(wp){
	var w = wp;
	var e = w.empyr.q;
	
	var _e = {
		pixel: '//t.mogl.com/t/t.png',
		push : function(){
			//console.log( arguments );
			var a = Array.from( arguments );
			_e[a[0]].apply( _e, a.slice(1) );
		},
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
					var ov;
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

									ov = ov || node.getAttribute( 'vw' );
								}
							}
						}
					}
					
					_e.track( oi, ov );
				});
				
				obs.observe( document.documentElement, {childList:true, subtree:true} );
			}
			//console.log( _e );
		},
		trackEl: function( el ){
			// Go through and search for all the offers which may be present in the document.
			var oi = [];
			var ov;
			for( var i = 0; i < el.length; i++ ) {
				if( el[i] ){
					if( el[i] instanceof HTMLElement ){
						var oa = el[i].getAttribute( 'eid' );
						if( oa != null ){
							oi.push( oa );
						}
						ov = ov || el[i].getAttribute( 'vw' );
					}
				}
			}
			_e.track( oi, ov );
		},
		track : function( oi, ov ){
			if( oi.length ){
				//console.log( JSON.stringify( oi ) );
				(new Image()).src = _e.pixel + "?v=0&d=w&vw=" + ov + "&pid=" + _e.p + "&oi=" + ((oi instanceof Array) ? oi.join( "," ) : oi) + "&" + _e.id;
			}
		}
	}
	
	Tracker = {
		push: _e.push
	};
	
	w.empyr = _e.push;
	
	for( var i = 0; i < e.length; i++ ){
		w.empyr.apply( w.empyr, e[i] );
	}

	return Tracker;
	
})(window);

module.exports = Tracker;