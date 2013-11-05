
"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Initializes a new Frame instance.
 */
function Frame() {
    this._playhead = 0;
    this._duration = 0;
}

/**
 * Sets or retrieves the current playhead position. This is the
 * time elapsed in milliseconds for the frame.
 *
 * @return {Boolean}
 */
Frame.prototype.playhead = function (value) {
    if (arguments.length === 0) {
        return this._playhead;
    }
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


module.exports = Frame;
