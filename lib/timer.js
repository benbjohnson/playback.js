
"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Initializes a new Timer instance.
 */
function Timer(fn) {
    this._id = Timer.nextid;
    Timer.nextid += 1;

    this._fn = fn;
    this._startTime = undefined;
    this._endTime = undefined;
    this._interval = undefined;
    this._running = true;
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
 * Retrieves whether the timer is actively running.
 *
 * @return {Boolean}
 */
Timer.prototype.running = function () {
    return this._running;
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

    if (!this.running() || startTime === undefined || interval === undefined) {
        return null;
    }

    // If we haven't reached the start time then the next execution
    // is the start time.
    if (startTime > t) {
        return startTime;
    }

    // If we're past the end time then return null.
    if (endTime !== undefined && t > endTime) {
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

module.exports = Timer;
