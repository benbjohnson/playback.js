
"use strict";
/*jslint browser: true, nomen: true*/

var EventDispatcher = require('./event_dispatcher'),
    Event           = require('./event'),
    Frame           = require('./frame'),
    is              = require('is'),
    nextTick        = require('next-tick'),
    periodic        = require('periodic');

/**
 * Initializes a new Player instance.
 */
function Player() {
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
        frame.player(this);
        this._frames.push(frame);
        if (this.current() === null) {
            this.currentIndex(0);
        }
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
        model = (this.frame(value - 1) !== null ? this.frame(value - 1).model() : this.model());
        if (model !== null) {
            model = model.clone();
        }

        // End previous frame.
        if (this.current() !== null) {
            this.current().end();
        }

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
    this._model = value;

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
 * and playback rate. The elapsed time argument is in player-time.
 */
Player.prototype.tick = function (elapsed) {
    var frame = this.current();
    if (frame === null) {
        return;
    }
    frame.playhead(frame.playhead() + elapsed);
    this.dispatchEvent(new Event("tick"));
};

module.exports = Player;
