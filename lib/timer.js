
"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Initializes a new Timer instance.
 */
function Timer(frame, fn) {
    this._id = Timer.nextid;
    Timer.nextid += 1;

    this._frame = frame;
    this._fn = fn;
    this._startTime = undefined;
    this._endTime = undefined;
    this._interval = undefined;
    this._running = true;
    this._onend = null;
}

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
 * Retrieves the end time of the timer. Returns undefined if there is
 * no end time.
 *
 * @return {Number}
 */
Timer.prototype.endTime = function (value) {
    if (arguments.length === 0) {
        return this._endTime;
    }
    this._endTime = value;
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
    this.endTime(this.startTime() + (this.interval() * (Math.max(1, value))));
    return this;
};

/**
 * Sets end time based on the start time and given duration.
 *
 * @param {Number}
 */
Timer.prototype.duration = function (value) {
    if (arguments.length === 0) {
        if (this._endTime === undefined) {
            return undefined;
        }
        return this._endTime - this._startTime;
    }
    this.endTime(this.startTime() + value);
    return this;
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
        this.endHandler();
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
    this._running = false;
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
 * Sets or retrieves the function to be executed when a timer transitions from
 * a running state to a stopped state.
 *
 * @return {Frame|Function}
 */
Timer.prototype.onend = function (value) {
    if (arguments.length === 0) {
        return this._onend;
    }
    this._onend = value;
    return this;
};

/**
 * Retrieves the time of the next execution on or after a given time.
 *
 * @return {Number}
 */
Timer.prototype.until = function (t) {
    var offset,
        startTime = this.startTime(),
        endTime   = this.endTime(),
        interval  = this.interval();

    // If timer is stopped then always return null.
    if (!this.running()) {
        return null;
    }

    // If we're past the end time then return null.
    if (endTime !== undefined && t > endTime) {
        return null;
    }

    // If we haven't reached the start time then the next execution
    // is the start time.
    if (startTime !== undefined && startTime > t) {
        return startTime;
    }

    // If start time or interval are undefined then just return
    // end time (if available).
    if (startTime === undefined || interval === undefined) {
        if (endTime !== undefined) {
            return endTime;
        }
        return null;
    }

    // If t is on an interval then return it.
    offset = t - startTime;
    if (offset % interval === 0) {
        return t;
    }

    // Otherwise find the next interval that occurs immediately after t.
    return startTime + ((Math.floor(offset / interval) + 1) * interval);
};

/**
 * The handler executed when the timer transitions from running to stopped.
 */
Timer.prototype.endHandler = function () {
    // Execute the "onend" handler if one exists.
    if (this.onend() !== null) {
        this.onend().call(this);
    }
};

module.exports = Timer;
