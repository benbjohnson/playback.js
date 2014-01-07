
"use strict";
/*jslint browser: true, nomen: true*/

var DataObject = require('./data_object'),
    Layout = require('./layout'),
    Model  = require('./model'),
    Player = require('./player'),
    Set    = require('./set');

/**
 * Initializes a new Playback instance.
 */
function Playback() {
}

Playback.prototype.DataObject = DataObject;
Playback.prototype.Layout     = Layout;
Playback.prototype.Model      = Model;
Playback.prototype.Player     = Player;
Playback.prototype.Set        = Set;

/**
 * Creates a new player.
 */
Playback.prototype.player = function () {
    return new Player();
};

module.exports = Playback;

Playback.VERSION = Playback.prototype.VERSION = '0.1.2';

