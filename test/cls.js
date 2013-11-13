/*global describe:false, it:false*/
'use strict';

var express = require('express'),
    assert = require('chai').assert,
    request = require('supertest'),
    _cls = require('continuation-local-storage'),
    cls = require('../index');


describe('cls', function () {

    var app = express();

    function read() {
        var context = cls.getRequestContext();
        return context.get('foo');
    }

    it('should register middleware', function () {
        app.use(cls.middleware());
    });


    it('should add a getContext method', function (done) {
        app.get('/', function (req, res) {
            var context;

            assert.isFunction(req.getContext);
            context = req.getContext();

            assert.isFunction(context.get);
            assert.isFunction(context.set);
            res.send(200);
        });

        request(app)
            .get('/')
            .expect(200)
            .end(done);
    });


    it('should not support context outside requests', function () {
        var context, error;

        context = cls.getRequestContext();
        assert.isUndefined(context);

        try {
            // Should throw in this context.
            read();
        } catch (err) {
            error = err;
        } finally {
            assert.isObject(error);
        }
    });


    it('should support getRequestContext', function (done) {
        app.get('/context', function (req, res) {
            var context;
            context = req.getContext();
            context.set('foo', 'bar');

            res.send(200, read());
        });

        request(app)
            .get('/context')
            .expect(200, 'bar')
            .end(done);
    });


    it('should support async getRequestContext', function (done) {
        app.get('/contextAsync', function (req, res) {
            var context;
            context = req.getContext();
            context.set('foo', 'bar');

            setImmediate(function () {
                res.send(200, read());
            });
        });

        request(app)
            .get('/contextAsync')
            .expect(200, 'bar')
            .end(done);
    });


    it('should return correct context', function (done) {
        app.get('/nestedContext', function (req, res) {
            var ns, active;

            ns = _cls.getNamespace(Object.keys(process.namespaces)[0]);
            active = ns.active;

            ns.run(function () {
                var context;
                context = req.getContext();
                context.set('foo', 'bar');

                assert.notStrictEqual(active, ns.active);
                assert.strictEqual(context.get('foo'), active.foo);

                setImmediate(function () {
                    res.send(200, read());
                });
            });
        });

        request(app)
            .get('/nestedContext')
            .expect(200, 'bar')
            .end(done);

    });
});