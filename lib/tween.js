
"use strict";
/*jslint browser: true, nomen: true*/

var ease    = require('./ease'),
    functor = require('./functor'),
    is      = require('is');

/**
 * Initializes a new Tween instance.
 */
function Tween(startValue, endValue, startTime, endTime) {
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

module.exports = Tween;
