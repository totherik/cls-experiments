'use strict';

var cls = require('./cls');

exports.doSomething = function (callback) {
    setImmediate(function () {
        var context = cls.getRequestContext();
        callback(null, context.get('user'));
    });
};


exports.doSomethingSync = function () {
    var context = cls.getRequestContext();
    return context.get('user');
};