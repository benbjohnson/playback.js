
"use strict";
/*jslint browser: true, nomen: true*/
/*global d3*/

var Player = require('./player');

d3.player = function (selector) {
    return new Player(selector);
};