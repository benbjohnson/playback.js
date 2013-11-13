
"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Initializes a new Layout instance.
 */
function Layout() {
    this._player = null;
}

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
    return this;
};

/**
 * Retrieves the current frame on the player.
 *
 * @return {Frame}
 */
Layout.prototype.current = function () {
    if (this.player() === null) {
        throw "Player not set on layout";
    }
    return this.player().current();
};

/**
 * Retrieves the current frame's model.
 *
 * @return {Model}
 */
Layout.prototype.model = function () {
    return this.current().model();
};

module.exports = Layout;
