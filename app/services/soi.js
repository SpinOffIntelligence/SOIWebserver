'use strict';

var odb = require('../../components/orientdb.js');
var _ = require('underscore');
var util = require('../../components/utilities.js');
var strUtil = require('util');
var async = require('async');
var moment = require('moment');

var schemaTypeMap = [
	{dbtype: 7, apptype: 'string'},
	{dbtype: 1, apptype: 'integer'},
	{dbtype: 19, apptype: 'date'}
];


exports.removeImage = function(objectType, recordId, field, callback) {
  
  var query = strUtil.format("UPDATE %s SET %s = null WHERE @rid = %s", objectType, field, recordId);
  //console.log('query:' + query);
  odb.db.query(query).then(function(records){
    //console.log('records:' + records);
    callback(null,records);
    return;       
  });

}

exports.removePickListItem = function(typeName, itemId, callback) {

  var query = strUtil.format("delete from PickList where type = '%s' and @rid = '%s'", typeName, itemId);
  //console.log('query:' + query);
  odb.db.query(query).then(function(records){
    callback(null,records);
  }).catch(function(error){
    console.error('Exception: ' + error); 
    callback(error,null);   
  });  
}

exports.removePickListValues = function(typeName, callback) {

  var query = strUtil.format("delete from PickList where type = '%s'", typeName);
  //console.log('query:' + query);
  odb.db.query(query).then(function(records){
    callback(null,records);
  }).catch(function(error){
    console.error('Exception: ' + error); 
    callback(error,null);   
  });  

}

exports.addPickListValue = function(typeName, name, description, color, callback) {
  var infoObj = {
    type: typeName,
    name: name,
    description: description,
    color: color
  }

  //console.log('Insert:');
  //console.dirinfoObj);

  odb.db.insert().into('PickList ')
   .set(infoObj).all().then(function(returnObj){
      callback(null, returnObj);
   }).catch(function(error){
      console.error('Exception: ' + error); 
      callback(error,null);   
  });
}

exports.getPickListValues = function(callback) {
  var query = "SELECT FROM PickList";
  //console.log('query:' + query);
  odb.db.query(query).then(function(records){
    //console.log('records:' + records);
    callback(null,records);
    return;       
  });
}

exports.setRecordImage = function(objectType, logoField, idValue, file, callback) {
  
  //console.log('*** setRecordImage ***');
  //console.dirobjectType);
  //console.log('~~~~~~~~~~~~~~');
  //console.dirlogoField);
  //console.log('~~~~~~~~~~~~~~');
  //console.diridValue);
  //console.log('~~~~~~~~~~~~~~');
  //console.dirfile);

  var query = strUtil.format("UPDATE %s SET %s = '%s' WHERE @rid = %s", objectType, logoField, file, idValue);
  //console.log('query:' + query);
  odb.db.query(query).then(function(records){
    //console.log('records:' + records);
    callback(null,records);
    return;       
  });

}

exports.searchRecords = function(objectTypes, terms, notSearchTerms, filters, callback) {

	function searchRecs(objectType, terms, filters, callback) {

		var termsClause = "@id = 1";
		var notTermsClause = "";

		// Create List of Terms
		if(util.defined(terms)) {

			termsClause = "";
			var inTerms = terms.split(',');
			_.each(inTerms, function(item) {
				var term = item.trim();
				if(termsClause == "")
					termsClause = strUtil.format("(any() CONTAINSTEXT '%s')",term);
				else termsClause += strUtil.format(" OR (any() CONTAINSTEXT '%s')",term);
			});

		}

		// Create List of Terms
		if(util.defined(notSearchTerms)) {

			var inTerms = notSearchTerms.split(',');
			_.each(inTerms, function(item) {
				var term = item.trim();
				if(notTermsClause == "")
					notTermsClause = strUtil.format("NOT(any() CONTAINSTEXT '%s')",term);
				else notTermsClause += strUtil.format(" AND NOT(any() CONTAINSTEXT '%s')",term);
			});

		}

		var query = strUtil.format("select from %s where (%s) ",objectType, termsClause);
		if(notTermsClause != "") {
			query = strUtil.format("select from %s where (%s) AND (%s) ",objectType, notTermsClause, termsClause);
		}
		
    var filterClause = util.createFilterClause(filters, objectType);
    console.log('********filterClause:');
    console.dir(filterClause);

    if(filterClause != '') {
      query += " and " + filterClause;
    }
    console.log('search query:' + query);


		odb.db.query(query).then(function(records){
			console.log('Search Results:' + records.length);
			//console.dir(records);
      //recordData = util.prepareOutboundData(recordData);
			callback(null,records);
		}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  	});
	}

	var results=[];
  var funcs = [];
  _.each(objectTypes, function(objectType) {
    funcs.push(function(callback) { //This is the first task, and `callback` is its callback task
        searchRecs(objectType, terms, filters, function(err, data) {
            var obj = {
              objectType: objectType,
              results: data
            }
            results.push(obj);
            callback();
        });
    });
  });

  console.log('********funcs:');
  console.dir(funcs);


	async.parallel(funcs, function(err) { //This is the final callback
    //console.log('All Done');
    //console.dirresults);
    callback(null, results);
	});
}


exports.deleteLogInfo = function(file, callback) {
	file = file.replace('\\','\\\\')
	var query = strUtil.format("delete from BatchJob where file = '%s'", file);
	//console.log('query:' + query);
	odb.db.query(query).then(function(records){
		callback(null,records);
	}).catch(function(error){
    console.error('Exception: ' + error); 
    callback(error,null);   
  });
}

exports.getAllLogInfo = function(callback) {
	var query = "select from BatchJob";
	//console.log('query:' + query);
	odb.db.query(query).then(function(records){
		callback(null,records);
	}).catch(function(error){
    console.error('Exception: ' + error); 
    callback(error,null);   
  });
}

exports.getLogInfo = function(file, callback) {
	file = file.replace('\\','\\\\')
	var query = strUtil.format("select from BatchJob where file = '%s'", file);
	//console.log('query:' + query);
	odb.db.query(query).then(function(records){
		callback(null,records);
	}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
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
   }).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });
}

exports.exportRecords = function(objectType, criteria, schema, callback) {
  var whereClause = util.createWhereClause(criteria, objectType);
  var query;
  if(whereClause != '')	{
		if(whereClause.length > 0)	{
			query = strUtil.format("SELECT FROM %s where %s", objectType, whereClause);
		} else {
			query = strUtil.format("SELECT FROM %s", objectType);
		}
	} else {
		query = strUtil.format("SELECT FROM %s", objectType);
	}

	//console.log('query:' + query);
	odb.db.query(query).then(function(records){
		//console.log('records:');
		////console.dirrecords);
		callback(null,records);
	}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });

}


exports.updateRecordByProp = function(objectType, idField, idValue, updateObj, schemas, callback) {

	//console.log('*** updateRecordByProp ***');

	var schemaTypes = util.getSchemaType(objectType, idField);

	var query;	
	if(schemaTypes.isString == true || schemaTypes.isId == true) {
		query = strUtil.format("SELECT FROM %s where %s = '%s'", objectType ,idField, idValue);	
	} else if(schemaTypes.isDate == true) {
		idValue = util.formatDBDate(idValue);
		query = strUtil.format("SELECT FROM %s where %s between '%s' and '%s'", objectType ,idField, idValue, idValue);	
	} else {
		query = strUtil.format("SELECT FROM %s where %s = %s", objectType ,idField, idValue);	
	}
	
	//console.log('query:' + query);
	odb.db.query(query).then(function(records){
		//console.log('records:' + records);
		////console.dirrecords);
		if(records.length == 0) {
			callback('Not Found!',null);
			return;
		} else if(records.length > 1) {
			callback('Not Unqiue!',null);
			return;
		} else {

			var updateStr = '';
			for(var propertyName in updateObj) {
				var schemaTypes = util.getSchemaType(objectType, propertyName);
				if(schemaTypes.isString == true) {
					updateStr += strUtil.format("%s = '%s'", propertyName, updateObj[propertyName]) + ' , ';
				} else if(schemaTypes.isDate == true) {
					var val =  updateObj[propertyName];
					val = util.formatDBDate(val);
					updateStr += strUtil.format("%s between '%s' and '%s'", propertyName, val, val) + ' , ';
				} else {
					updateStr += strUtil.format("%s = %s", propertyName, updateObj[propertyName]) + ' , ';
				}
			}
			updateStr = updateStr.slice(0, -3);			

			var query = strUtil.format("UPDATE %s SET %s WHERE %s = '%s'", objectType, updateStr, idField, idValue);
			//console.log('query:' + query);
			odb.db.query(query).then(function(records){
				//console.log('records:' + records);
				callback(null,records);
				return;				
			});
		}
	});
}

exports.deleteVertexByProp = function(objectType, idField, idValue, schemas, callback) {

	//console.log('*** updateRecordByProp ***');

	var schemaTypes = util.getSchemaType(objectType, idField);

	var query;	
	if(schemaTypes.isString == true || schemaTypes.isId == true) {
		query = strUtil.format("SELECT FROM %s where %s = '%s'", objectType ,idField, idValue);	
	} else if(schemaTypes.isDate == true) {
		idValue = util.formatDBDate(idValue);
		query = strUtil.format("SELECT FROM %s where %s = '%s'", objectType ,idField, idValue);	
	} else {
		query = strUtil.format("SELECT FROM %s where %s = %s", objectType ,idField, idValue);	
	}

	//console.log('query:' + query);
	odb.db.query(query).then(function(records){
		//console.log('records:' + records);
		////console.dirrecords);
		if(records.length == 0) {
			callback('Not Found!',null);
			return;
		} else if(records.length > 1) {
			callback('Not Unqiue!',null);
			return;
		} else {
			var query;
			if(schemaTypes.isString == true || schemaTypes.isId == true) {
				query = strUtil.format("DELETE VERTEX %s where %s = '%s'", objectType ,idField, idValue);	
			} else if(schemaTypes.isDate == true) {
				idValue = util.formatDBDate(idValue);
				query = strUtil.format("DELETE VERTEX %s where %s = '%s'", objectType ,idField, idValue);	
			} else {
				query = strUtil.format("DELETE VERTEX %s where %s = %s", objectType ,idField, idValue);	
			}
			//console.log('query:' + query);
			odb.db.query(query).then(function(records){
				callback(null,records);
				return;
			});
		}
	});
}

exports.fetchRecordByProp = function(objectType, prod, value, callback) {

	var schemaTypes = util.getSchemaType(objectType, prod);
	if(schemaTypes.isString) {
		var query = strUtil.format("SELECT FROM %s where %s = '%s'", objectType, prod, value);	
	} else if(schemaTypes.isDate) {
		value = util.formatDBDate(value);
		var query = strUtil.format("SELECT FROM %s where %s = '%s'", objectType, prod, value);
	} else {
		var query = strUtil.format("SELECT FROM %s where %s = '%s'", objectType, prod, value);
	}
	
	//console.log('query:' + query);
		odb.db.query(query).then(function(records){
      records = util.prepareOutboundData(objectType, records);
			callback(null,records);
		}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });
}

exports.fetchRecordByName = function(objectType, name, callback) {
	var query = strUtil.format("SELECT FROM %s where name = '%s'", objectType, name);
	//console.log('query:' + query);
		odb.db.query(query).then(function(records){
      records = util.prepareOutboundData(objectType, records);
			callback(null,records);
		});
}

exports.getRelationshipDetails = function(edgeObjectType, recordItemId, callback) {
	var query = strUtil.format("select from %s where out = %s", edgeObjectType, recordItemId);
	//console.log('query:' + query);
	odb.db.query(query).then(function(records){
		var obj = {
			edgeObjectType: edgeObjectType,
			data: records
		}
		callback(null,obj);
	}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });
}


exports.getRelationship = function(edgeObjectType, recordItemId, callback) {
	var query = strUtil.format("traverse out('%s') from %s maxdepth 1", edgeObjectType, recordItemId);
	console.log('query:' + query);
	odb.db.query(query).then(function(records){
		var obj = {
			edgeObjectType: edgeObjectType,
			data: records
		}
		callback(null,obj);
	}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });
}

exports.getEdge = function(edgeObjectType, edgeRecordItemId, callback) {
	var query = strUtil.format("SELECT FROM %s where @rid = %s", edgeObjectType, edgeRecordItemId);
	//console.log('query:' + query);
	odb.db.query(query).then(function(records){
    records = util.prepareOutboundData(edgeObjectType, records);
		// var recs=[];
		// for(var i=0; i<records.length; i++) {
		// 	var rec = records[i];
		// 	var recId = rec['@rid'];
		// 	rec.id = '#'+	recId.cluster + ':' + recId.position;
		// 	recs.push(rec);
		// }
		callback(null,records[0]);
	}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });
}

exports.getEdgeBySource = function(edgeObjectType, recordItemId, callback) {
	var query = strUtil.format("select from %s where out = %s", edgeObjectType, recordItemId);
	//console.log('query:' + query);
	odb.db.query(query).then(function(records){
    records = util.prepareOutboundData(edgeObjectType, records);
		callback(null,records);
	});
}

exports.deleteEdge = function(objectType, sourceId, targetId, callback) {

	var query = strUtil.format("delete edge from %s to %s where @class = '%s'", sourceId, targetId, objectType);

	//console.log('query:' + query);
	odb.db.query(query).then(function(results){
		 //console.logresults);
		 callback(null, results);
	}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });

	// var query = 'update ' + outObjectType + ' remove out_' + objectType + ' where @rid = ' + outRecordId;
	// //console.log('^^^^^^^ query:' + query);
	// odb.db.query(query).then(function(hitters){
 //   //console.loghitters);
 //   var query1 = 'update ' + inObjectType + ' remove in_' + objectType + ' where @rid = ' + inRecordId;
 //   //console.log('^^^^^^^ query1:' + query1);
	// 	odb.db.query(query1).then(function(hitters){
	// 	   //console.loghitters)
	// 	   callback(null, true);
	// 	});
	// });
}

exports.updateEdge = function(objectType, recordData, sourceId, targetId, callback) {

  //console.log('>>>> updateEdge <<<<');
  //console.dirobjectType);
  //console.log('~~~~~~~~~~~~~~');
	//console.dirrecordData);
  //console.log('~~~~~~~~~~~~~~');
  //console.dirsourceId);
  //console.log('~~~~~~~~~~~~~~');
  //console.dirtargetId);

	// Delete Edge
	var query = strUtil.format("delete edge from %s to %s where @class = '%s'", sourceId, targetId, objectType);
	//console.log('query:' + query);
	odb.db.query(query).then(function(results){
    //console.logresults);
		addEdge(objectType, recordData, sourceId, targetId, callback);
	}).catch(function(error){
	  console.error('Exception: ' + error); 
	  callback(error,null);   
  });
}

exports.addEdge = function(objectType, recordData, sourceId, targetId, callback) {

  console.log('>>>> addEdge <<<<');
  console.dir(objectType);
  console.log('~~~~~~~~~~~~~~');
  console.dir(recordData);
  console.log('~~~~~~~~~~~~~~');
  console.dir(sourceId);
  console.log('~~~~~~~~~~~~~~');
  console.dir(targetId);

	var fndProp = false;
	for(var propertyName in recordData) {
		fndProp = true;
	}
	console.log('^^^ fndProp:' + fndProp);

  recordData = util.prepareInboundData(objectType, recordData);

  console.log('prepare data:');
  console.dir(recordData);

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

exports.fetchGridRecords = function(objectType, gridFields, currentPage, pageSize, sortField, sortOrder, criteria, filters, schemas, callback) {

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
		//console.logprop);
		props += prop + ', ';
	}
	props = props.slice(0, -2);

  var skip = ((currentPage-1) * pageSize)

  var sortClause='';
  if(util.defined(sortField)) {
    var order = 'DESC';
    if(util.defined(sortField)) {
      sortClause = strUtil.format('order by %s %s',sortField, sortOrder);
    } else {
      sortClause = strUtil.format('order by %s',sortField);
    }
  }

  var filterClause = util.createFilterClause(filters, objectType);
  console.log('********filterClause:' + filterClause);

  var edgeFilterClause = util.createEdgeFilterClause(filters, schemas, objectType);
  console.log('********edgeFilterClause:' + edgeFilterClause);


	var query = strUtil.format("SELECT %s FROM %s %s SKIP %s LIMIT %s", props, objectType, sortClause, skip, pageSize);
  if(filterClause != '') {
    query = strUtil.format("SELECT %s FROM %s where %s %s SKIP %s LIMIT %s", props, objectType, filterClause, sortClause, skip, pageSize);
    if(edgeFilterClause != '')
    	query = strUtil.format("SELECT %s FROM %s where %s AND (%s) %s SKIP %s LIMIT %s", props, objectType, filterClause, edgeFilterClause, sortClause, skip, pageSize);
  } else {
  	if(edgeFilterClause != '')
  		query = strUtil.format("SELECT %s FROM %s where %s %s SKIP %s LIMIT %s", props, objectType, edgeFilterClause, sortClause, skip, pageSize);
  }

  if(util.defined(criteria,"length") && criteria.length > 0) {
    var whereClause = util.createWhereClause(criteria, objectType);
    var query = strUtil.format("SELECT %s FROM %s WHERE %s %s SKIP %s LIMIT %s", props, objectType, whereClause, sortClause, skip, pageSize);
    if(filterClause != '') {
      query = strUtil.format("SELECT %s FROM %s WHERE %s AND (%s) %s SKIP %s LIMIT %s", props, objectType, whereClause, filterClause, sortClause, skip, pageSize);
    }
  }
	console.log('query: ' + query);

	odb.db.query(query).then(function(records){

    records = util.prepareOutboundData(objectType, records);

    var query = strUtil.format("SELECT COUNT(*) as count FROM %s", objectType);
    if(filterClause != '') {
      query = strUtil.format("SELECT COUNT(*) as count FROM %s WHERE %s", objectType, filterClause);
	    if(edgeFilterClause != '')
	      query = strUtil.format("SELECT COUNT(*) as count FROM %s WHERE %s AND (%s)", objectType, filterClause, edgeFilterClause);
    } else if(edgeFilterClause != '') {
    	query = strUtil.format("SELECT COUNT(*) as count FROM %s WHERE %s", objectType, edgeFilterClause);
    }
    if(util.defined(criteria,"length") && criteria.length > 0) {
      var whereClause = util.createWhereClause(criteria, objectType);
      query = strUtil.format("SELECT COUNT(*) as count FROM %s WHERE %s", objectType, whereClause);
      if(filterClause != '') {
        query = strUtil.format("SELECT COUNT(*) as count FROM %s WHERE %s AND (%s)", objectType, whereClause, filterClause);
        if(edgeFilterClause != '')
	        query = strUtil.format("SELECT COUNT(*) as count FROM %s WHERE %s AND %s AND %s", objectType, whereClause, filterClause, edgeFilterClause);
      } else if(edgeFilterClause != '') {
      	query = strUtil.format("SELECT COUNT(*) as count FROM %s WHERE %s AND %s", objectType, whereClause, edgeFilterClause);
      }
    }
    
    console.log('query: ' + query);

    odb.db.query(query).then(function(ret){   

      console.log('ret: ' + ret);

      var retObj = {
        records: records,
        size: ret[0].count
      } 
      callback(null,retObj);
    });

	}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });
}

exports.fetchRecords = function(objectType, criteria, callback) {

  var whereClause = util.createWhereClause(criteria, objectType);
  var query = strUtil.format("SELECT FROM %s", objectType);
  if(whereClause != '') {
    query = strUtil.format("SELECT FROM %s where %s", objectType, whereClause);
  }
	

	odb.db.query(query).then(function(records){
    records = util.prepareOutboundData(objectType, records);
		callback(null,records);
	}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });
}

exports.findShortestPath = function(src, dest, callback) {

    var query = strUtil.format("select shortestPath(%s, %s)", src, dest);

	odb.db.query(query).then(function(records){
		callback(null,records);
	}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });
}


exports.findShortestPathFilter = function(src, dest, depth, callback) {


  var deep = 3;
	if(util.defined(depth) && depth > 0) {
		deep+=(depth*2);
	}

	var query = strUtil.format("traverse * from %s while $depth < %s and @rid in (select distinct(@rid) from(select expand($c) let $a = (select from (select expand(bothE()) from(select flatten(sp) from (select shortestPath(%s, %s,'BOTH') as sp))) where out in (select expand(sp) from (select shortestPath(%s,%s,'BOTH') as sp)) AND in in (select expand(sp) from (select shortestPath(%s,%s,'BOTH') as sp))), $b = (select expand(sp) from (select shortestPath(%s,%s,'BOTH') as sp)), $c = unionAll( $a, $b )))", src, deep, src,dest,src,dest,src,dest,src,dest);
	console.log('*******' + query);

  odb.db.query(query).then(function(recordDetails){
    
    //var recordDetails = _.union(records1,records2);
		var returnObj = {};
		for (var i = 0; i < recordDetails.length; i++) {
		  var obj = recordDetails[i];
		  var className = obj['@class'];

		  ////console.log('** Class:' + className);

		  if (!util.defined(returnObj, className)) {
		    returnObj[className] = [];
		  }

		  var props = {};
		  for (var propertyName in obj) {

		    //console.log('** propertyName:' + propertyName);

		    if (propertyName != 'in' && propertyName.indexOf('in_') == -1 && propertyName != 'out' && propertyName.indexOf('out_') == -1 && propertyName.indexOf('@') != 0 && propertyName != 'id' && propertyName != 'backup' && typeof propertyName != 'object' && typeof propertyName != 'array') {
		      //console.log('>>Add');
		      props[propertyName] = obj[propertyName];
		    } else if (propertyName.indexOf('@rid') == 0) {
		      //console.log('>>Add');
		      var idobj = obj[propertyName];
		      props.id = '#' + idobj.cluster + ':' + idobj.position;
		    } else if (propertyName.indexOf('in') == 0 && propertyName.indexOf('_') != 0) {

		      //console.log('>>Add');
		      //console.log('** IN:');

		      var inobj = obj[propertyName];
		      var inprops = {};
		      for (var propertyName in inobj) {

		        ////console.log('** IN propertyName:' + propertyName);

		        if (propertyName.indexOf('in') != 0 && propertyName.indexOf('out') != 0 && propertyName.indexOf('@') != 0 && propertyName != 'id' && propertyName != 'backup' && typeof propertyName != 'object' && typeof propertyName != 'array') {
		          inprops[propertyName] = inobj[propertyName];
		          ////console.log('>>Add In' + inprops[propertyName]);

		        } else if (propertyName.indexOf('@rid') == 0) {
		          var idobj = inobj[propertyName];
		          inprops.inId = '#' + idobj.cluster + ':' + idobj.position;
		          ////console.log('>>Add In' + inprops.inId);
		        }
		      }
		      ////console.log('** IN OBJ DONE:');
		      ////console.dirinprops)
		      props['in'] = inprops;
		    } else if (propertyName.indexOf('out') == 0 && propertyName.indexOf('_') != 0) {

		      ////console.log('>>Add');
		      ////console.log('** IN:');

		      var outobj = obj[propertyName];
		      var outprops = {};
		      for (var propertyName in outobj) {
		        if (propertyName.indexOf('in') != 0 && propertyName.indexOf('out') != 0 && propertyName.indexOf('@') != 0 && propertyName != 'id' && propertyName != 'backup' && typeof propertyName != 'object' && typeof propertyName != 'array') {
		          outprops[propertyName] = outobj[propertyName];
		        } else if (propertyName.indexOf('@rid') == 0) {
		          var idobj = outobj[propertyName];
		          outprops.outId = '#' + idobj.cluster + ':' + idobj.position;
		        }
		      }

		      //console.log('** OUT OBJ:');
		      //console.diroutprops)
		      props['out'] = outprops;
		    }
		  }
		  returnObj[className].push(props);
		}
		callback(null,returnObj);

  }).catch(function(error){
    console.error('Exception: ' + error); 
    callback(error,null);   
  });
}



exports.getRecordDetails = function(objectType, recordId, depth, filters, searchTerms, schemas, search, callback) {

	var deep = 3;
	if(util.defined(depth) && depth > 0) {
		deep+=(depth*2);
	}

  var whereClause = '';
  var whereSearchClause = '';
  var whereCnt=0;

  var filterCnt=0;

  var hideCnt=0;

  for(var propertyName in util.schemas) {
    console.log('util.schemas:'+ propertyName);

    var showObject = true;
    if(util.defined(schemas,"length")) {
      var fndSchema = _.findWhere(schemas,  {objectType : propertyName})
      if(util.defined(fndSchema,"selected")) {
        console.log('fndSchema:'+ fndSchema.selected);
        if(fndSchema.selected == false) {
          showObject = fndSchema.selected;
          hideCnt++;
        }
      }
    }

    if(showObject) {
	    var fndFilters = util.whereProp(filters, 'objectType', propertyName);
	    //console.log('fndFilters:' + fndFilters);
	    //console.dir(fndFilters);
	    var fndFilterCnt=0;
	    var filterClause = '';
	    _.each(fndFilters, function(fnd) {
		    if(util.defined(fnd,"filters.length") && fnd.filters.length > 0) {
		    	console.log('``````' + util.arrayToList(fnd.filters));
		    	fndFilterCnt++;
		      if(filterCnt == 0)
		          filterClause = strUtil.format("%s matches '.*(%s).*'", fnd.fieldName, util.arrayToList(fnd.filters));
		      else filterClause += strUtil.format(" or %s matches '.*(%s).*'", fnd.fieldName, util.arrayToList(fnd.filters));
		      filterCnt++;
		    } else {
		      
		    }
	    });
	    console.log('filterClause:' + filterClause)
			if(search) {

				if(filterClause != '') {

					if(whereSearchClause=='')
						whereSearchClause = strUtil.format("(@rid in (select @rid from %s where %s))", propertyName, filterClause);
					else whereSearchClause += strUtil.format(" or (@rid in (select @rid from %s where %s))", propertyName, filterClause);
				
				} else {

					if(whereCnt==0)
						whereClause = strUtil.format("@class = '%s'", propertyName);
					whereClause = whereClause + strUtil.format(" or @class = '%s'", propertyName);

				}

				console.log('whereSearchClause:' + whereSearchClause)

			} else {

		    if(fndFilterCnt == 0) {
					if(whereCnt==0)
			        whereClause = strUtil.format("@class = '%s'", propertyName);
			    whereClause = whereClause + strUtil.format(" or @class = '%s'", propertyName);
			           
		    } else {

					if(whereCnt==0)
			        whereClause = strUtil.format("(@class = '%s' and %s)", propertyName, filterClause);
			    whereClause = whereClause + strUtil.format(" or (@class = '%s' and %s)", propertyName, filterClause);
		    }


			}

	    whereCnt++;
    }
  }

	console.log('whereClause:' + whereClause)
	

  var query = strUtil.format("traverse * from  %s while $depth < %s", recordId, deep);

  if(search) {

  	query = strUtil.format("select from (%s) where %s", query, whereSearchClause);

  } else {

 	  if(whereClause.length > 0 || hideCnt > 0) {

	    if(whereClause.length > 0) {
	      query += " and (" + whereClause + ")";
	    }      

	  }

	  if(util.defined(searchTerms)) {
	    query = "select from (" + query + ") where any() like " + "'%" + searchTerms + "%'"
	  }

    //var subquery = strUtil.format("select shortestPath(%s, %s)", recordId, '#40:177');
    //query = strUtil.format("select expand(sp) from (select shortestPath(#16:6,#39:0,'BOTH') as sp)");
    

 }

	console.log("query: " + query);

	odb.db.query(query).then(function(recordDetails){

		//console.log('** traverse **');
		//console.dirrecordDetails);

   var returnObj = {};
   for(var i=0; i<recordDetails.length; i++) {
			var obj = recordDetails[i];
			var className = obj['@class'];

			////console.log('** Class:' + className);

			if(!util.defined(returnObj,className)) {
				returnObj[className]=[];
			}

			var props={};
			for(var propertyName in obj) {

				//console.log('** propertyName:' + propertyName);

				if(propertyName != 'in' && propertyName.indexOf('in_') == -1 && propertyName != 'out' && propertyName.indexOf('out_') == -1 && propertyName.indexOf('@') != 0 && propertyName != 'id' && propertyName != 'backup' && typeof propertyName != 'object' && typeof propertyName != 'array') {					
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
						
						////console.log('** IN propertyName:' + propertyName);

						if(propertyName.indexOf('in') != 0 && propertyName.indexOf('out') != 0 && propertyName.indexOf('@') != 0 && propertyName != 'id' && propertyName != 'backup' && typeof propertyName != 'object' && typeof propertyName != 'array') {
							inprops[propertyName] = inobj[propertyName];
							////console.log('>>Add In' + inprops[propertyName]);

						} else if(propertyName.indexOf('@rid') == 0) {
							var idobj = inobj[propertyName];
							inprops.inId = '#' + idobj.cluster + ':' + idobj.position;
							////console.log('>>Add In' + inprops.inId);
						}
					}
					////console.log('** IN OBJ DONE:');
					////console.dirinprops)
					props['in'] = inprops;
				} else if(propertyName.indexOf('out') == 0 && propertyName.indexOf('_') != 0) {

					////console.log('>>Add');
					////console.log('** IN:');

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
					//console.diroutprops)
					props['out'] = outprops;
				}
			}
			returnObj[className].push(props);
   }
   callback(null,returnObj);
	}).catch(function(error){
    console.error('Exception: ' + error); 
    callback(error,null);   
  });
}

exports.addRecord = function(objectType, panelRecord, callback) {
	// var updateObj = {};
	// for(var propertyName in panelRecord) {
	// 	if(propertyName.indexOf('@') == -1 && propertyName != 'id' && propertyName != 'backup' && util.defined(panelRecord,propertyName) && panelRecord[propertyName].length > 0) {
	// 		updateObj[propertyName] = panelRecord[propertyName];
	// 	}
	// }

  //console.log('** addRecord **');
  //console.dirpanelRecord);

	var panelRecord = util.prepareInboundData(objectType, panelRecord);

	odb.db.insert().into(objectType)
   .set(panelRecord).all().then(function(returnObj){
      callback(null, returnObj);
   }).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });
}


exports.updateRecord = function(objectType, recordId, panelRecord, callback) {

  //console.log('** addRecord **');
  //console.dirpanelRecord);

	// var updateObj = {};
	// var rid = panelRecord['@rid'];
	// for(var propertyName in panelRecord) {
	// 	var val = updateObj[propertyName];
	// 	if(propertyName.indexOf('@') == -1 && propertyName != 'id' && propertyName != 'backup' && util.defined(panelRecord,propertyName)) {
	// 		updateObj[propertyName] = panelRecord[propertyName];
	// 	}
	// }
  panelRecord = util.prepareInboundData(objectType, panelRecord);

	odb.db.update(recordId)
   .set(panelRecord).one()
   .then(
      function(update){
         callback(null, update);
      }
   ).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });
}

exports.deleteRecord = function(objectType, recordId, callback) {
	odb.db.record.delete(recordId);
	callback(null, true);
}


exports.getRecord = function(objectType, id, callback) {

  var query = strUtil.format("SELECT FROM %s where @rid = '%s'", objectType, id);
  //console.logquery);
  
  odb.db.query(query).then(function(records){
    // var recs=[];
    // for(var i=0; i<records.length; i++) {
    //   var rec = records[i];
    //   var recId = rec['@rid'];
    //   rec.id = '#'+ recId.cluster + ':' + recId.position;
    //   recs.push(rec);
    // }
    records = util.prepareOutboundData(objectType, records);
    callback(null,records);
  }).catch(function(error){
      console.error('Exception: ' + error); 
      callback(error,null);   
  });
}


exports.getRecords = function(objectType, currentPage, pageSize, callback) {

  var skip = ((currentPage-1) * pageSize)

	var query = strUtil.format("SELECT FROM %s SKIP %s LIMIT %s", objectType, skip, pageSize);

	odb.db.query(query).then(function(records){
		// var recs=[];
		// for(var i=0; i<records.length; i++) {
		// 	var rec = records[i];
		// 	var recId = rec['@rid'];
		// 	rec.id = '#'+	recId.cluster + ':' + recId.position;
		// 	recs.push(rec);
		// }
    records = util.prepareOutboundData(objectType, records);
    var recs = records;
    var query = strUtil.format("SELECT COUNT(*) as count FROM %s", objectType);
    odb.db.query(query).then(function(records){   
    var retObj = {
      records: recs,
      size: records[0].count
    } 
		  callback(null,retObj);
    });
	}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });
}

exports.getSchema = function(objName, callback) {

	//console.log('^^^^^^^^^ getSchema ^^^^^^^^^^^' + objName);
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
	        //console.log('^^^^^^^^^ props ^^^^^^^^^^^' + objName);
	        ////console.dirprops);

	        if(util.defined(props,"superClass")) {

						odb.db.class.get(props.superClass).then(function(obj){
							obj.property.list()
							.then(
							function(properties){	        	
								var subProps=getSchemaProperties(properties);
								//console.log('^^^^^^^^^ subProps ^^^^^^^^^^^' + props.superClass);
								////console.dirsubProps);

								for(var propertyName in subProps) {
									props[propertyName] = subProps[propertyName];
								}
								//console.log('^^^^^^^^^ final props ^^^^^^^^^^^');
								////console.dirprops);
								delete props.superClass;
								callback(null,props);	        	
							});
						});
	        } else {
	        	callback(null,props);
	        }
	      }
	    );
	}).catch(function(error){
	    console.error('Exception: ' + error); 
	    callback(error,null);   
  });
}