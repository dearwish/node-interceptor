HTTP & HTTPS request interceptor that allows to define which fixture (JSON object) to return for each request, inspired by [jQuery.fixture][3], [thegreatape/fakeweb][1] and [ppcano/fixtures][2].

# Installation

    npm install node-interceptor

# Testing

    git clone git://github.com/dearwish/node-interceptor.git
    cd node-interceptor
    npm install
    npm test

# Examples

Catch requests to test.com with uri "/foo":

    var interceptor = require('interceptor'),
        http = require('http'),
        https = require('https');

    http.register_intercept({
        uri: '/foo', 
        host: 'test.com',
        body: 'I am the mocked-out body!'
    })

    http.request({uri: "/foo", host: "test.com"}, function(response){
        // ...
    })

HTTPS interceptors are registered in the same way:

    https.register_intercept({
        uri: '/foo', 
        host: 'test.com',
        body: 'I am the mocked-out body!'
    })

    https.request({uri: "/foo", host: "test.com"}, function(response){
        // ...
    })

You can match request properties with regular expressions:

    http.register_intercept({uri: /page\d+/, body: 'intercepted body'})

You can also provide the list of headers to the interceptor and they will be deep compared with the actual request headers:

    https.register_intercept({
	headers: {'Content-Type': 'application/json'},
	uri: '/foo', 
        host: 'test.com',
        body: 'I am the mocked-out body!'
    })

    https.request({
    	headers: {'Content-Type': 'application/json'},
	uri: "/foo",
	host: "test.com" }, function(response){
        // ...
    })

Unregister rules as following:

    http.register_intercept({uri: '/page3', body: 'intercepted body'})
    // ...
    http.unregister_intercept({uri: '/page3', body: 'intercepted body'})

Clear the list of registered intercept rules:

    http.clear_intercepts()

Return custom HTTP headers to your response:

    http.register_intercept({
        uri: '/foo', 
        host: 'test.com',
        headers: {'Content-Type': 'application/json'},
        body: 'I am the mocked-out body!'
    })

node-interceptor also provides a nodeunit test case that resets the uri intercept list in between tests. See ```tests/suits/testcase.js``` for an example.

# Future enhancements

1. Add Connect-like url mapping (i.e. "/users/:id/edit").
2. Add fixtures integration - the body messages will be read from .js or .json file that reside in app fixtures directory. Inspired by [ppcano's fixtures][2].
3. Add dynamic fixtures similar to [jQuery.fixture][3].

# License

MIT

[1]: https://github.com/thegreatape/node-fakeweb
[2]: https://github.com/ppcano/fixtures
[3]: http://javascriptmvc.com/docs.html#!jQuery.fixture