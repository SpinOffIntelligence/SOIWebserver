'use strict';

var odb = require('../../components/orientdb.js');
var soiServices = require('../services/soi');
var async = require('async');
var util = require('../../components/utilities.js');

exports.getRecordDetails = function(req, res, next) {
	soiServices.getRecordDetails(objectType, panelRecord, function(err, data) {
		res.json(data);
	});
}


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

	var relationships = panelInfo.relationships;


	function getInfo(infoObj, callback) {

		console.log('***infoObj:');
		console.dir(infoObj);

		if(infoObj.mode == 'schema') {
			var mode = infoObj.mode;
			var objectType = infoObj.objectType;
			soiServices.getSchema(objectType, function(err, data) {
				var obj = {
					mode: mode,
					objectType: objectType,
					data: data
				}
				callback(null,obj);
			});
		} else {
			soiServices.getRecords(infoObj.objectType, infoObj.fields, function(err, data) {
				callback(null,data);
			});
		}
	}

	var requestObj = [
		{mode: 'schema', objectType: panelInfo.objectType},
		{mode: 'records', objectType: panelInfo.objectType, fields: panelInfo.fields}
	];

	if(util.defined(panelInfo,"relationships")) {

		console.log('~~~~~~~~~~Relations:' + panelInfo.relationships)

		for(var i=0; i<panelInfo.relationships.length; i++) {
			var obj = {
				mode: 'schema',
				objectType: panelInfo.relationships[i].edgeType
			}
			requestObj.push(obj);
		}		
	}

	console.log('*****ASYNC REQ:');
  console.dir(requestObj);


	async.map(requestObj, getInfo, function(err, results){
    // results is now an array of stats for each file
    var returnObj={
    	schemas: {},
    	records: null
    };

    console.log('*****ASYNC:');
    console.dir(results);

    for(var i=0; i<results.length; i++) {
    	if(results[i].mode == 'schema')
    		returnObj.schemas[results[i].objectType] = results[i].data;
    	else returnObj.records = results[i];
    }
    res.json(returnObj);
	});

	// Get all related as well.
	// panelInfo.relationships
	// soiServices.getSchema(panelInfo.objectType, function(err, data) {
	// 	panelInfo.schema = data;

	// 	console.log('getRecords');

	// 	soiServices.getRecords(panelInfo.objectType, panelInfo.fields, function(err, data) {

	// 		console.log('Records');
	// 		console.dir(data);

	// 		panelInfo.records = data;
	// 		res.json(panelInfo);
	// 	});
	//});

}