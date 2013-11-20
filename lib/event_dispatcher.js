
"use strict";
/*jslint browser: true, nomen: true*/

/**
 * EventDispatcher is a subclass for any objects that want to dispatch
 * events through the standard addEventListener()/removeEventListener()
 * interface.
 */
function EventDispatcher() {
    this._eventListeners = {};
}

/**
 * Adds a new event listener for a given event type.
 *
 * @param {String}
 * @param {Function}
 * @return {EventDispatcher}
 */
EventDispatcher.prototype.addEventListener = function (type, listener) {
    if (this._eventListeners[type] === undefined) {
        this._eventListeners[type] = [];
    }
    if (this._eventListeners[type].indexOf(listener) === -1) {
        this._eventListeners[type].push(listener);
    }
    return this;
};

/**
 * Removes an event listener for a given event type.
 *
 * @param {String}
 * @param {Function}
 * @return {EventDispatcher}
 */
EventDispatcher.prototype.removeEventListener = function (type, listener) {
    var index;
    if (this._eventListeners[type] !== undefined) {
        index = this._eventListeners[type].indexOf(listener);
        if (index !== -1) {
            this._eventListeners[type].splice(index, 0);
        }
    }
    return this;
};

/**
 * Dispatches an event to all listeners of given event's type.
 *
 * @param {Event}
 */
EventDispatcher.prototype.dispatchEvent = function (event) {
    var i, listeners = this._eventListeners[event.type];

    event.target = this;

    if (listeners !== undefined) {
        for (i = 0; i < listeners.length; i += 1) {
            listeners[i](event);
        }
    }
};

module.exports = EventDispatcher;
