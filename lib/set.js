
"use strict";
/*jslint browser: true, nomen: true*/

var EventDispatcher = require('./event_dispatcher'),
    Event           = require('./event');

/**
 * A Set is a collection of unique objects where uniqueness is
 * determined by the "id" property.
 */
function Set() {
    EventDispatcher.call(this);
    this._elements = [];
}

Set.prototype = new EventDispatcher();
Set.prototype.constructor = Set;


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
    clone._elements = this._elements.map(function (element) { return element.clone(); });
    return clone;
};

module.exports = Set;
