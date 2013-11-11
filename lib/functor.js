
"use strict";
/*jslint browser: true, nomen: true*/

/**
 * Creates a function that returns v. If v is a function then it
 * is returned instead.
 *
 * @return {Function}
 */
function functor(v) {
    return typeof v === "function" ? v : function () {
        return v;
    };
}

module.exports = functor;

