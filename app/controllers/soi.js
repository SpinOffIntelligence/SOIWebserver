'use strict';

var odb = require('../../components/orientdb.js');

exports.getOrganizations = function(req, res, next) {

	console.log(odb.server);

	odb.db.query(
	   'SELECT FROM Organization'
	).then(function(hitters){
	   console.log(hitters)
		res.json(hitters);
	});

}