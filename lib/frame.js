
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
function Frame(id, title, fn) {
    EventDispatcher.call(this);

    if (!is.fn(fn)) {
        throw "Frame function required";
    }
    this._id = id;
    this._title = title;
    this._fn = fn;
    this._player = null;
    this._playhead = 0;
    this._model = null;
    this._timers = [];
    this._executedTimers = {};
    this._snapshots = [];
}

Frame.prototype = new EventDispatcher();
Frame.prototype.constructor = Frame;

/**
 * Returns the frame identifier.
 *
 * @return {String}
 */
Frame.prototype.id = function () {
    return this._id;
};

/**
 * Returns the frame title.
 *
 * @return {String}
 */
Frame.prototype.title = function () {
    return this._title;
};

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
Frame.prototype.playhead = function (v) {
    var i, timers, nextTimerAt,
        self = this,
        value = Math.ceil(v);

    if (arguments.length === 0) {
        return this._playhead;
    }
    if (this._playhead >= value) {
        return this;
    }

    this.removeStaleTimers();

    // Execute timers between previous playhead position and current.
    while (true) {
        // Continue executing timers at this playhead position until there are
        // none left. This can loop multiple times if timers are created without
        // a delay. This can go in an infinite loop if a timer keeps creating 
        // new undelayed timers that create other new undelayed timers.
        while (true) {
            timers = this.currentTimers();
            if (timers.length === 0) {
                break;
            }

            // Run all timers the current playhead position.
            for (i = 0; i < timers.length; i += 1) {
                timers[i].run();
                this._executedTimers[timers[i].id()] = true;
            }
            this.removeStaleTimers();
        }


        // Stop moving the playhead forward if a timer paused the player.
        if (this.player() !== null && this.player().rate() === 0) {
            break;
        }

        // If we have no future timers before the next playhead then exit.
        nextTimerAt = this.nextTimerAt(this._playhead + 1);
        if (nextTimerAt === null || nextTimerAt > value || nextTimerAt === Timer.MAX) {
            break;
        }
        this._playhead = nextTimerAt;
        this._executedTimers = {};
    }

    // Set the final value of the playhead to what was passed in if still playing.
    if (this.player() === null || this.player().rate() > 0) {
        this._playhead = value;
    }

    this.removeStaleTimers();

    return this;
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
Frame.prototype.timers = function (playhead) {
    var _playhead = (playhead !== undefined ? playhead : this.playhead());

    // Sort timers by next play time.
    this._timers = this._timers.sort(function (a, b) {
        var ret = a.until(_playhead) - b.until(_playhead);
        return (ret !== 0 ? ret : a.id() - b.id());
    });

    return this._timers;
};

/**
 * Retrieves a list of active timers at the current playhead.
 */
Frame.prototype.currentTimers = function () {
    var self = this, playhead = this.playhead();
    return this.timers().filter(function (timer) {
        return !self._executedTimers[timer.id()] && timer.until(playhead) === playhead;
    });
};

/**
 * Stops a timer with the given identifier.
 */
Frame.prototype.clearTimer = function (value) {
    var i,
        id = (is.object(value) ? value.id() : value);
    for (i = 0; i < this._timers.length; i += 1) {
        if (this._timers[i].id() === id) {
            this._timers[i].stop();
        }
    }
};

/**
 * Removes timers that are stopped or don't have a next execution time.
 */
Frame.prototype.removeStaleTimers = function () {
    var i, timer, nextTime, playhead = this.playhead();

    // Stop all timers that don't have a next play time.
    for (i = 0; i < this._timers.length; i += 1) {
        timer = this._timers[i];
        nextTime = timer.until(playhead + (this._executedTimers[timer.id()] ? 1 : 0));
        if (nextTime === null) {
            timer.stop();
        }
    }

    // Remove all stopped timers.
    this._timers = this._timers.filter(function (timer) {
        return timer.running();
    });
};

/**
 * Retrieves the playhead position of the next timer from a given start time.
 */
Frame.prototype.nextTimerAt = function (playhead) {
    var timers = this.timers(playhead);
    if (timers.length === 0) {
        return null;
    }
    return timers[0].until(playhead);
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
    for (i = 0; i < this._timers.length; i += 1) {
        this._timers[0].stop();
    }
    this._timers = [];
    this._snapshots = [];
};

module.exports = Frame;
