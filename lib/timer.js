
"use strict";
/*jslint browser: true, nomen: true*/

var EventDispatcher = require('./event_dispatcher'),
    Event           = require('./event');

/**
 * Initializes a new Timer instance.
 */
function Timer(frame, fn) {
    EventDispatcher.call(this);

    this._id = Timer.nextid;
    Timer.nextid += 1;

    this._frame = frame;
    this._fn = fn;
    this._startTime = undefined;
    this._interval = undefined;
    this._duration = undefined;
    this._running = true;
}

Timer.prototype = new EventDispatcher();
Timer.prototype.constructor = Timer;

Timer.nextid = 1;

/**
 * Retrieves the timer identifier.
 *
 * @return {Number}
 */
Timer.prototype.id = function () {
    return this._id;
};

/**
 * Retrieves the frame this timer is associated with.
 *
 * @return {Frame}
 */
Timer.prototype.frame = function () {
    return this._frame;
};

/**
 * Retrieves the start time of the timer.
 *
 * @return {Number}
 */
Timer.prototype.startTime = function (value) {
    if (arguments.length === 0) {
        return this._startTime;
    }
    this._startTime = value;
    return this;
};

/**
 * Retrieves the interval in milliseconds between executions.
 *
 * @return {Number}
 */
Timer.prototype.interval = function (value) {
    if (arguments.length === 0) {
        return this._interval;
    }
    if (value <= 0) {
        this._interval = undefined;
    } else {
        this._interval = value;
    }
    return this;
};

/**
 * Increments the start time by a given number of milliseconds.
 *
 * @param {Number}
 */
Timer.prototype.delay = function (value) {
    if (value <= 0) {
        return;
    }
    this._startTime += value;
    return this;
};

/**
 * Sets the number of times the timer should execute.
 *
 * @param {Number}
 */
Timer.prototype.times = function (value) {
    if (value > 1) {
        this.duration(this.interval() * (value - 1));
    } else {
        this.interval(undefined);
        this.duration(undefined);
    }
    return this;
};

/**
 * Sets end time based on the start time and given duration.
 *
 * @param {Number}
 */
Timer.prototype.duration = function (value) {
    if (arguments.length === 0) {
        return this._duration;
    }
    if (value >= 0) {
        this._duration = value;
    } else {
        this._duration = undefined;
    }
    return this;
};

/**
 * Creates a timer after this timer ends.
 *
 * @param {Function}
 * @return {Timer}
 */
Timer.prototype.then = function (fn) {
    var frame = this.frame(),
        startTime = frame.playhead(),
        timer = new Timer(frame, fn).startTime(startTime);

    // HACK: We're adding the timer to the frame's timer list externally.
    // This should be cleaned up when we better understand the model.
    this.addEventListener("end", function () {
        // Offset by the original playhead position.
        var offset = frame.playhead() - startTime;
        if (timer.startTime() !== undefined) {
            timer.startTime(timer.startTime() + offset);
        }

        frame._timers.push(timer);
    });

    return timer;
};

/**
 * Creates a timer that runs once after a given delay. The start time
 * of the new timer is relative to the end time of this timer.
 *
 * @param {Number}
 * @param {Function}
 * @return {Timer}
 */
Timer.prototype.after = function (delay, fn) {
    return this.then(fn).delay(delay);
};

/**
 * Sets or retrieves whether the timer is actively running. A timer can only
 * move from running to not running (aka stopped). Resuming is not currently
 * supported.
 *
 * @return {Frame|Boolean}
 */
Timer.prototype.running = function (value) {
    if (arguments.length === 0) {
        return this._running;
    }
    // Only update for stops.
    if (this._running && !value) {
        this.dispatchEvent(new Event("end"));
        this._running = value;
    }
    return this;
};

/**
 * Stops the timer.
 *
 * @return {Timer}
 */
Timer.prototype.stop = function () {
    this.running(false);
    return this;
};

/**
 * Executes the timer function.
 */
Timer.prototype.run = function () {
    this._fn.call(this, this);
    return this;
};

/**
 * Retrieves the time of the next execution on or after a given time.
 *
 * @return {Number}
 */
Timer.prototype.until = function (t) {
    var startTime = this.startTime(),
        interval  = this.interval(),
        duration  = this.duration(),
        offset    = t - startTime;

    // POSSIBLE TIMERS:
    // - Single use:   startTime only
    // - Neverending:  startTime + interval
    // - Fixed length: startTime + interval + duration
    if (!this.running()) {
        return null;
    }
    if (startTime === undefined) {
        return null;
    }
    if (t <= startTime) {
        return startTime;
    }
    if (interval === undefined) {
        return null;
    }
    if (duration !== undefined && t > startTime + duration) {
        return null;
    }

    // If t is on an interval then return it, otherwise return next interval.
    if (offset % interval === 0) {
        return t;
    }
    return startTime + ((Math.floor(offset / interval) + 1) * interval);
};

module.exports = Timer;
