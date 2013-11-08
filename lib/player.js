
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
    this._model = null;
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
Player.prototype.frame = function (value) {
    var frame;
    if (is.number(value)) {
        if (value >= 0 && value < this._frames.length) {
            return this._frames[value];
        }
        return null;
    }

    if (is.fn(value)) {
        frame = new Frame(value);
        this._frames.push(frame);
        this.currentIndex(0, true);
        return this;
    }

    throw "Player.frame() invalid argument: " + value;
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
 * Sets or retrieves the current frame.
 *
 * @return {Player|Frame}
 */
Player.prototype.current = function (value) {
    if (arguments.length === 0) {
        if (this._frames.length === 0) {
            return null;
        }
        return this._frames[this._currentIndex];
    }

    // Find the index of the frame and set it.
    var index = this._frames.indexOf(value);
    if (index !== -1) {
        this.currentIndex(index);
    }
    return this;
};

/**
 * Sets or retrieves the current frame index.
 *
 * @return {Player|Number}
 */
Player.prototype.currentIndex = function (value, force) {
    var frame;

    if (arguments.length === 0) {
        return this._currentIndex;
    }

    // Move to new frame and initialize it.
    if (value >= 0 && value < this._frames.length) {
        if (value !== this._currentIndex || force) {
            this._currentIndex = value;
            frame = this._frames[value];
            frame.model(this.model());
            frame.init();
        }
    }
    return this;
};

/**
 * Moves to the next frame.
 *
 * @return {Player}
 */
Player.prototype.next = function () {
    this.currentIndex(this.currentIndex() + 1);
    return this;
};

/**
 * Moves to the previous frame.
 *
 * @return {Player}
 */
Player.prototype.prev = function () {
    this.currentIndex(this.currentIndex() - 1);
    return this;
};

/**
 * Sets or retrieves the initial player data model.
 *
 * @return {Player|Object}
 */
Player.prototype.model = function (value) {
    if (arguments.length === 0) {
        return this._model;
    }
    this._model = value;
    return this;
};

/**
 * Updates the player and issues the 'update' callback. This is called
 * whenever the playhead is changed.
 *
 * @return {Player}
 */
Player.prototype.update = function () {
    if (is.fn(this.onupdate())) {
        this.onupdate().call(this, this);
    }
    return this;
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
    this.update();
};

/**
 * Sets or retrieves the callback function that executes whenever the
 * playhead is updated.
 *
 * @return {Function|Player}
 */
Player.prototype.onupdate = function (fn) {
    if (arguments.length === 0) {
        return this._onupdate;
    }
    this._onupdate = fn;
    return this;
};

module.exports = Player;
