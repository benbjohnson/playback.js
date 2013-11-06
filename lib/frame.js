
"use strict";
/*jslint browser: true, nomen: true*/

var Timer = require('./timer');

/**
 * Initializes a new Frame instance.
 */
function Frame() {
    this._playhead = 0;
    this._duration = 0;
    this._timers = [];
}

/**
 * Sets or retrieves the current playhead position. This is the
 * time elapsed in milliseconds for the frame.
 *
 * @return {Boolean}
 */
Frame.prototype.playhead = function (value) {
    if (arguments.length === 0) {
        return this._playhead;
    }
    this._playhead = value;
    this._duration = Math.max(this._duration, this._playhead);
    return this;
};

/**
 * Retrieves the duration of the frame. This is the maximum playhead
 * position that has been seen.
 */
Frame.prototype.duration = function () {
    return this._duration;
};

/**
 * Executes a function after a given delay.
 *
 * @param {Function}
 * @param {Number}
 */
Frame.prototype.timer = function (fn, interval, delay) {
    if (delay === undefined) {
        delay = 0;
    }
    delay = Math.max(0, delay);

    var timer = new Timer(fn, this.playhead() + delay, interval);
    this._timers.push(timer);
    return timer;
};


module.exports = Frame;
