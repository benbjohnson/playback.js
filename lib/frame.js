
"use strict";
/*jslint browser: true, nomen: true*/

var Timer = require('./timer'),
    is    = require('is');

/**
 * Initializes a new Frame instance.
 */
function Frame(fn) {
    if (!is.fn(fn)) {
        throw "Frame function required";
    }
    this._fn = fn;
    this._onend = null;
    this._playhead = 0;
    this._duration = 0;
    this._model = null;
    this._timers = [];
}

/**
 * Initializes the frame by reseting the playhead to zero and executing
 * the frame function.
 *
 * @return {Frame}
 */
Frame.prototype.init = function () {
    this.reset();
    this._fn.call(this, this);
    return this;
};

/**
 * Stops the frame and executes the "onend" handler.
 *
 * @return {Frame}
 */
Frame.prototype.end = function () {
    this.reset();
    if (is.fn(this._onend)) {
        this._onend.call(this, this);
    }
    return this;
};

/**
 * Sets or retrieves the current playhead position. This is the
 * time elapsed in milliseconds for the frame.
 *
 * @return {Boolean}
 */
Frame.prototype.playhead = function (value) {
    var i, timer, timers;
    if (arguments.length === 0) {
        return this._playhead;
    }
    if (this._playhead >= value) {
        return this;
    }

    // Execute timers between previous playhead position and current.
    this._playhead += 1;
    while (true) {
        timers = this.timers();
        if (timers.length === 0) {
            break;
        }

        // Find next playhead position.
        this._playhead = timers[0].until(this._playhead);
        if (this._playhead > value) {
            break;
        }
        this._duration = Math.max(this._duration, this._playhead);

        // Run all timers at that position.
        for (i = 0; i < timers.length; i += 1) {
            timer = timers[i];
            if (i > 0 && timer.until(this._playhead) !== this._playhead) {
                break;
            }
            timer.run();
        }

        // Move playhead forward to at least make some progress.
        this._playhead += 1;
    }

    // Set the final value of the playhead to what was passed in.
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

    // Execute timer immediately if there is no delay.
    if (delay === 0) {
        timer.run();
    }

    return timer;
};

/**
 * Retrieves a list of active timers sorted by time until next frame.
 */
Frame.prototype.timers = function () {
    var playhead = this.playhead();
    this._timers = this._timers.filter(function (timer) {
        return timer.running();
    });
    this._timers = this._timers.sort(function (a, b) {
        var ret = a.until(playhead) - b.until(playhead);
        return (ret !== 0 ? ret : a.id() - b.id());
    });
    return this._timers;
};

/**
 * Sets or retrieves the initial frame data model.
 *
 * @return {Frame|Object}
 */
Frame.prototype.model = function (value) {
    if (arguments.length === 0) {
        return this._model;
    }
    this._model = value;
    return this;
};

/**
 * Resets the playhead and clears the timers on the frame.
 */
Frame.prototype.reset = function () {
    var i;
    this._playhead = 0;
    this._duration = 0;
    for (i = 0; i < this._timers.length; i += 1) {
        this._timers[0].stop();
    }
    this._timers = [];
};

/**
 * Sets or retrieves the onend handler.
 *
 * @return {Function|Frame}
 */
Frame.prototype.onend = function (fn) {
    if (arguments.length === 0) {
        return this._onend;
    }
    this._onend = fn;
    return this;
};


module.exports = Frame;
