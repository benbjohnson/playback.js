
"use strict";
/*jslint browser: true, nomen: true*/

var EventDispatcher = require('./event_dispatcher'),
    Event           = require('./event'),
    Snapshot        = require('./snapshot'),
    Timer           = require('./timer'),
    is              = require('is');

/**
 * Initializes a new Frame instance.
 */
function Frame(fn) {
    EventDispatcher.call(this);

    if (!is.fn(fn)) {
        throw "Frame function required";
    }
    this._fn = fn;
    this._player = null;
    this._playhead = 0;
    this._duration = 0;
    this._model = null;
    this._timers = [];
    this._snapshots = [];
}

Frame.prototype = new EventDispatcher();
Frame.prototype.constructor = Frame;

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
 * Stops the frame and executes an "end" event.
 *
 * @return {Frame}
 */
Frame.prototype.end = function () {
    this.reset();
    this.dispatchEvent(new Event("end"));
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
    var self = this, i, timer, timers;
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
 */
Frame.prototype.timer = function (fn) {
    var timer = new Timer(this, fn);
    timer.startTime(this.playhead());
    this._timers.push(timer);
    return timer;
};

/**
 * Creates a single use timer that executes after a given delay.
 *
 * @param {Number}
 * @param {Function}
 * @return {Timer}
 */
Frame.prototype.after = function (delay, fn) {
    return this.timer(fn).delay(delay);
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
 * Snapshots the state of the frame.
 */
Frame.prototype.snapshot = function () {
    var snapshot = new Snapshot(this);
    this._snapshots.push(snapshot);
    return snapshot;
};

/**
 * Restores the state of the frame from a given snapshot state.
 */
Frame.prototype.restore = function (snapshot) {
    var index = this._snapshots.indexOf(snapshot);
    if (index !== -1) {
        this._snapshots = this._snapshots.slice(0, index);
    }
    this._playhead = snapshot.playhead() - 1;
    this._timers = snapshot.timers();
    this._model = snapshot.model();
    return this;
};

/**
 * Restores the last available snapshot.
 */
Frame.prototype.rollback = function (offset) {
    var index = Math.max(0, this._snapshots.length - offset);
    if (index < this._snapshots.length) {
        this.restore(this._snapshots[index]);
    }
    return this;
};

/**
 * Returns whether the frame can be rollbacked by the given number of snapshots.
 */
Frame.prototype.rollbackable = function (offset) {
    return offset <= this._snapshots.length;
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
    this._snapshots = [];
};

module.exports = Frame;
