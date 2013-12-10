
"use strict";
/*jslint browser: true, nomen: true*/
/*global window*/

var EventDispatcher = require('./event_dispatcher'),
    Event           = require('./event'),
    Frame           = require('./frame'),
    is              = require('is'),
    periodic        = require('periodic'),
    _               = require('./raf'),
    MAX_DELTA       = 50;

/**
 * Initializes a new Player instance.
 */
function Player() {
    var self = this,
        animationFrame;

    EventDispatcher.call(this);

    this._rate = 0;
    this._currentIndex = -1;
    this._frames = [];
    this._prevtick = null;
    this._ticker = null;
    this._model = null;
    this._layout = null;

    this._resizeable = false;
    this._resizeableInitialized = false;
    this._sysresizehandler = null;

    // Setup animation timer.
    animationFrame = function () {
        self.tick();
        window.requestAnimationFrame(animationFrame);
    };
    this._rAFID = window.requestAnimationFrame(animationFrame);
}

Player.prototype = new EventDispatcher();
Player.prototype.constructor = Player;

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
    if (this._rate > 0 && this._ticker === null) {
        this.tick(0);
    } else if (this._rate === 0 && this._ticker !== null) {
        this.tick(this.rate() * ((new Date()).valueOf() - this._prevtick.valueOf()));
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
 * Pauses the player.
 *
 * @return {Player}
 */
Player.prototype.pause = function () {
    this.rate(0);
    return this;
};

/**
 * Stops the player completely. Player cannot be restarted.
 *
 * @return {Player}
 */
Player.prototype.stop = function () {
    this.pause(0);
    window.cancelAnimationFrame(this._rAFID);
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
 * @param {String|Number}
 * @param {String}
 * @param {Function}
 * @return {Player}
 */
Player.prototype.frame = function (id, title, fn) {
    var i, frame;
    if (arguments.length === 0) {
        throw new Error("Expected 1 or 3 arguments");
    }

    if (arguments.length === 1) {
        // Look up by index.
        if (is.number(id)) {
            if (id >= 0 && id < this._frames.length) {
                return this._frames[id];
            }
            return null;
        }

        // Look up by id.
        for (i = 0; i < this._frames.length; i += 1) {
            if (id === this._frames[i].id()) {
                return this._frames[i];
            }
        }
        return null;
    }

    // Create new frame.
    frame = new Frame(id, title, fn);
    frame.player(this);
    this._frames.push(frame);
    if (this.current() === null) {
        this.currentIndex(0);
    }
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
 * Sets or retrieves the current frame.
 *
 * @return {Player|Frame}
 */
Player.prototype.current = function (value) {
    if (arguments.length === 0) {
        if (this.currentIndex() === -1 || this.frames().length === 0) {
            return null;
        }
        return this.frames()[this._currentIndex];
    }

    // Find the index of the frame and set it.
    var index = this.frames().indexOf(value);
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
Player.prototype.currentIndex = function (value) {
    var frame, model;

    if (arguments.length === 0) {
        return this._currentIndex;
    }

    // Don't allow initialization if we don't have a model.
    if (this._currentIndex === -1 && this.model() === null) {
        return this;
    }

    // Move to new frame and initialize it.
    if (value >= 0 && value < this._frames.length && value !== this._currentIndex) {
        // End previous frame.
        if (this.current() !== null) {
            this.current().end();
        }

        model = this.model().clone();

        this._currentIndex = value;
        frame = this._frames[value];
        frame.model(model);
        frame.init();
        this.dispatchEvent(new Event("framechange"));
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

    if (this._model !== null) {
        this._model.player(null);
    }

    this._model = value;

    if (this._model !== null) {
        this._model.player(this);
    }

    // Initialize first frame now that we have a model.
    if (this.current() === null) {
        this.currentIndex(0);
    }

    return this;
};

/**
 * Sets or retrieves the layout.
 *
 * @return {Player|Layout}
 */
Player.prototype.layout = function (value) {
    if (arguments.length === 0) {
        return this._layout;
    }

    if (this._layout !== null) {
        this._layout.player(null);
    }

    this._layout = value;

    if (this._layout !== null) {
        this._layout.player(this);
    }

    return this;
};

/**
 * Sets up handlers that invoke layout invalidation on window resize.
 */
Player.prototype.resizeable = function (value) {
    var self = this;

    if (arguments.length === 0) {
        return this._resizeable;
    }

    // Set up a handler that we can swap our internal handler out of.
    if (value && !this._resizeableInitialized) {
        this._resizeableInitialized = true;
        this._sysresizehandler = window.onresize;
        window.onresize = function () {
            if (is.fn(self._sysresizehandler)) {
                self._sysresizehandler.apply(null, arguments);
            }
            if (self._resizeable) {
                self.resize();
            }
        };
    }

    this._resizeable = value;

    return this;
};

/**
 * Invalidates the size of the layout.
 */
Player.prototype.resize = function () {
    if (this.layout() !== null) {
        this.layout().invalidateSize();
    }
};

/**
 * Updates the playhead of the current frame based on the elapsed time
 * and playback rate.
 */
Player.prototype.tick = function () {
    var frame = this.current(),
        t = new Date(),
        prevtick = (this._prevtick !== null ? this._prevtick : t),
        delta = Math.min(MAX_DELTA, (t.valueOf() - prevtick.valueOf())),
        elapsed = this.rate() * delta;

    if (frame !== null) {
        frame.playhead(frame.playhead() + elapsed);
        this.dispatchEvent(new Event("tick"));
    }

    this._prevtick = t;
};

module.exports = Player;
