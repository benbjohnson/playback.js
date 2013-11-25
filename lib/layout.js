
"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Initializes a new Layout instance.
 */
function Layout() {
    this._player = null;
}

/**
 * Initializes the layout. This is called when the player is set on
 * the layout.
 */
Layout.prototype.initialize = function () {
    // Implemented by subclass.
};

/**
 * Redraws the layout.
 */
Layout.prototype.invalidate = function () {
    // Implemented by subclass.
};

/**
 * Updates the layout to the new window size.
 */
Layout.prototype.invalidateSize = function () {
    // Implemented by subclass.
};

/**
 * Sets or retrieves the player associated with the layout.
 *
 * @return {Player|Layout}
 */
Layout.prototype.player = function (value) {
    if (arguments.length === 0) {
        return this._player;
    }
    this._player = value;
    this.initialize();
    this.invalidateSize();
    return this;
};

/**
 * Retrieves the current frame on the player.
 *
 * @return {Frame}
 */
Layout.prototype.current = function () {
    var player = this.player();
    if (player === null) {
        return null;
    }
    return player.current();
};

/**
 * Retrieves the current frame's model.
 *
 * @return {Model}
 */
Layout.prototype.model = function () {
    var current = this.current();
    if (current === null) {
        return null;
    }
    return current.model();
};

module.exports = Layout;
