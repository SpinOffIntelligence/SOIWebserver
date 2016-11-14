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

exports.savePanelRecord = function(req, res, next) {
	var objectType = req.body.objectType;
	var panelRecord = req.body.panelRecord;
	console.log(panelRecord);

	soiServices.updateRecord(panelRecord, function(err, data) {
		res.json(data);
	});

}


exports.fetchPanelRecords = function(req, res, next) {
	var panelInfo = req.body.panelInfo;
	console.log(panelInfo);

	soiServices.getSchema(panelInfo.objectType, function(err, data) {
		panelInfo.schema = data;

		console.log('getRecords');

		soiServices.getRecords(panelInfo.objectType, panelInfo.fields, function(err, data) {

			console.log('Records');
			console.dir(data);

			panelInfo.records = data;
			res.json(panelInfo);
		});
	});

}