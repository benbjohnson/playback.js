
"use strict";
/*jslint browser: true, nomen: true*/
/*global d3*/

var is = require('is');

var MAX_INT = 9007199254740992;

/**
 * Initializes a new Player instance.
 */
function Player(selector) {
    this.selector(selector);
    this._playing = true;
}

/**
 * Sets or retrieves the CSS selector used to retrieve managed elements.
 *
 * @param {String} selector (optional)
 * @return {Player|String}
 */
Player.prototype.selector = function (value) {
    if (arguments.length === 0) {
        return this._selector;
    }
    this._selector = value;
    return this;
};

/**
 * Returns a flag stating if the player is currently playing.
 *
 * @return {Boolean}
 */
Player.prototype.playing = function () {
    return this._playing;
};

/**
 * Changes the state of the player to "playing".
 */
Player.prototype.play = function () {
    this._playing = true;
};

/**
 * Pauses all managed D3 transitions.
 */
Player.prototype.pause = function () {
    this._playing = false;
    this.update();
};

/**
 * Manages element transitions. If the player is paused, all transitions
 * are paused. This should be called immediately after an update on the
 * visualization.
 *
 * @param {Array} selection
 */
Player.prototype.update = function () {
    var self = this;

    d3.timer(function () {
        // Ignore update if the player is playing or the selector is empty.
        if (self.playing() || self.selector() === undefined) {
            return true;
        }

        var selection = d3.selectAll(self.selector());
        selection.each(function (element) {
            if (this.__transition__ !== undefined) {
                this.__transition__.active = MAX_INT;
            }
        });

        return true;
    });
};


module.exports = Player;

Player.VERSION = Player.prototype.VERSION = '0.0.1';

