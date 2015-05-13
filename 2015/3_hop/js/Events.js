define(['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, '__esModule', {
        value: true
    });
    var listeners = {};

    var Events = {
        on: function on(event, listener) {
            if (!listeners.hasOwnProperty(event)) {
                listeners[event] = [];
            }
            listeners[event].push(listener);
        },

        off: function off(event, listener) {
            if (listeners.hasOwnProperty(event)) {
                var idx = listeners.indexOf(listener);
                if (idx >= 0) {
                    listeners[event].splice(idx, 1);
                }
            }
        },

        emit: function emit(event, data) {
            if (!Array.isArray(data)) {
                throw 'event data must be an array';
            }
            if (listeners.hasOwnProperty(event)) {
                for (var i = 0; i < listeners[event].length; i++) {
                    listeners[event][i].apply(null, data);
                }
            }
        }
    };
    exports.Events = Events;
});