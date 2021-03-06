'use strict';

var http = require('http'),
    assert = require('assert'),
    express = require('express'),
    cls = require('./../index');

var app = express();

// Set up the local storage context
app.use(cls.middleware());

// Faux `user` middleware
app.use(function (req, res, next) {
    var context, user;

    user = {
        first_name: 'Call',
        middle_name: 'me',
        last_name: 'maybe',
        create_ts: Date.now()
    };

    context = req.getContext();
    context.set('user', user);
    next();
});


app.get('/', function (req, res) {
    var context, userA, userB;

    context = req.getContext();
    userA = context.get('user');
    userB = doSomethingSync();

    doSomething(function (err, userC) {
        if (err) {
            res.send(err);
            return;
        }

        assert.strictEqual(userA, userB);
        assert.strictEqual(userB, userC);
        res.json(userC);
    });
});


http.createServer(app).listen(8000, function () {
    assert.ok(!cls.getRequestContext(), 'Request context defined outside request.');
});



function doSomething(callback) {
    setImmediate(function () {
        var context = cls.getRequestContext();
        callback(null, context.get('user'));
    });
}


function doSomethingSync() {
    var context = cls.getRequestContext();
    return context.get('user');
}