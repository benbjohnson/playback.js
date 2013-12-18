
"use strict";
/*jslint browser: true, nomen: true*/

var EventDispatcher = require('./event_dispatcher');

/**
 * Initializes a new DataObject instance.
 */
function DataObject(model) {
    this._model = (model !== undefined ? model : null);
}

DataObject.prototype = new EventDispatcher();
DataObject.prototype.constructor = DataObject;

/**
 * Sets or retrieves the model that the data object belongs to.
 *
 * @return {DataObject|Model}
 */
DataObject.prototype.model = function (value) {
    if (arguments.length === 0) {
        return this._model;
    }
    this._model = value;
    return this;
};

/**
 * Retrieves the player.
 *
 * @return {Player}
 */
DataObject.prototype.player = function () {
    return (this._model !== null ? this._model.player() : null);
};


/**
 * Retrieves the current frame.
 *
 * @return {Frame}
 */
DataObject.prototype.frame = function () {
    return (this._model !== null ? this._model.frame() : null);
};

module.exports = DataObject;
