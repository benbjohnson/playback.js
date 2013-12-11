
"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Initializes a new Model instance.
 */
function Model() {
    this._player = null;
}

/**
 * Sets or retrieves the player the model is attached to.
 *
 * @return {Model|Player}
 */
Model.prototype.player = function (value) {
    if (arguments.length === 0) {
        return this._player;
    }
    this._player = value;
    return this;
};

/**
 * Retrieves the current frame.
 *
 * @return {Frame}
 */
Model.prototype.frame = function () {
    return (this.player() !== null ? this.player().current() : null);
};

/**
 * Retrieves the playhead of the current frame.
 *
 * @return {Number}
 */
Model.prototype.playhead = function () {
    if (this.player() !== null && this.player().current() !== null) {
        return this.player().current().playhead();
    }
    return null;
};

/**
 * Clones the current state of the model.
 */
Model.prototype.clone = function () {
    return this;
};

module.exports = Model;
