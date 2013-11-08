'use strict';

var cls = require('continuation-local-storage');


exports.middleware = function () {
    var outer = cls.createNamespace('request');

    return function (req, res, next) {
        outer.run(function () {
            // XXX - `outer` behaves differently in this scope
            // from how it behaves in the outer *chuckle* scope.
            req.getLocal = outer.get.bind(outer);
            req.setLocal = outer.set.bind(outer);
            next();
        });
    };
};


exports.getRequestContext = function () {
    var ns, context;

    ns = cls.getNamespace('request');
    context = ns.active;

    return {
        get: function (key) {
            return context[key];
        },
        set: function (key, value) {
            return context[key] = value;
        }
    };
};