
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
    this._currentIndex = 0;
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
 * Appends a new frame to the player.
 *
 * @return {Player}
 */
Player.prototype.frame = function (fn) {
    var frame = new Frame();
    this._frames.push(frame);
    fn.call(frame, frame);
    return this;
};

/**
 * Retrieves a list of all frames.
 *
 * @return {Array}
 */
Player.prototype.frames = function () {
    return this._frames.slice();
};

/**
 * Retrieves the current frame.
 *
 * @return {Array}
 */
Player.prototype.current = function () {
    if (this._frames.length === 0) {
        return null;
    }
    return this._frames[this._currentIndex];
};

/**
 * Moves to the next frame. If at the last frame then it will stay on
 * that frame. Return true if successful.
 *
 * @return {Boolean}
 */
Player.prototype.next = function () {
    if (this._currentIndex + 1 > this._frames.length - 1) {
        return false;
    }
    this._currentIndex += 1;
    return true;
};

/**
 * Moves to the previous frame. If at the first frame then it will stay on
 * that frame. Return true if successful.
 *
 * @return {Boolean}
 */
Player.prototype.prev = function () {
    if (this._currentIndex - 1 < 0) {
        return false;
    }
    this._currentIndex -= 1;
    return true;
};

/**
 * Updates the playhead of the current frame based on the elapsed time
 * and playback rate. The elapsed time argument is in player-time.
 */
Player.prototype.tick = function (elapsed) {
    var frame = this.current();
    if (frame === null) {
        return;
    }
    frame.playhead(frame.playhead() + elapsed);
};


module.exports = Player;
