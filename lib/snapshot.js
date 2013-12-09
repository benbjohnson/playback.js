
"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Initializes a new Snapshot instance.
 */
function Snapshot(frame) {
    var i, timers;
    this._playhead = frame.playhead();
    this._model = frame.model().clone();
    this._timers = [];

    timers = frame.timers();
    for (i = 0; i < timers.length; i += 1) {
        this._timers.push(timers[i].clone());
    }
}

/**
 * Returns the playhead of the snapshot.
 *
 * @return {Number}
 */
Snapshot.prototype.playhead = function () {
    return this._playhead;
};

/**
 * Returns a clone of the model of the snapshot.
 *
 * @return {Model}
 */
Snapshot.prototype.model = function () {
    return this._model.clone();
};

/**
 * Returns the timers at the time of the snapshot.
 *
 * @return {Array}
 */
Snapshot.prototype.timers = function () {
    var i, timers = [];
    for (i = 0; i < this._timers.length; i += 1) {
        timers.push(this._timers[i].clone());
    }
    return timers;
};

module.exports = Snapshot;
