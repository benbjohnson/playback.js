
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
    var i, timer, timers;
    if (arguments.length === 0) {
        return this._playhead;
    }
    if (this._playhead >= value) {
        return this;
    }

    // Execute timers between previous playhead position and current.
    while (true) {
        timers = this.timers();
        if (timers.length === 0) {
            break;
        }

        // Find next playhead position.
        this._playhead = this.timers[0].until(this._playhead);
        if (this._playhead > value) {
            break;
        }
        this._duration = Math.max(this._duration, this._playhead);

        // Run all timers at that position.
        for (i = 0; i < timers.length; i += 1) {
            timer = timers[i];
            if (i > 0 && timer.until(this._playhead) > 0) {
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
        return a.until(playhead) - b.until(playhead);
    });
    return this._timers;
};


module.exports = Frame;
