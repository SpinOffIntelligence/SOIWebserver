var config = require('../config/config'),
    OrientDB = require('orientjs');

var server;
var db;

var exports = module.exports = {};

exports.server;
exports.db;

exports.init = function(callback) {
	exports.server = OrientDB({
	   host:       'ec2-52-25-121-66.us-west-2.compute.amazonaws.com',
	   port:       2424,
	   username:   'root',
	   password:   '9WlcEMvyBJqKToMWO4vvqrgRx7iuzKuf'
	});

	var dbs = exports.server.list()
	   .then(
	      function(list){
	         console.log('Databases on Server:', list.length);
	      }
	   );

	exports.db = exports.server.use({
	   name:     config.dbname,
	   username: 'root',
	   password: '9WlcEMvyBJqKToMWO4vvqrgRx7iuzKuf'
	});

	callback(null,dbs);

};
