var listeners = {};

export var Events = {
    on: function( event, listener ) {
        if ( !listeners.hasOwnProperty( event ) ) {
            listeners[event] = [];
        }
        listeners[event].push( listener );
    },

    off: function( event, listener ) {
        if ( listeners.hasOwnProperty( event ) ) {
            var idx = listeners.indexOf( listener );
            if ( idx >= 0 ) {
                listeners[event].splice(idx, 1);
            }
        }
    },

    emit: function( event, data ) {
        if ( !Array.isArray( data ) ) {
            throw 'event data must be an array';
        }
        if ( listeners.hasOwnProperty( event ) ) {
            for (var i = 0; i < listeners[event].length; i++) {
                listeners[event][i].apply( null, data );
            }
        }
    }
};