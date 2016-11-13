'use strict';

var odb = require('../../components/orientdb.js');
var soiServices = require('../services/soi');

exports.getOrganizations = function(req, res, next) {
	console.log(odb.server);

	odb.db.query(
	   'SELECT name, phone, size, website FROM VOrganization'
	).then(function(hitters){
	   console.log(hitters);
	   res.json(hitters);
	});

}

exports.fetchRecords = function(req, res, next) {

	console.log(odb.server);

	var fetchPanelFieldsParams = req.body.fetchPanelFieldsParams;
	console.log(fetchPanelFieldsParams);

	soiServices.getSchema(fetchPanelFieldsParams.objectType, function(err, data) {
		fetchPanelFieldsParams.schema = data;

		console.log('getRecords');

		soiServices.getRecords(fetchPanelFieldsParams.objectType, fetchPanelFieldsParams.fields, function(err, data) {

			console.log('Records');
			console.dir(data);

			fetchPanelFieldsParams.records = data;
			res.json(fetchPanelFieldsParams);
		});
	});

}