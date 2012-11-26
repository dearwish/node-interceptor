var http = require('http'),
    https = require('https'),
    events = require('events'),
    util = require('util'),
    deepEqual = require('deep-equal');

var intercept_rules = [];

function match_rule(options){
    var matched_rule;
    intercept_rules.forEach(function(rule){
        var keys = Object.keys(rule),
            match = false,
            found = true;
        keys.forEach(function(key){
            if(options[key]) { 
                if(rule[key] instanceof RegExp){
                    match = rule[key].test(options[key]);
                } else if (_isObject(options[key])) {
                    match = deepEqual(options[key], rule[key]);
                } else {
                    match = options[key] == rule[key];
                }
                found = found && match;
            }
        });
        if(found){
            matched_rule = rule;
        }
    });
    return matched_rule;
}

// Is a given variable an object?
_isObject = function(obj) {
    return obj === Object(obj);
};

https.register_intercept = http.register_intercept = function(options){
    intercept_rules.push(options);
};

https.unregister_intercept = http.unregister_intercept = function(options){
    intercept_rules.forEach(function(rule, i){
        var equal = true; 
        Object.keys(rule).forEach(function(k){
            if(rule[k] != options[k]){
                equal = false;
            }
        });
        if(equal){
            intercept_rules.splice(i, 1);
        }       
    });
};

https.clear_intercepts = http.clear_intercepts = function(){
    intercept_rules = [];
};

https.get_intercepts = http.get_intercepts = function(){
    return intercept_rules;
};

// wrap http.request with interceptor function
var old_request = http.request;
http.request = function(options, callback){
    var rule = match_rule(options);
    if(rule){
        var res = new events.EventEmitter();
        res.headers = rule.headers || {'Content-Type': 'text/html'};
        return {end: function(){ 
            callback(res);
            res.emit('data', rule.body || '');
            res.emit('end');
            } 
        };
    } else {
        return old_request.call(http, options, callback);
    }
};

// wrap https.request with interceptor function
var old_https_request = https.request;
https.request = function(options, callback){
    var rule = match_rule(options);
    if(rule){
        var res = new events.EventEmitter();
        res.headers = rule.headers || {'Content-Type': 'text/html'};
        return {end: function(){ 
            callback(res);
            res.emit('data', rule.body || '');
            res.emit('end');
            } 
        };
    } else {
        return old_https_request.call(https, options, callback);
    }
};

var fakewebTestCase = function(cases){
    var tearDown = function(cb){
        http.clear_intercepts();
        https.clear_intercepts();
        cb();
    };
    if(cases.tearDown){
        var old = cases.tearDown;
        cases.tearDown = function(done){ 
            var self = this;
            tearDown.call(self, function(){
                old.call(self, done);
            });
        }
    } else {
        cases.tearDown = tearDown;
    }
    return nodeunit.testCase.call(this, cases);
};
util.inherits(fakewebTestCase, nodeunit.testCase);
module.exports.testCase = fakewebTestCase;
