
"use strict";
/*jslint browser: true, nomen: true*/

var is = require('is');

function Player() {
    this._refresh = null;
}

/**
 * Sets or runs the refresh function. The function is executed immediately
 * after being set as well.
 */
Player.prototype.refresh = function (fn) {
    if (arguments.length > 0) {
        this._refresh = fn;
    }
    if (is.fn(this._refresh)) {
        this._refresh();
    }
};

module.exports = Player;

Player.VERSION = Player.prototype.VERSION = '0.0.1';

