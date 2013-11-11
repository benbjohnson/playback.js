
"use strict";
/*jslint browser: true, nomen: true*/

var ease    = require('./ease'),
    functor = require('./functor'),
    is      = require('is');

/**
 * Initializes a new Tween instance.
 */
function Tween(fn, startValue, endValue, startTime, endTime) {
    if (!is.fn(fn)) {
        fn = null;
    }
    this._fn = fn;
    this._startValue = functor(startValue);
    this._endValue = functor(endValue);
    this._startTime = startTime;
    this._endTime = Math.max(startTime, endTime);
    this._ease = ease.linear;
}

/**
 * Retrieves the tween start time.
 *
 * @return {Number}
 */
Tween.prototype.startTime = function () {
    return this._startTime;
};

/**
 * Retrieves the tween end time.
 *
 * @return {Number}
 */
Tween.prototype.endTime = function () {
    return this._endTime;
};

/**
 * Retrieves the tween start value.
 *
 * @return {Number}
 */
Tween.prototype.startValue = function () {
    return this._startValue();
};

/**
 * Retrieves the tween end value.
 *
 * @return {Number}
 */
Tween.prototype.endValue = function () {
    return this._endValue();
};

/**
 * Sets or retrieves the easing function used by the tween.
 *
 * @return {Number}
 */
Tween.prototype.ease = function (value) {
    if (arguments.length === 0) {
        return this._ease;
    }
    if (is.fn(value)) {
        this._ease = value;
    } else {
        this._ease = ease(value);
    }
    return this;
};

/**
 * Retrieves the value at a given point in time.
 *
 * @return {Number}
 */
Tween.prototype.value = function (t) {
    var startValue = this.startValue(),
        endValue = this.endValue(),
        startTime = this.startTime(),
        endTime = this.endTime(),
        delta = endValue - startValue;
    if (startTime === endTime) {
        return endValue;
    }
    return delta * this._ease(Math.max(0, Math.min(1, (t - startTime) / (endTime - startTime))));
};

/**
 * Executes the function associated with the tween at a given time.
 * Returns the result of the function. The function is not called if t
 * is before the start time.
 *
 * @return {Object}
 */
Tween.prototype.update = function (t) {
    if (this._fn === null || t < this.startTime()) {
        return null;
    }
    return this._fn.call(this, this.value(t));
};

module.exports = Tween;
