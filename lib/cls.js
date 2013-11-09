'use strict';

var uuid = require('node-uuid'),
    cls = require('continuation-local-storage');


var REQUEST_NS = uuid.v4();
var rootContext;

exports.middleware = function () {
    var ns;

    // Defer creating the namespace until middleware is invoked.
    // If we create the namespace upon module (file) initialization
    // and refer to it from `getRequestContext` fn we would get
    // a faux "request" context and instead use global shared
    // state which is bad news.
    ns = cls.createNamespace(REQUEST_NS);
    rootContext = ns.active;

    return function (req, res, next) {
        ns.run(function () {
            // XXX - `ns` behaves differently in this scope
            // from how it behaves in the outer scope.
            req.getLocal = ns.get.bind(ns);
            req.setLocal = ns.set.bind(ns);
            next();
        });
    };
};


exports.getRequestContext = function () {
    var ns, context;

    // Ensure a NS has been configured (e.g. middleware is being used.)
    ns = cls.getNamespace(REQUEST_NS);
    if (!ns) {
        throw new Error('Request context not initialized.');
    }

    // Active context always exists, so we need to make sure
    // we're not using the root context at the very least. This
    // could happen if someone uses this API from code outside
    // a continuation within the current request.
    context = ns.active;
    if (context === rootContext) {
        return undefined;
    }

    // Return a cls-like API.
    return {
        get: function (key) {
            return context[key];
        },
        set: function (key, value) {
            return context[key] = value;
        }
    };
};
