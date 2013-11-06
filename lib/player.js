
"use strict";
/*jslint browser: true, nomen: true*/

var Frame    = require('./frame'),
    is       = require('is'),
    nextTick = require('next-tick'),
    periodic = require('periodic');

/**
 * Initializes a new Player instance.
 */
function Player() {
    this._rate = 0;
    this._frames = [];
    this._prevtick = null;
    this._ticker = null;
}

/**
 * Sets or retrieves the playback rate of the player. This is the rate
 * at which the current frame playhead is moved forward in relation to
 * the wall clock.
 *
 * @return {Player|int}
 */
Player.prototype.rate = function (value) {
    if (arguments.length === 0) {
        return this._rate;
    }
    this._rate = Math.max(0, value);

    // Manage the ticker.
    var self = this,
        prevtick = new Date();
    if (this._rate > 0 && this._ticker === null) {
        this.tick(0);
        this._ticker = periodic(100).on('tick', function () {
            var t = new Date();
            self.tick(self.rate() * (t.valueOf() - prevtick.valueOf()));
            prevtick = t;
        });
    } else if (this._rate === 0 && this._ticker !== null) {
        self.tick(self.rate() * ((new Date()).valueOf() - prevtick.valueOf()));
        this._ticker.end();
    }

    return this;
};

/**
 * Starts the player.
 *
 * @return {Player}
 */
Player.prototype.play = function () {
    this.rate(1);
    return this;
};

/**
 * Stops the player.
 *
 * @return {Player}
 */
Player.prototype.pause = function () {
    this.rate(0);
    return this;
};

/**
 * Returns a flag stating if the playhead is moving.
 *
 * @return {Boolean}
 */
Player.prototype.playing = function () {
    return (this.rate() !== 0);
};

/**
 * Updates the playhead of the current frame based on the elapsed time
 * and playback rate. The elapsed time argument is in player-time.
 */
Player.prototype.tick = function (elapsed) {
    // TODO: Move playhead on current frame.
};


module.exports = Player;
