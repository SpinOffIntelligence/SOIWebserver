'use strict';

var odb = require('../../components/orientdb.js');
var soiServices = require('../services/soi');
var async = require('async');
var util = require('../../components/utilities.js');


exports.searchRecords = function(req, res, next) {
	var objectTypes = req.body.objectTypes;
	var terms = req.body.terms;

	console.log('*** searchRecords ***');
	console.dir(objectTypes);
	console.log('~~~~~~~~~~~~~~');
	console.dir(terms);

	soiServices.searchRecords(objectTypes, terms, function(err, data) {
		res.json(data);
	});
}


exports.fetchGridRecords = function(req, res, next) {
	var objectType = req.body.objectType;
	var gridFields = req.body.gridFields;

	console.log('*** fetchGridRecords ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(gridFields);

	soiServices.fetchGridRecords(objectType, gridFields, function(err, data) {
		res.json(data);
	});
}

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

exports.getRelationship = function(req, res, next) {
	var edgeObjectType = req.body.edgeObjectType;
	var recordItemId = req.body.recordItemId;

	console.log('*** getEdge ***');
	console.dir(edgeObjectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(recordItemId);

	soiServices.getRelationship(edgeObjectType, recordItemId, function(err, data) {
		res.json(data);
	});	
}


exports.getRelationshipDetails = function(req, res, next) {
	var edgeObjectType = req.body.edgeObjectType;
	var recordItemId = req.body.recordItemId;

	console.log('*** getRelationshipDetails ***');
	console.dir(edgeObjectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(recordItemId);

	soiServices.getRelationshipDetails(edgeObjectType, recordItemId, function(err, data) {
		res.json(data);
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


exports.getEdgeBySource = function(req, res, next) {
	var edgeObjectType = req.body.edgeObjectType;
	var recordItemId = req.body.recordItemId;

	console.log('*** getEdge ***');
	console.dir(edgeObjectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(recordItemId);

	soiServices.getEdgeBySource(edgeObjectType, recordItemId, function(err, data) {
		res.json(data);
	});
}

exports.deleteEdge = function(req, res, next) {
	var objectType = req.body.objectType;
	var sourceId = req.body.sourceId;
	var targetId = req.body.targetId;

	console.log('*** updateEdge ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(sourceId);
	console.log('~~~~~~~~~~~~~~');
	console.dir(targetId);

	soiServices.deleteEdge(objectType, sourceId, targetId, function(err, data) {
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

exports.fetchRecordByProp = function(req, res, next) {
	var objectType = req.body.objectType;
	var prop = req.body.prop;
	var value = req.body.value;
	var schema = req.body.schema;


	console.log('*** fetchRecords ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(prop);
	console.log('~~~~~~~~~~~~~~');
	console.dir(value);
	console.log('~~~~~~~~~~~~~~');
	console.dir(schema);

	soiServices.fetchRecordByProp(objectType, prop, value, schema, function(err, data) {
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
	var depth = req.body.depth;

	console.log('*** getRecordDetails ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(recordId);
	console.log('~~~~~~~~~~~~~~');
	console.dir(depth);

	soiServices.getRecordDetails(objectType, recordId, depth, function(err, data) {
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

exports.exportRecords = function(req, res, next) {

	var objectType = req.body.objectType;
	var criteria = req.body.criteria;
	var schema = req.body.schema;

	console.log('*** exportRecords ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(criteria);
	console.log('~~~~~~~~~~~~~~');
	console.dir(schema);

	soiServices.exportRecords(objectType, criteria, schema, function(err, records) {
		var strInfo;
		if(util.defined(err)) {
			console.log('Error Exporting:' + err);
			strInfo = 'Error Exporting:' + err;
			util.logInfo('Export', 'n/a', strInfo);
		} else {
			console.log('Exporting:' + records);	
			strInfo = 'Exporting: ' + objectType + ':' + records.length;
			util.logInfo('Export', 'n/a', strInfo);	
			res.json({error_code:0,err_desc:null,strLog: strInfo, file: 'n/a', exportData: records});			
		}
	});	
}

exports.deleteLogInfo = function(req, res, next) {

	var file = req.body.file;
	console.log('*** getLogInfo ***');
	console.dir(file);
	soiServices.deleteLogInfo(file, function(err, data) {
		res.json(data);
	});	
}

exports.getLogInfo = function(req, res, next) {

	console.log('*** getLogInfo ***');
	if(util.defined(req,"body.file")) {
		var file = req.body.file;
		console.dir(file);
		soiServices.getLogInfo(file, function(err, data) {
			res.json(data);
		});	
	} else {
		soiServices.getAllLogInfo(function(err, data) {
			res.json(data);
		});	

	}
}
