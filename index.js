'use strict';

var http = require('http'),
    assert = require('assert'),
    express = require('express'),
    cls = require('./lib/cls'),
    sample = require('./lib/sample');

require('webkit-devtools-agent');

var app = express();

// Set up the local storage context
app.use(cls.middleware());

// Faux `user` middleware
app.use(function (req, res, next) {
    var user = {
        first_name: 'Call',
        middle_name: 'me',
        last_name: 'maybe',
        create_ts: Date.now()
    };

    req.setLocal('user', user);
    next();
});

app.get('/', function (req, res) {
    var userA, userB;

    userA = req.getLocal('user');
    userB = sample.doSomethingSync();

    sample.doSomething(function (err, userC) {
        if (err) {
            res.send(err);
            return;
        }

        assert.strictEqual(userA, userB);
        assert.strictEqual(userB, userC);
        res.json(userC);
    });
});

http.createServer(app).listen(8000);