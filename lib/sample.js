'use strict';

var cls = require('./cls');


exports.doSomething = function (callback) {
    var context = cls.getRequestContext();
    setImmediate(callback, null, context.get('user'));
};


exports.doSomethingSync = function () {
    var context = cls.getRequestContext();
    return context.get('user');
};