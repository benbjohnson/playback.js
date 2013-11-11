
"use strict";
/*jslint browser: true, nomen: true*/

function ease(name) {
    switch (name) {
    case "linear":
        return ease.linear;
    }
}

function linear(t) {
    return t;
}

ease.linear = linear;

module.exports = ease;
