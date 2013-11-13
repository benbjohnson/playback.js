
"use strict";
/*jslint browser: true, nomen: true*/

var Player = require('./player'),
    Layout = require('./layout');

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

/**
 * Retrieves the layout superclass.
 */
Playback.prototype.layout = function () {
    return new Layout();
};

module.exports = Playback;

Playback.VERSION = Playback.prototype.VERSION = '0.0.1';

