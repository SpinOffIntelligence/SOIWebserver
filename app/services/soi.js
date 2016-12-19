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


exports.deleteLogInfo = function(file, callback) {
	file = file.replace('\\','\\\\')
	var query = strUtil.format("delete from BatchJob where file = '%s'", file);
	console.log('query:' + query);
	odb.db.query(query).then(function(records){
		callback(null,records);
	});
}

exports.getAllLogInfo = function(callback) {
	var query = "select from BatchJob";
	console.log('query:' + query);
	odb.db.query(query).then(function(records){
		callback(null,records);
	});
}

exports.getLogInfo = function(file, callback) {
	file = file.replace('\\','\\\\')
	var query = strUtil.format("select from BatchJob where file = '%s'", file);
	console.log('query:' + query);
	odb.db.query(query).then(function(records){
		callback(null,records);
	});
}

exports.addLogInfo = function(mode, file, strInfo, startdateTime, callback) {
	var infoObj = {
		file: file,
		info: strInfo,
		mode: mode,
		startdatetime: startdateTime
	}
	odb.db.insert().into('BatchJob')
   .set(infoObj).all().then(function(returnObj){
      callback(null, returnObj);
   });
}



exports.exportRecords = function(objectType, criteria, callback) {

	var whereClause='';
	var query;
	if(util.defined(criteria,'length') && criteria.length > 0) {
		for(var i=0; i<criteria.length; i++) {
			var cri = criteria[i];
			var clause;
			if(cri.operator == 'equals') {
				clause = strUtil.format("%s = '%s'", cri.field, cri.value);
			} else if(cri.operator == 'greater') {
				clause = strUtil.format("%s > %s", cri.field, cri.value);
			} else if(cri.operator == 'less') {
				clause = strUtil.format("%s < %s", cri.field, cri.value);
			} else if(cri.operator == 'contains') {
				clause = cri.field + " like '%" + cri.value + "%'";
			} else if(cri.operator == 'notequal') {
				clause = strUtil.format("%s <> '%s'", cri.field, cri.value);
			} else if(cri.operator == 'notcontain') {
				clause = strUtil.format("NOT %s like '\%%s\%'", cri.field, cri.value);
			}
			if(i != criteria.length-1) {
				whereClause = clause + ' and ';
			} else {
				whereClause += clause;
			}
		}
		console.log('whereClause:' + whereClause);		
		query = strUtil.format("SELECT FROM %s where %s", objectType, whereClause);
	} else {
		query = strUtil.format("SELECT FROM %s", objectType);
	}

	console.log('query:' + query);
	odb.db.query(query).then(function(records){
		console.log('records:');
		//console.dir(records);
		callback(null,records);
	});

}


exports.updateRecordByProp = function(objectType, idField, idValue, updateObj, callback) {
	var query = strUtil.format("SELECT FROM %s where %s = '%s'", objectType ,idField, idValue);
	console.log('query:' + query);
	odb.db.query(query).then(function(records){
		console.log('records:' + records);
		//console.dir(records);
		if(records.length == 0) {
			callback('Not Found!',null);
			return;
		} else if(records.length > 1) {
			callback('Not Unqiue!',null);
			return;
		} else {

			var updateStr = '';
			for(var propertyName in updateObj) {
				if(updateStr == '')
					updateStr = strUtil.format("%s = '%s'", propertyName, updateObj[propertyName]);
				else updateStr += ' , ' + strUtil.format("%s = '%s'", propertyName, updateObj[propertyName]);
			}
			var query = strUtil.format("UPDATE %s SET %s WHERE %s = '%s'", objectType, updateStr, idField, idValue);
			console.log('query:' + query);
			odb.db.query(query).then(function(records){
				console.log('records:' + records);
				callback(null,records);
				return;				
			});
		}
	});
}

exports.deleteVertexByProp = function(objectType, idField, idValue, callback) {

	var query = strUtil.format("SELECT FROM %s where %s = '%s'", objectType, idField, idValue);
	console.log('query:' + query);
	odb.db.query(query).then(function(records){
		console.log('records:' + records);
		//console.dir(records);
		if(records.length == 0) {
			callback('Not Found!',null);
			return;
		} else if(records.length > 1) {
			callback('Not Unqiue!',null);
			return;
		} else {
			var query = strUtil.format("DELETE VERTEX %s where %s = '%s'", objectType, idField, idValue);
			console.log('query:' + query);
			odb.db.query(query).then(function(records){
				callback(null,records);
				return;
			});
		}
	});
}

exports.fetchRecordByProp = function(objectType, prod, value, callback) {
	var query = strUtil.format("SELECT FROM %s where %s = '%s'", objectType, prod, value);
	console.log('query:' + query);
		odb.db.query(query).then(function(records){
			callback(null,records);
		});
}

exports.fetchRecordByName = function(objectType, name, callback) {
	var query = strUtil.format("SELECT FROM %s where name = '%s'", objectType, name);
	console.log('query:' + query);
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
		var query = strUtil.format("CREATE EDGE %s FROM %s TO %s CONTENT %s", objectType, sourceId, targetId, JSON.stringify(recordData));
		console.log('query:' + query);
		odb.db.query(query).then(function(records){
	   		console.log('records:' + records);
   			callback(null, records);
		}).catch(function(e) {
			console.log('error:' + e);
			callback(e, null);
	  });			
	} else {
		var query = strUtil.format("CREATE EDGE %s FROM %s TO %s", objectType, sourceId, targetId);
		console.log('query:' + query);
		odb.db.query(query).then(function(records){
	   		console.log('records:' + records);
   			callback(null, records);
		}).catch(function(e) {
			console.log('error:' + e);
			callback(e, null);
	  });			
	}
}

exports.fetchGridRecords = function(objectType, gridFields, callback) {

	var props = '*, ';
	for(var i=0; i<gridFields.length; i++) {
		var gf = gridFields[i];

		var prop='';
		if(util.defined(gf,'schemaName')) {
			prop = gf.schemaName;
		} else if(util.defined(gf,'select')) {
			prop = gf.select;
		} else {
			continue;
		}
		console.log(prop);
		props += prop + ', ';
	}
	props = props.slice(0, -2);

	var query = strUtil.format("SELECT %s FROM %s", props, objectType);
	console.log('query: ' + query);

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

		console.log('** traverse **');
		//console.dir(recordDetails);

   var returnObj = {};
   for(var i=0; i<recordDetails.length; i++) {
			var obj = recordDetails[i];
			var className = obj['@class'];

			//console.log('** Class:' + className);

			if(!util.defined(returnObj,className)) {
				returnObj[className]=[];
			}

			var props={};
			for(var propertyName in obj) {

				//console.log('** propertyName:' + propertyName);

				if(propertyName.indexOf('in') != 0 && propertyName.indexOf('out') != 0 && propertyName.indexOf('@') != 0 && propertyName != 'id' && propertyName != 'backup' && typeof propertyName != 'object' && typeof propertyName != 'array') {					
					//console.log('>>Add');
					props[propertyName] = obj[propertyName];
				} else if(propertyName.indexOf('@rid') == 0) {
					//console.log('>>Add');
					var idobj = obj[propertyName];
					props.id = '#' + idobj.cluster + ':' + idobj.position;
				} else if(propertyName.indexOf('in') == 0 && propertyName.indexOf('_') != 0) {

					//console.log('>>Add');
					//console.log('** IN:');

					var inobj = obj[propertyName];
					var inprops={};
					for(var propertyName in inobj) {
						
						//console.log('** IN propertyName:' + propertyName);

						if(propertyName.indexOf('in') != 0 && propertyName.indexOf('out') != 0 && propertyName.indexOf('@') != 0 && propertyName != 'id' && propertyName != 'backup' && typeof propertyName != 'object' && typeof propertyName != 'array') {
							inprops[propertyName] = inobj[propertyName];
							//console.log('>>Add In' + inprops[propertyName]);

						} else if(propertyName.indexOf('@rid') == 0) {
							var idobj = inobj[propertyName];
							inprops.inId = '#' + idobj.cluster + ':' + idobj.position;
							//console.log('>>Add In' + inprops.inId);
						}
					}
					//console.log('** IN OBJ DONE:');
					//console.dir(inprops)
					props['in'] = inprops;
				} else if(propertyName.indexOf('out') == 0 && propertyName.indexOf('_') != 0) {

					//console.log('>>Add');
					//console.log('** IN:');

					var outobj = obj[propertyName];
					var outprops={};
					for(var propertyName in outobj) {
						if(propertyName.indexOf('in') != 0 && propertyName.indexOf('out') != 0 && propertyName.indexOf('@') != 0 && propertyName != 'id' && propertyName != 'backup' && typeof propertyName != 'object' && typeof propertyName != 'array') {
							outprops[propertyName] = outobj[propertyName];
						} else if(propertyName.indexOf('@rid') == 0) {
							var idobj = outobj[propertyName];
							outprops.outId = '#' + idobj.cluster + ':' + idobj.position;
						}
					}

					//console.log('** OUT OBJ:');
					////console.dir(outprops)
					props['out'] = outprops;
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
		if(propertyName.indexOf('@') == -1 && propertyName != 'id' && propertyName != 'backup' && util.defined(panelRecord,propertyName) && panelRecord[propertyName].length > 0) {
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
	        //console.dir(props);

	        if(util.defined(props,"superClass")) {

						odb.db.class.get(props.superClass).then(function(obj){
							obj.property.list()
							.then(
							function(properties){	        	
								var subProps=getSchemaProperties(properties);
								console.log('^^^^^^^^^ subProps ^^^^^^^^^^^' + props.superClass);
								//console.dir(subProps);

								for(var propertyName in subProps) {
									props[propertyName] = subProps[propertyName];
								}
								console.log('^^^^^^^^^ final props ^^^^^^^^^^^');
								//console.dir(props);
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