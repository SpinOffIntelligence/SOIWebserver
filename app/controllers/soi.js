'use strict';

var odb = require('../../components/orientdb.js');
var soiServices = require('../services/soi');


exports.addPanelRecord = function(req, res, next) {
	var objectType = req.body.objectType;
	var panelRecord = req.body.panelRecord;
	console.log(panelRecord);

	soiServices.addRecord(objectType, panelRecord, function(err, data) {
		res.json(data);
	});
}

exports.updatePanelRecord = function(req, res, next) {
	var objectType = req.body.objectType;
	var panelRecord = req.body.panelRecord;
	console.log(panelRecord);

	soiServices.updateRecord(objectType, panelRecord, function(err, data) {
		res.json(data);
	});
}

exports.deletePanelRecord = function(req, res, next) {
	var objectType = req.body.objectType;
	var panelRecord = req.body.panelRecord;
	console.log(panelRecord);

	soiServices.deleteRecord(objectType, panelRecord, function(err, data) {
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