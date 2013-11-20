
"use strict";
/*jslint browser: true, nomen: true*/

var Timer = require('./timer'),
    Tween = require('./tween'),
    is    = require('is');

/**
 * Initializes a new Frame instance.
 */
function Frame(fn) {
    if (!is.fn(fn)) {
        throw "Frame function required";
    }
    this._fn = fn;
    this._player = null;
    this._onend = null;
    this._playhead = 0;
    this._duration = 0;
    this._model = null;
    this._timers = [];
    this._tweens = [];
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
 * Sets or retrieves the player this frame belongs to.
 *
 * @return {Frame|Player}
 */
Frame.prototype.player = function (value) {
    if (arguments.length === 0) {
        return this._player;
    }
    this._player = value;
    return this;
};

/**
 * Sets or retrieves the current playhead position. This is the
 * time elapsed in milliseconds for the frame.
 *
 * @return {Boolean}
 */
Frame.prototype.playhead = function (value) {
    var self = this, i, timer, timers, tween, tweens;
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

    // Update all tweens.
    tweens = this.tweens();
    for (i = 0; i < tweens.length; i += 1) {
        tween = tweens[i];
        tween.update(this._playhead);
    }

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
 */
Frame.prototype.timer = function (fn) {
    var timer = new Timer(this, fn);
    timer.startTime(this.playhead());
    this._timers.push(timer);
    return timer;
};

/**
 * Creates a tween to update on each tick.
 *
 * @param {Function}
 * @param {Number}
 */
Frame.prototype.tween = function (fn, startValue, endValue, duration, delay) {
    if (duration === undefined) {
        duration = 0;
    }
    duration = Math.max(0, duration);

    if (delay === undefined) {
        delay = 0;
    }
    delay = Math.max(0, delay);

    var startTime = this.playhead() + delay,
        endTime = startTime + duration,
        tween = new Tween(fn, startValue, endValue, startTime, endTime);
    console.log(startTime, endTime, startValue, endValue);
    this._tweens.push(tween);

    // Execute tween immediately if there is no delay.
    if (delay === 0) {
        tween.update();
    }

    return tween;
};

/**
 * Retrieves a list of active timers sorted by time until next frame.
 */
Frame.prototype.timers = function () {
    var i, timer, playhead = this.playhead();

    // Stop all timers that don't have a next play time.
    for (i = 0; i < this._timers.length; i += 1) {
        timer = this._timers[i];
        if (timer.until(playhead) === null) {
            timer.stop();
        }
    }

    // Remove all stopped timers.
    this._timers = this._timers.filter(function (timer) {
        return timer.running();
    });

    // Sort remaining timers by next play time.
    this._timers = this._timers.sort(function (a, b) {
        var ret = a.until(playhead) - b.until(playhead);
        return (ret !== 0 ? ret : a.id() - b.id());
    });

    return this._timers;
};

/**
 * Retrieves a list of active tweens sorted by start time.
 */
Frame.prototype.tweens = function () {
    var playhead = this.playhead();
    this._tweens = this._tweens.filter(function (tween) {
        return playhead < tween.endTime();
    });
    this._tweens = this._tweens.sort(function (a, b) {
        return a.startTime - b.startTime;
    });
    return this._tweens;
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
 * Retrieves the layout used by the player.
 *
 * @return {Layout}
 */
Frame.prototype.layout = function (value) {
    var player = this.player();
    return (player !== null ? player.layout() : null);
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
