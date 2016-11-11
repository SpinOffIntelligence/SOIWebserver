'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    fs = require('fs'),
    passport = require('passport'),
    loggercomp = require('./components/logger.js'),
//    sfdccomp =  require('./components/jsforce.js'),
    mongo =  require('./components/mongo.js'),
    path = require('path'),
    apncomp =  require('./components/apn.js'),
    apn = require('apn'),
    OrientDB = require('orientjs');




/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// Set the node enviornment variable if not set before
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Initializing system variables 
var config = require('./config/config'),
    mongoose = require('mongoose');

var options = { cert: 'config/cert.pem', key: 'config/key.pem'};
var apnConnection = new apn.Connection(options);

// Bootstrap db connection
var db = mongo.init();

// Init APN
apncomp.init();

// Bootstrap models
var models_path = __dirname + '/app/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

// Bootstrap passport config
require('./config/passport')(passport);

var app = express();

// Express settings
require('./config/express')(app, passport, db);

// Bootstrap routes
var routes_path = __dirname + '/app/routes';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath)(app, passport, logger);
            }
        // We skip the app/routes/middlewares directory as it is meant to be
        // used and shared by routes as further middlewares and is not a 
        // route by itself
        } else if (stat.isDirectory() && file !== 'middlewares') {
            walk(newPath);
        }
    });
};
walk(routes_path);

require('./config/routes.js')(app, express);

// Start the app by listening on <port>
var port = process.env.PORT || config.port;
app.listen(port);
//console.log('Express app started on port ' + port);

// Initializing logger
var logger = loggercomp.init(app, passport, mongoose);

// Initialize SFDC Connection
//sfdccomp.init(function(err, res) {
//    console.log('sfdccomp.init done:' + err + ':' + res);    
//});

console.log('**********************');

var server = OrientDB({
   host:       'ec2-35-162-142-38.us-west-2.compute.amazonaws.com',
   port:       2424,
   username:   'root',
   password:   '9WlcEMvyBJqKToMWO4vvqrgRx7iuzKuf'
});

console.log('Server');
console.dir(server);

var db = server.use({
   name:     'SPINOFFINTELLIGENCE',
   username: 'admin',
   password: 'admin'
});

console.log('db');
console.dir(db);


var dbs = server.list()
   .then(
      function(list){
         console.log('Databases on Server:', list.length);
      }
   );

logger.log('Express app started on port ' + port);

// Expose app
exports = module.exports = app;
