
"use strict";
/*jslint browser: true, nomen: true*/

function Player() {
    this.initialized = false;
}

Player.prototype.initialize = function (options) {
    this.initialized = true;
};


module.exports = Player;

Player.VERSION = Player.prototype.VERSION = '0.0.1';

