
"use strict";
/*jslint browser: true, nomen: true*/

function Event(type, value, prevValue) {
    this.type = type;
    this.target = null;
    this.value = value;
    this.prevValue = prevValue;
}

module.exports = Event;
