
"use strict";
/*jslint browser: true, nomen: true*/

var Player = require('./player'),
    Layout = require('./layout'),
    Model  = require('./model'),
    Set    = require('./set');

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

/**
 * Retrieves the model superclass.
 */
Playback.prototype.model = function () {
    return new Model();
};

/**
 * Retrieves a set instance.
 */
Playback.prototype.set = function (clazz) {
    return new Set(clazz);
};

module.exports = Playback;

Playback.VERSION = Playback.prototype.VERSION = '0.0.1';

