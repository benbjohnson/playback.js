
"use strict";
/*jslint browser: true, nomen: true*/

var is = require('is');

/**
 * Initializes a new Player instance.
 */
function Player() {
    this._playhead = 0;
    this._playing = false;
}

/**
 * Returns a flag stating if the player is currently playing.
 *
 * @return {Boolean}
 */
Player.prototype.playing = function () {
    return this._playing;
};

/**
 * Starts the player.
 */
Player.prototype.play = function () {
    this._playing = true;
};

/**
 * Stops the player.
 */
Player.prototype.pause = function () {
    this._playing = false;
};


module.exports = Player;
