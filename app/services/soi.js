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

exports.deleteVertexByProp = function(objectType, propName, propValue, callback) {

	var query = strUtil.format("SELECT FROM %s where %s = '%s'", objectType ,propName, propValue);
	console.log('query:' + query);
	odb.db.query(query).then(function(records){
		console.log('records:' + records);
		console.dir(records);
		if(records.length == 0) {
			callback('Not Found!',null);
			return;
		} else if(records.length > 1) {
			callback('Not Unqiue!',null);
			return;
		} else {
			var query = strUtil.format("DELETE VERTEX %s where %s = '%s'", objectType ,propName, propValue);
			console.log('query:' + query);
			odb.db.query(query).then(function(records){
				callback(null,records);
				return;
			});
		}
	});
}

exports.fetchRecordByName = function(objectType, name, callback) {
	var query = strUtil.format("SELECT FROM %s where name = '%s'", objectType, name);
		odb.db.query(query).then(function(records){
			callback(null,records);
		});
}


exports.getRelationshipDetails = function(edgeObjectType, recordItemId, callback) {
	var query = strUtil.format("select from %s where out = %s", edgeObjectType, recordItemId);
	console.log('query:' + query);
	odb.db.query(query).then(function(records){
		var obj = {
			edgeObjectType: edgeObjectType,
			data: records
		}
		callback(null,obj);
	});
}


exports.getRelationship = function(edgeObjectType, recordItemId, callback) {
	var query = strUtil.format("traverse out('%s') from %s", edgeObjectType, recordItemId);
	console.log('query:' + query);
	odb.db.query(query).then(function(records){
		var obj = {
			edgeObjectType: edgeObjectType,
			data: records
		}
		callback(null,obj);
	});
}

exports.getEdge = function(edgeObjectType, edgeRecordItemId, callback) {
	var query = strUtil.format("SELECT FROM %s where @rid = %s", edgeObjectType, edgeRecordItemId);
	console.log('query:' + query);
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

exports.getEdgeBySource = function(edgeObjectType, recordItemId, callback) {
	var query = strUtil.format("select from %s where out = %s", edgeObjectType, recordItemId);
	console.log('query:' + query);
	odb.db.query(query).then(function(records){
		callback(null,records);
	});
}

exports.deleteEdge = function(objectType, sourceId, targetId, callback) {

	var query = strUtil.format("delete edge from %s to %s where @class = '%s'", sourceId, targetId, objectType);

	console.log('query:' + query);
	odb.db.query(query).then(function(results){
		 console.log(results);
		 callback(null, results);
	});

	// var query = 'update ' + outObjectType + ' remove out_' + objectType + ' where @rid = ' + outRecordId;
	// console.log('^^^^^^^ query:' + query);
	// odb.db.query(query).then(function(hitters){
 //   console.log(hitters);
 //   var query1 = 'update ' + inObjectType + ' remove in_' + objectType + ' where @rid = ' + inRecordId;
 //   console.log('^^^^^^^ query1:' + query1);
	// 	odb.db.query(query1).then(function(hitters){
	// 	   console.log(hitters)
	// 	   callback(null, true);
	// 	});
	// });
}

exports.updateEdge = function(objectType, recordData, sourceId, targetId, callback) {

	var sendObj = util.cleanInBoundData(recordData);
	console.log('^^^^ sendObj:');
	console.dir(sendObj);

	// Delete Edge
	var query = strUtil.format("delete edge from %s to %s where @class = '%s'", sourceId, targetId, objectType);
	console.log('query:' + query);
	odb.db.query(query).then(function(results){
		 console.log(results);
		 exports.addEdge(objectType, sendObj, sourceId, targetId, callback);
	});		
}

exports.addEdge = function(objectType, recordData, sourceId, targetId, callback) {

	var fndProp = false;
	var sendObj = util.cleanInBoundData(recordData);

	console.log('^^^ cleanInBoundData:');
	console.dir(sendObj);

	for(var propertyName in sendObj) {
		fndProp = true;
	}
	console.log('^^^ Prep Data:' + fndProp);
	console.dir(sendObj);

	var addedEdge;
	if(fndProp) {
		addedEdge = odb.db.create('EDGE', objectType)
	   	.from(sourceId).to(targetId).set(sendObj).one();		
	} else {
		addedEdge = odb.db.create('EDGE', objectType)
	   	.from(sourceId).to(targetId).one();				
	}
   callback(null, addedEdge);
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

	console.log('^^^^^^^^^ getSchema ^^^^^^^^^^^' + objName);
	function getSchemaProperties(properties) {
		var props={};
		var superClass=null;
		for(var i=0; i<properties.length; i++) {
			var prop = properties[i];
			var appType = '';
			var fnd = _.findWhere(schemaTypeMap, {dbtype: prop.type})
			if(util.defined(fnd)) {
				appType = fnd.apptype;
			}
			if(util.defined(prop,"class.superClass"))
				superClass = prop.class.superClass;
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
		if(util.defined(superClass)) {
			props['superClass'] = superClass;
		}
		return props;
	}

	odb.db.class.get(objName).then(function(obj){
	   obj.property.list()
	   .then(
	      function(properties){
	        var props=getSchemaProperties(properties);
	        console.log('^^^^^^^^^ props ^^^^^^^^^^^' + objName);
	        console.dir(props);

	        if(util.defined(props,"superClass")) {

						odb.db.class.get(props.superClass).then(function(obj){
							obj.property.list()
							.then(
							function(properties){	        	
								var subProps=getSchemaProperties(properties);
								console.log('^^^^^^^^^ subProps ^^^^^^^^^^^' + props.superClass);
								console.dir(subProps);

								for(var propertyName in subProps) {
									props[propertyName] = subProps[propertyName];
								}
								console.log('^^^^^^^^^ final props ^^^^^^^^^^^');
								console.dir(props);
								delete props.superClass;
								callback(null,props);	        	
							});
						});
	        } else {
	        	callback(null,props);
	        }
	      }
	    );
	});
}