##### Continuation Local Storage Testing

Demo of cls with express using middleware that creates a context for use during a
request as well as exposing it to code executed within the same continuation context.

```bash
$ npm install
$ node .
```

##### API

`cls.middleware()`
Creates express middleware, adding `getContext()` to the request.


`cls.getRequestContext()`
Provided the currently executing code is within the request continuation, will return the request context,
which is an object with methods `get(key)` and `set(key, value)`.


##### Sample

```javascript
var http = require('http'),
    express = require('express'),
    cls = require('../');


function doWork(callback) {
    setImmediate(function () {
        var context = cls.getRequestContext();
        callback(null, 'Hello, ' + context.get('name') + '!');
    });
}


var app = express();
app.use(cls.middleware());
app.get('/', function (req, res) {
    var context = req.getContext();
    context.set('name', 'world');

    doWork(function (err, data) {
        if (err) return res.send(err);
        res.send(200, data);
    });
});


http.createServer(app).listen(8000);
```