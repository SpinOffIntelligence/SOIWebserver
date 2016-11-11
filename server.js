var OrientDB = require('orientjs');
var express = require('express');
var fs = require('fs');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./config/config');

var app = express();
require('./config/express')(app);

// Bootstrap routes
var routes_path = __dirname + '/app/routes';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath)(app);
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

var server = OrientDB({
   host:       'ec2-35-162-142-38.us-west-2.compute.amazonaws.com',
   port:       2424,
   username:   'root',
   password:   '9WlcEMvyBJqKToMWO4vvqrgRx7iuzKuf'
});

var dbs = server.list()
   .then(
      function(list){
         console.log('Databases on Server:', list.length);
      }
   );

var db = server.use({
   name:     'SpinOffIntelligence',
   username: 'admin',
   password: 'admin'
});

db.query(
   'SELECT FROM Organization'
).then(function(hitters){
   console.log(hitters)
});
