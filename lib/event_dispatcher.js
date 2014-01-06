
"use strict";
/*jslint browser: true, nomen: true*/

var Event = require('./event');

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
            this._eventListeners[type].splice(index, 1);
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

    // Only update the target if this is the first dispatch.
    if (event.target === null || event.target === undefined) {
        event.target = this;
    }

    if (listeners !== undefined) {
        for (i = 0; i < listeners.length; i += 1) {
            listeners[i].call(null, event);
        }
    }
    return this;
};

/**
 * Ease-of-use function to dispatch a change event with the value and previous value.
 *
 * @param {String}
 * @param {Object}
 * @param {Object}
 */
EventDispatcher.prototype.dispatchChangeEvent = function (eventType, value, prevValue) {
    var event = new Event(eventType, value, prevValue);
    return this.dispatchEvent(event);
};

module.exports = EventDispatcher;
