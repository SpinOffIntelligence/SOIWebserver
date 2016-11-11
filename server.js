var OrientDB = require('orientjs');
var express = require('express');
var fs = require('fs');
var odb =  require('./components/orientdb.js');

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

odb.init(function(err, res) {
});


require('./config/routes.js')(app, express);

// Start the app by listening on <port>
var port = process.env.PORT || config.port;
app.listen(port);

