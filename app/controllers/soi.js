'use strict';

var odb = require('../../components/orientdb.js');
var soiServices = require('../services/soi');
var async = require('async');
var util = require('../../components/utilities.js');


exports.getSchemas = function(req, res, next) {
	var schemas = req.body.schemas

	console.log('*** getSchemas ***');
	console.dir(schemas);

	function getInfo(infoObj, callback) {
		var mode = infoObj.mode;
		var objectType = infoObj.objectType;
		soiServices.getSchema(objectType, function(err, data) {
			var obj = {
				objectType: objectType,
				data: data
			}
			callback(null,obj);
		});
	}

	async.map(schemas, getInfo, function(err, results){
    // results is now an array of stats for each file
    var returnObj={};

    for(var i=0; i<results.length; i++) {
   		returnObj[results[i].objectType] = results[i].data;
    }
    res.json(returnObj);
	});
}

exports.getEdge = function(req, res, next) {
	var edgeObjectType = req.body.edgeObjectType;
	var edgeRecordItemId = req.body.edgeRecordItemId;

	console.log('*** getEdge ***');
	console.dir(edgeObjectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(edgeRecordItemId);

	soiServices.getEdge(edgeObjectType, edgeRecordItemId, function(err, data) {
		res.json(data);
	});
}

exports.deleteEdge = function(req, res, next) {
	var objectType = req.body.objectType;
	var edgeId = req.body.edgeId;
	var outRecordId = req.body.outRecordId;
	var outObjectType = req.body.outObjectType;
	var inRecordId = req.body.inRecordId;
	var inObjectType = req.body.inObjectType;

	console.log('*** updateEdge ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(edgeId);
	console.log('~~~~~~~~~~~~~~');
	console.dir(outObjectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(outRecordId);
	console.log('~~~~~~~~~~~~~~');
	console.dir(inObjectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(inRecordId);

	soiServices.deleteEdge(objectType, edgeId, outObjectType, outRecordId, inObjectType, inRecordId, function(err, data) {
		res.json(data);
	});
}

exports.updateEdge = function(req, res, next) {
	var objectType = req.body.objectType;
	var recordData = req.body.recordData;
	var sourceId = req.body.sourceId;
	var targetId = req.body.targetId;

	console.log('*** updateEdge ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(recordData);
	console.log('~~~~~~~~~~~~~~');
	console.dir(sourceId);
	console.log('~~~~~~~~~~~~~~');
	console.dir(targetId);


	soiServices.updateEdge(objectType, recordData, sourceId, targetId, function(err, data) {
		res.json(data);
	});
}

exports.addEdge = function(req, res, next) {
	var objectType = req.body.objectType;
	var recordData = req.body.recordData;
	var sourceId = req.body.sourceId;
	var targetId = req.body.targetId;

	console.log('*** addEdge ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(recordData);
	console.log('~~~~~~~~~~~~~~');
	console.dir(sourceId);
	console.log('~~~~~~~~~~~~~~');
	console.dir(targetId);

	soiServices.addEdge(objectType, recordData, sourceId, targetId, function(err, data) {
		res.json(data);
	});
}

exports.fetchRecords = function(req, res, next) {
	var objectType = req.body.objectType;

	console.log('*** fetchRecords ***');
	console.dir(objectType);

	soiServices.fetchRecords(objectType, function(err, data) {
		res.json(data);
	});
}

exports.getRecordDetails = function(req, res, next) {
	var objectType = req.body.objectType;
	var recordId = req.body.recordId;

	console.log('*** getRecordDetails ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(recordId);

	soiServices.getRecordDetails(objectType, recordId, function(err, data) {
		res.json(data);
	});
}

exports.addPanelRecord = function(req, res, next) {
	var objectType = req.body.objectType;
	var panelRecord = req.body.panelRecord;

	console.log('*** addPanelRecord ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(panelRecord);

	soiServices.addRecord(objectType, panelRecord, function(err, data) {
		res.json(data);
	});
}

exports.updatePanelRecord = function(req, res, next) {
	var objectType = req.body.objectType;
	var recordId = req.body.recordId;
	var panelRecord = req.body.panelRecord;

	console.log('*** updatePanelRecord ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(recordId);
	console.log('~~~~~~~~~~~~~~');
	console.dir(panelRecord);

	soiServices.updateRecord(objectType, recordId, panelRecord, function(err, data) {
		res.json(data);
	});
}

exports.deletePanelRecord = function(req, res, next) {
	var objectType = req.body.objectType;
	var recordId = req.body.recordId;

	console.log('*** deletePanelRecord ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(recordId);

	soiServices.deleteRecord(objectType, recordId, function(err, data) {
		res.json(data);
	});
}


exports.fetchPanelRecords = function(req, res, next) {
	var objectType = req.body.objectType;

	console.log('*** fetchPanelRecords ***');
	console.dir(objectType);

	soiServices.getRecords(objectType, function(err, data) {
		res.json(data);
	});
}