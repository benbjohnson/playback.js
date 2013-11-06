
"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Initializes a new Timer instance.
 */
function Timer(fn, startTime, interval) {
    this._fn = fn;
    this._startTime = startTime;
    this._interval = interval;
    this._running = true;
}

/**
 * Retrieves the start time of the timer.
 *
 * @return {Number}
 */
Timer.prototype.startTime = function () {
    return this._startTime;
};

/**
 * Retrieves the interval in milliseconds between executions.
 *
 * @return {Number}
 */
Timer.prototype.interval = function () {
    return this._interval;
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
 * @return {Boolean}
 */
Timer.prototype.stop = function () {
    this._running = false;
};

/**
 * Executes the timer function.
 *
 * @return {Boolean}
 */
Timer.prototype.run = function () {
    this._fn.call(this, this);
};

/**
 * Retrieves the time of the next execution on or after a given time.
 *
 * @return {Boolean}
 */
Timer.prototype.until = function (t) {
    if (!this.running()) {
        return null;
    }

    // If we haven't reached the start time then the next execution
    // is the start time.
    if (this._startTime > t) {
        return this._startTime;
    }

    // If t is on an interval then return it.
    var offset = t - this.startTime;
    if (offset % this._interval === 0) {
        return t;
    }

    // Otherwise find the next interval that occurs immediately after t.
    return this._startTime + ((Math.floor(offset / this._interval) + 1) * this._interval);
};

module.exports = Timer;
