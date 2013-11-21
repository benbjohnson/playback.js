
"use strict";
/*jslint browser: true, nomen: true*/

var EventDispatcher = require('./event_dispatcher'),
    Event           = require('./event'),
    is              = require('is');

/**
 * A Set is a collection of unique objects where uniqueness is
 * determined by the "id" property.
 */
function Set(clazz) {
    EventDispatcher.call(this);
    this.clazz(clazz);
    this._elements = [];
}

Set.prototype = new EventDispatcher();
Set.prototype.constructor = Set;


/**
 * Sets or retrieves the item class used for instantitation.
 *
 * @param {Function}
 * @return {Set|Function}
 */
Set.prototype.clazz = function (value) {
    if (arguments.length === 0) {
        return this._clazz;
    }
    this._clazz = (is.fn(value) ? value : null);
    return this;
};

/**
 * Creates a new instance of the set's class and adds it to the set.
 * The first parameter is passed to the class' constructor.
 *
 * @param {Number}
 * @return {Object}
 */
Set.prototype.create = function (id) {
    var element = this.find(id),
        clazz = this.clazz();

    if (clazz === null) {
        throw "Class not defined on Set. Unable to instantiate element.";
    }

    // Use existing element if possible.
    if (element !== null) {
        return element;
    }

    // Otherwise create a new element and add it.
    element = (new this._clazz(id));
    this.add(element);
    return element;
};

/**
 * Retrieves an element by id.
 *
 * @param {Number|String}
 * @return {Object}
 */
Set.prototype.find = function (id) {
    var i;
    for (i = 0; i < this._elements.length; i += 1) {
        if (this._elements[i].id === id) {
            return this._elements[i];
        }
    }
    return null;
};

/**
 * Checks for an existing element in the set with the same id.
 *
 * @param {Object}
 * @return {Boolean}
 */
Set.prototype.contains = function (element) {
    return (this.find(element.id) !== null);
};

/**
 * Adds an element to the set.
 *
 * @param {Object}
 * @return {Set}
 */
Set.prototype.add = function (element) {
    if (!this.contains(element)) {
        this._elements.push(element);
        this.dispatchEvent(new Event("change"));
    }
    return this;
};

/**
 * Removes an element from the set.
 *
 * @param {Object}
 * @return {Set}
 */
Set.prototype.remove = function (element) {
    var i;
    for (i = 0; i < this._elements.length; i += 1) {
        if (this._elements[i].id === element.id) {
            this._elements.splice(i, 1);
            this.dispatchEvent(new Event("change"));
            break;
        }
    }
    return this;
};

/**
 * Removes all elements from the set.
 *
 * @return {Set}
 */
Set.prototype.removeAll = function () {
    if (this._elements.length > 0) {
        this._elements = [];
        this.dispatchEvent(new Event("change"));
    }
    return this;
};

/**
 * Filters the set down based on a given filter function.
 *
 * @return {Set}
 */
Set.prototype.filter = function (fn) {
    this._elements = this._elements.filter(fn);
    this.dispatchEvent(new Event("change"));
    return this;
};


/**
 * Retrieves a list of all elements as an array.
 *
 * @return {Array}
 */
Set.prototype.toArray = function () {
    return this._elements.slice();
};

/**
 * Clones the set.
 *
 * @return {Set}
 */
Set.prototype.clone = function () {
    var i, clone = new Set();
    clone._clazz = this._clazz;
    clone._elements = this._elements.map(function (element) { return element.clone(); });
    return clone;
};

module.exports = Set;
