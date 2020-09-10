'use strict';

(function(){
	var options = {
			id: undefined,					// The id of the form.
			onRegistered: undefined,		// The method to call when we have successfully registered.
			onError: undefined,				// The method to call in the event of an error,
			url: 'https://www.HostedFields.com',	// The url that will be used to construct the hosted fields.
			fields: {
				userDetails: undefined,				// The user token assigned to the user userToken + ':' + expirationTime + ':' + BASE64( sha512( userToken + ':' + expireTime_t + ':' + key ) )
				styles: {							// Style the fields
					
				},
				cardNumber: {
					selector: undefined,			// The selector to use for the cardNumber container.
					placeHolder:  undefined			// The placeholder text to use.
				},
				expirationDate: {
					selector: undefined,			// The selector to use for the cardNumber container.
					placeHolder:  undefined			// The placeholder text to use.
				}
			}
	};
	
	var form;
	
	function setup(
		clientId,
		type,
		opts
	){
	    for (var opt in opts)
	    {
	    	options[opt] = opts[opt];
	    }
	    
	    options.fields.clientId = clientId;
	    
	    // Hijack the form. We'll capture submit
	    // events and then communicate with our iframe
	    // to submit.
	    form = new FormNapper( opts.id );
	    form.hijack( _formSubmitted );

	    var fieldCount = 0;
	    framebus.on("FRAME_READY", function (reply) {
	        fieldCount--;
	        reply(fieldCount === 0);
	      });
	    
	    framebus.on( "CONFIGURATION_REQUEST", function( reply ) {
	    	reply( options.fields );
	    });
	    
	    var container = document.querySelector( options.fields.cardNumber.selector );
	    
	    // Insert iframe for card number
	    var iframe = _createIframe( options.url + '/partner/hosted' );
	    iframe.name = 'cardNumber';
	    container.appendChild( iframe );
	    fieldCount++;

	    if (typeof options.fields.expirationDate !== 'undefined' && typeof options.fields.expirationDate.selector !== 'undefined')
	    {
		    container = document.querySelector( options.fields.expirationDate.selector );
		    
		    // Insert iframe for expiration date
		    iframe = _createIframe( options.url + '/partner/hosted' );
		    iframe.name = 'expirationDate';
		    container.appendChild( iframe );
		    fieldCount++;
	    }
	}
	
	function _createIframe( url )
	{
		var iframe = document.createElement( 'iframe' );
		
		iframe.src = url;
		iframe.style.height = '100%';
		iframe.style.width = '100%';
		iframe.setAttribute('frameborder', '0');
		iframe.setAttribute('allowTransparency', 'true');
		iframe.style.border = '0';
		iframe.style.zIndex = '99999';
		
		return iframe;
	}
	
	function _formSubmitted( event )
	{
        /*framebus.emit( 'message', {
            from: 'Ron',
            contents: 'they named it... San Diago'
	    });	*/
		framebus.emit( "REGISTER_CARD_DETAILS", function( resp ) {
			if( resp.err )
			{
				if( options.onError )
				{
					options.onError( resp.err );
				}else
				{
					alert( "Error registering card: " + resp.err );
				}
				return;
			}
			
			// If a call back was specified then send that.
			// data:
			//		userToken + ':' + cardId + ':' + nonce + ':' + BASE64( sha512( userToken + ':' + cardId + ':' + nonce + ':' + key ) );
			if( options.onRegistered )
			{
				options.onRegistered( resp );
			}else
			{
				form.inject( "REGISTER_DETAILS", resp.details );
				form.submit();
			}
		});
	}
	
	var global = window;

/*
Copyright (c) 2009-2015 Braintree, a division of PayPal, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
	// https://github.com/braintree/form-napper/blob/master/index.js
	function FormNapper(form) 
	{
		if (typeof form === 'string' || form instanceof String) 
		{
			form = document.getElementById(form);
		}
	
		if (form instanceof HTMLFormElement) 
		{
			this.htmlForm = form;
		} else 
		{
			throw new TypeError( 'FormNapper requires an HTMLFormElement element or the id string of one.' );
		}
	}
	
	FormNapper.prototype.hijack = function(onsubmit) 
	{
		function handler(event) 
		{
			if (event.preventDefault) 
			{
				event.preventDefault();
			} else 
			{
				event.returnValue = false;
			}
	
			onsubmit(event);
		}
	
		if (global.addEventListener != null) 
		{
			this.htmlForm.addEventListener('submit', handler, false);
		} else if (global.attachEvent != null) 
		{
			this.htmlForm.attachEvent('onsubmit', handler);
		} else 
		{
			this.htmlForm.onsubmit = handler;
		}
	};
	
	FormNapper.prototype.inject = function(name, value) 
	{
		var input = this.htmlForm.querySelector('input[name="' + name + '"]');
	
		if (input == null) 
		{
			input = document.createElement('input');
			input.type = 'hidden';
			input.name = name;
			this.htmlForm.appendChild(input);
		}
	
		input.value = value;
	};
	
	FormNapper.prototype.submit = function() 
	{
		HTMLFormElement.prototype.submit.call(this.htmlForm);
	};


	// FRAMEBUS https://github.com/braintree/framebus
	var win, framebus;
	var popups = [];
	var subscribers = {};
	var prefix = '/*framebus*/';

	function include(popup) 
	{
		if (popup == null) 
		{
			return false;
		}
		if (popup.Window == null) 
		{
			return false;
		}
		if (popup.constructor !== popup.Window) 
		{
			return false;
		}

		popups.push(popup);
		return true;
	}

	function target(origin) 
	{
		var key;
		var targetedFramebus = {};

		for (key in framebus) 
		{
			if (!framebus.hasOwnProperty(key)) 
			{
				continue;
			}

			targetedFramebus[key] = framebus[key];
		}

		targetedFramebus._origin = origin || '*';

		return targetedFramebus;
	}

	function publish(event) 
	{
		var payload, args;
		var origin = _getOrigin(this);

		if (_isntString(event)) 
		{
			return false;
		}
		if (_isntString(origin)) 
		{
			return false;
		}

		args = Array.prototype.slice.call(arguments, 1);

		payload = _packagePayload(event, args, origin);
		if (payload === false) 
		{
			return false;
		}

		_broadcast(win.top, payload, origin);

		return true;
	}

	function subscribe(event, fn) 
	{
		var origin = _getOrigin(this);

		if (_subscriptionArgsInvalid(event, fn, origin)) 
		{
			return false;
		}

		subscribers[origin] = subscribers[origin] || {};
		subscribers[origin][event] = subscribers[origin][event] || [];
		subscribers[origin][event].push(fn);

		return true;
	}

	function unsubscribe(event, fn) 
	{
		var i, subscriberList;
		var origin = _getOrigin(this);

		if (_subscriptionArgsInvalid(event, fn, origin)) 
		{
			return false;
		}

		subscriberList = subscribers[origin] && subscribers[origin][event];
		if (!subscriberList) 
		{
			return false;
		}

		for (i = 0; i < subscriberList.length; i++) 
		{
			if (subscriberList[i] === fn) 
			{
				subscriberList.splice(i, 1);
				return true;
			}
		}

		return false;
	}

	function _getOrigin(scope) 
	{
		return scope && scope._origin || '*';
	}

	function _isntString(string) 
	{
		return typeof string !== 'string';
	}

	function _packagePayload(event, args, origin) 
	{
		var packaged = false;
		var payload = 
		{
			event : event,
			origin : origin
		};
		var reply = args[args.length - 1];

		if (typeof reply === 'function') 
		{
			payload.reply = _subscribeReplier(reply, origin);
			args = args.slice(0, -1);
		}

		payload.args = args;

		try 
		{
			packaged = prefix + JSON.stringify(payload);
		} catch (e) 
		{
			throw new Error('Could not stringify event: ' + e.message);
		}
		return packaged;
	}

	function _unpackPayload(e) 
	{
		var payload, replyOrigin, replySource, replyEvent;

		if (e.data.slice(0, prefix.length) !== prefix) 
		{
			return false;
		}

		try 
		{
			payload = JSON.parse(e.data.slice(prefix.length));
		} catch (err) 
		{
			return false;
		}

		if (payload.reply != null) {
			replyOrigin = e.origin;
			replySource = e.source;
			replyEvent = payload.reply;

			payload.reply = function reply(data) {
				var replyPayload = _packagePayload(replyEvent, [ data ],
						replyOrigin);
				if (replyPayload === false) {
					return false;
				}

				replySource.postMessage(replyPayload, replyOrigin);
			};

			payload.args.push(payload.reply);
		}

		return payload;
	}

	function _attach(w)
	{
		if (win) 
		{
			return;
		}
		
		win = w || window;

		if (win.addEventListener) 
		{
			win.addEventListener('message', _onmessage, false);
		} else if (win.attachEvent) 
		{
			win.attachEvent('onmessage', _onmessage);
		} else if (win.onmessage === null) 
		{
			win.onmessage = _onmessage;
		} else 
		{
			win = null;
		}
	}

	function _uuid() 
	{
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
			function(c) 
			{
				var r = Math.random() * 16 | 0;
				var v = c === 'x' ? r : r & 0x3 | 0x8;
				return v.toString(16);
			});
	}

	function _onmessage(e) 
	{
		var payload;
		if (_isntString(e.data)) 
		{
			return;
		}

		payload = _unpackPayload(e);
		if (!payload) 
		{
			return;
		}

		_dispatch('*', payload.event, payload.args, e);
		_dispatch(e.origin, payload.event, payload.args, e);
		_broadcastPopups(e.data, payload.origin, e.source);
	}

	function _dispatch(origin, event, args, e) 
	{
		var i;
		if (!subscribers[origin]) 
		{
			return;
		}
		if (!subscribers[origin][event]) 
		{
			return;
		}

		for (i = 0; i < subscribers[origin][event].length; i++) 
		{
			subscribers[origin][event][i].apply(e, args);
		}
	}

	function _broadcast(frame, payload, origin) 
	{
		var i;
		frame.postMessage(payload, origin);

		if (frame.opener && frame.opener !== win) 
		{
			_broadcast(frame.opener.top, payload, origin);
		}

		for (i = 0; i < frame.frames.length; i++) 
		{
			_broadcast(frame.frames[i], payload, origin);
		}
	}

	function _broadcastPopups(payload, origin, source) 
	{
		var i, popup;

		for (i = popups.length - 1; i >= 0; i--) 
		{
			popup = popups[i];

			if (popup.closed === true) 
			{
				popups = popups.slice(i, 1);
			} else if (source !== popup) 
			{
				_broadcast(popup.top, payload, origin);
			}
		}
	}

	function _subscribeReplier(fn, origin) 
	{
		var uuid = _uuid();

		function replier(d, o) 
		{
			fn(d, o);
			framebus.target(origin).unsubscribe(uuid, replier);
		}

		framebus.target(origin).subscribe(uuid, replier);
		return uuid;
	}

	function _subscriptionArgsInvalid(event, fn, origin) 
	{
		if (_isntString(event)) 
		{
			return true;
		}
		if (typeof fn !== 'function') 
		{
			return true;
		}
		if (_isntString(origin)) 
		{
			return true;
		}

		return false;
	}

	_attach();

	framebus = 
	{
		target : target,
		include : include,
		publish : publish,
		pub : publish,
		trigger : publish,
		emit : publish,
		subscribe : subscribe,
		sub : subscribe,
		on : subscribe,
		unsubscribe : unsubscribe,
		unsub : unsubscribe,
		off : unsubscribe
	};
		
	// END FRAMEBUS

	// Continue with HostedFields wrapper.
	var HostedFields = 
	{
		setup: setup
	};

	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	    module.exports = HostedFields;
	} else {
		if (typeof define === 'function' && define.amd) {
		  define([], function() {
		    return HostedFields;
		  });
		}
	}

	window.HostedFields = HostedFields;
})();
