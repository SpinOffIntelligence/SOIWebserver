'use strict';

var odb = require('../../components/orientdb.js');
var _ = require('underscore');
var util = require('../../components/utilities.js');
var strUtil = require('util');

var schemaTypeMap = [
	{dbtype: 7, apptype: 'string'},
	{dbtype: 1, apptype: 'integer'},
	{dbtype: 19, apptype: 'date'}
];

exports.getEdge = function(edgeObjectType, edgeRecordItemId, callback) {
var query = strUtil.format("SELECT FROM %s where @rid = %s", edgeObjectType, edgeRecordItemId);

	odb.db.query(query).then(function(records){
		var recs=[];
		for(var i=0; i<records.length; i++) {
			var rec = records[i];
			var recId = rec['@rid'];
			rec.id = '#'+	recId.cluster + ':' + recId.position;
			recs.push(rec);
		}
		callback(null,records[0]);
	});
}

exports.deleteEdge = function(recordId, callback) {
	odb.db.record.delete(recordId);
	callback(null, true);
}

exports.updateEdge = function(objectType, recordData, sourceId, targetId, callback) {

	var cleanData = {};
	for(var propertyName in recordData) {
		if(recordData[propertyName] != null && propertyName.indexOf('in') == -1 && propertyName.indexOf('out') == -1 && propertyName.indexOf('@') == -1 && propertyName != 'id' && propertyName != 'backup' && typeof propertyName != 'object' && typeof propertyName != 'array')
			cleanData[propertyName] = recordData[propertyName];
	}
	var sendObj = util.prepareInboudDate(cleanData);

	var ret = odb.db.record.delete(recordData.id);
	if(ret != null) {
		var playsFor = odb.db.create('EDGE', objectType)
	   	.from(sourceId).to(targetId).set(sendObj).one();		
	  callback(null, playsFor);
	} else {
		callback(500, null);	
	}
	
}

exports.addEdge = function(objectType, recordData, sourceId, targetId, callback) {

	var cleanData = {};
	var sendObj = {};
	if(util.defined(recordData)) {
		for(var propertyName in recordData) {
			if(recordData[propertyName] != null)
				cleanData[propertyName] = recordData[propertyName];
		}
		sendObj = util.prepareInboudDate(cleanData);		
	}

	var playsFor = odb.db.create('EDGE', objectType)
   	.from(sourceId).to(targetId).set(sendObj).one();
   callback(null, playsFor);
}

exports.fetchRecords = function(objectType, callback) {
	var query = strUtil.format("SELECT FROM %s", objectType);

	odb.db.query(query).then(function(records){
		var recs=[];
		for(var i=0; i<records.length; i++) {
			var rec = records[i];
			var recId = rec['@rid'];
			rec.id = '#'+	recId.cluster + ':' + recId.position;
			recs.push(rec);
		}
		callback(null,records);
	});
}

exports.getRecordDetails = function(objectType, recordId, callback) {
	//var panelRecord={};
	//panelRecord.id = '#13:1';

	odb.db.query("traverse * from " + recordId).then(function(recordDetails){

   var returnObj = {};
   for(var i=0; i<recordDetails.length; i++) {
			var obj = recordDetails[i];
			var className = obj['@class'];

			if(!util.defined(returnObj,className)) {
				returnObj[className]=[];
			}

			var props={};
			for(var propertyName in obj) {
				if(propertyName.indexOf('in') == -1 && propertyName.indexOf('out') == -1 && propertyName.indexOf('@') == -1 && propertyName != 'id' && propertyName != 'backup' && typeof propertyName != 'object' && typeof propertyName != 'array') {
					props[propertyName] = obj[propertyName];
				} else if(propertyName.indexOf('@rid') > -1) {
					var idobj = obj[propertyName];
					props.id = '#' + idobj.cluster + ':' + idobj.position;
				} else if(propertyName.indexOf('in') > -1 && propertyName.indexOf('_') == -1) {
					var inobj = obj[propertyName];
					var inprops={};
					for(var propertyName in inobj) {
						if(propertyName.indexOf('in') == -1 && propertyName.indexOf('out') == -1 && propertyName.indexOf('@') == -1 && propertyName != 'id' && propertyName != 'backup' && typeof propertyName != 'object' && typeof propertyName != 'array') {
							props[propertyName] = inobj[propertyName];
						} else if(propertyName.indexOf('@rid') > -1) {
							var idobj = inobj[propertyName];
							props.inId = '#' + idobj.cluster + ':' + idobj.position;
						}
					}

				}
			}
			returnObj[className].push(props);
   }
   callback(null,returnObj);
	});
}

exports.addRecord = function(objectType, panelRecord, callback) {
	var updateObj = {};
	for(var propertyName in panelRecord) {
		if(propertyName.indexOf('@') == -1 && propertyName != 'id' && propertyName != 'backup' && util.defined(panelRecord,propertyName)) {
			updateObj[propertyName] = panelRecord[propertyName];
		}
	}
	var sendObj = util.prepareInboudDate(updateObj);
	odb.db.insert().into(objectType)
   .set(sendObj).all().then(function(returnObj){
      callback(null, returnObj);
   });
}


exports.updateRecord = function(objectType, recordId, panelRecord, callback) {
	var updateObj = {};
	var rid = panelRecord['@rid'];
	for(var propertyName in panelRecord) {
		var val = updateObj[propertyName];
		if(propertyName.indexOf('@') == -1 && propertyName != 'id' && propertyName != 'backup' && util.defined(panelRecord,propertyName)) {
			updateObj[propertyName] = panelRecord[propertyName];
		}
	}
	var sendObj = util.prepareInboudDate(updateObj);

	odb.db.update(recordId)
   .set(sendObj).one()
   .then(
      function(update){
         callback(null, update);
      }
   );	
}

exports.deleteRecord = function(objectType, recordId, callback) {
	odb.db.record.delete(recordId);
	callback(null, true);
}


exports.getRecords = function(objName, callback) {
	var query = strUtil.format("SELECT FROM %s", objName);

	odb.db.query(query).then(function(records){
		var recs=[];
		for(var i=0; i<records.length; i++) {
			var rec = records[i];
			var recId = rec['@rid'];
			rec.id = '#'+	recId.cluster + ':' + recId.position;
			recs.push(rec);
		}
		callback(null,records);
	});
}

exports.getSchema = function(objName, callback) {

	odb.db.class.get(objName).then(function(obj){
	   obj.property.list()
	   .then(
	      function(properties){
	        var props={};
	        for(var i=0; i<properties.length; i++) {
	        	var prop = properties[i];
	        	var appType = '';
	        	var fnd = _.findWhere(schemaTypeMap, {dbtype: prop.type})
	        	if(util.defined(fnd)) {
	        		appType = fnd.apptype;
	        	}

	        	var obj = {
	        		type: appType,
	        		mandatory: prop.mandatory,
	        		defaultValue: prop.defaultValue,
	        		readOnly: prop.readonly,
	        		notNull: prop.notNull,
	        		min: prop.min,
	        		max: prop.max,
	        		cluster: prop['class'].defaultClusterId
	        	}
	        	props[prop.name] = obj;
	        }
		      callback(null,props);        
	      }
	    );
	});
}