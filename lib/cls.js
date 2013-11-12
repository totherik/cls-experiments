'use strict';

var uuid = require('node-uuid'),
    cls = require('continuation-local-storage');


var REQUEST_NS = uuid.v4();
var rootContext;


function create(context) {
    return Object.freeze({
        get: function (key) {
            return context[key];
        },
        set: function (key, value) {
            return context[key] = value;
        }
    });
}


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
        ns.bindEmitter(req);
        ns.bindEmitter(res);
        ns.run(function (context) {
            context = create(context);
            req.getContext = function () {
                return context;
            };
            next();
        });
    };
};


exports.getRequestContext = function () {
    var ns, parent, context;

    // Ensure a NS has been configured (e.g. middleware is being used.)
    ns = cls.getNamespace(REQUEST_NS);
    if (!ns) {
        throw new Error('Request context not initialized.');
    }

    // We know the true request context is a direct descendant
    // of the root context, so traverse the prototype chain until
    // we find the first child. Now we know that no contexts have
    // been created along the way, hijacking request context.
    parent = ns.active;
    do {
        context = parent;
        parent = Object.getPrototypeOf(context);
    } while (parent && parent !== rootContext);

    // Return a cls-like API.
    return parent ? create(context) : undefined;
};