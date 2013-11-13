
"use strict";
/*jslint browser: true, nomen: true*/

var Player = require('./player');

/**
 * Initializes a new Playback instance.
 */
function Playback() {
}

/**
 * Creates a new player.
 */
Playback.prototype.player = function () {
    return new Player();
};

module.exports = Playback;

Playback.VERSION = Playback.prototype.VERSION = '0.0.1';

