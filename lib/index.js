
"use strict";
/*jslint browser: true, nomen: true*/

var Player = require('./Player'),
    bind = require('bind');

module.exports = new Player();

bind(module.exports, module.exports.initialize);
