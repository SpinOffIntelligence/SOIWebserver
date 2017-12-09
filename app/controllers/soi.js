'use strict';

var odb = require('../../components/orientdb.js');
var soiServices = require('../services/soi');
var async = require('async');
var util = require('../../components/utilities.js');
var moment = require('moment');

exports.accountRegister = function(req, res, next) {
	var fname = req.body.fname;
	var lname = req.body.lname;
	var email = req.body.email
	var password = req.body.password;

	console.log('*** accountRegister ***');
	console.dir(fname);
	console.log('~~~~~~~~~~~~~~');
	console.dir(lname);
	console.log('~~~~~~~~~~~~~~');
	console.dir(email);
	console.log('~~~~~~~~~~~~~~');
	console.dir(password);
	
	soiServices.accountSearch(email, function(err, records) {
		console.log('accountSearch:' + records.length);
		if(!util.defined(records,"length") || records.length == 0) {
			soiServices.accountRegister(fname, lname, email, password, function(err, records) {
				res.json({status: 200, resp:'Account Created', record: records[0]});
			});
		} else {
			res.json({status: 500, resp:'Account Exists'});
		}
	});
}

exports.accountLogin = function(req, res, next) {
	var email = req.body.email
	var password = req.body.password;

	console.log('*** accountLogin ***');
	console.dir(email);
	console.log('~~~~~~~~~~~~~~');
	console.dir(password);

	soiServices.accountLogin(email, password, function(err, records) {
		console.log('accountLogin:' + records.length);
		if(util.defined(records,"length") && records.length > 0) {
			records[0].password=null;
			records[0].token = util.token();
			
			
			soiServices.accountSetToken(records[0]['@rid'], records[0].token, function(err, records) {
			});

   		res.json({status: 200, resp:'Login Worked', record: records[0]});
		} else {
			res.json({status: 500, resp:'Login Failed'});
		}
	});
}

exports.accountForgot = function(req, res, next) {
	var email = req.body.email

	console.log('*** accountForgot ***');
	console.dir(email);

	soiServices.accountSearch(email, function(err, records) {
		console.log('accountSearch:' + records.length);
		if(util.defined(records,"length") && records.length > 0) {
				res.json({status: 200, resp:'Email Sent'});
		} else {
			res.json({status: 404, resp:'Account Not Found'});
		}
	});

}

exports.accountUpdateProfile = function(req, res, next) {
	var fname = req.body.fname;
	var lname = req.body.lname;
	var email = req.body.email
	var password = req.body.password;

	console.log('*** accountRegister ***');
	console.dir(fname);
	console.log('~~~~~~~~~~~~~~');
	console.dir(lname);
	console.log('~~~~~~~~~~~~~~');
	console.dir(email);
	console.log('~~~~~~~~~~~~~~');
	console.dir(password);
	
	soiServices.accountSearch(email, function(err, records) {
		console.log('accountSearch:' + records.length);
		if(util.defined(records,"length") && records.length > 0) {

			console.log('record:');
			console.dir(records[0]);

			soiServices.accountUpdateProfile(records[0]['@rid'], fname, lname, email, password, function(err, data) {
				if(data == 1) {
					res.json({status: 200, resp:'Account Update Successful', record: data});
				} else {
					res.json({status: 500, resp:'Account Update Faild', record: data});
				}
					
			});
		} else {
			res.json({status: 404, resp:'Account Not Found'});
		}
	});
}


exports.searchRecords = function(req, res, next) {
	var objectTypes = req.body.objectTypes;
	var terms = req.body.terms;
	var notSearchTerms = req.body.notSearchTerms
	var filters = req.body.filters;

	console.log('*** searchRecords ***');
	console.dir(objectTypes);
	console.log('~~~~~~~~~~~~~~');
	console.dir(terms);
	console.log('~~~~~~~~~~~~~~');
	console.dir(notSearchTerms);
	console.log('~~~~~~~~~~~~~~');
	console.dir(filters);

	soiServices.searchRecords(objectTypes, terms, notSearchTerms, filters, function(err, data) {
		res.json(data);
	});
}

exports.deletePickListItem = function(req, res, next) {
	var typeName = req.body.typeName;
	var itemId = req.body.itemId;

	//console.log('*** deletePickListItem ***');
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(typeName);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(itemId);

	soiServices.removePickListItem(typeName, itemId, function(err, data) {
		if(util.defined(err)) {
			var retObj = {
				err: err
			};
			res.json(retObj);			
			return;
		}		
		res.json(null, 200);			
		return;
	});
}

exports.savePickListValues = function(req, res, next) {
	var saveValues = req.body.saveValues;
	var typeName = req.body.typeName;

	//console.log('*** savePickListValues ***');
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(saveValues);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(typeName);

	soiServices.removePickListValues(typeName, function(err, data) {

		if(util.defined(err)) {
			var retObj = {
				err: err
			};
			res.json(retObj);			
			return;
		}

		for(var i=0; i<saveValues.length; i++) {
			var errSave = null;
			var val = saveValues[i];
			if(util.defined(val,'name')) {
				//console.logval.name);
				soiServices.addPickListValue(typeName, val.name, val.description, val.color, function(err, data) {
					//console.log('Return:' + data);
					if(util.defined(err))
						errSave = err;
				});			
			}
		}
		var retObj = {
			err: errSave
		};
		res.json(retObj);
	});

}

exports.addPickListValues = function(req, res, next) {
	var addValues = req.body.addValues;
	var typeName = req.body.typeName;

	//console.log('*** addPickListValues ***');
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(addValues);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(typeName);

	for(var i=0; i<addValues.length; i++) {
		var errSave = null;
		var val = addValues[i];
		if(util.defined(val,'name')) {
			//console.logval.name);
			soiServices.addPickListValue(typeName, val.name, val.description, function(err, data) {
				//console.log('Return:' + data);
				if(util.defined(err))
					errSave = err;
			});			
		}
	}
	var retObj = {
		err: errSave
	};
	res.json(retObj);
}

exports.getPickListValues = function(req, res, next) {

	//console.log('*** getPickListValues ***');

	soiServices.getPickListValues(function(err, data) {
		res.json(data);
	});
}


exports.removeImage = function(req, res, next) {
	var objectType = req.body.objectType;
	var recordId = req.body.recordId;
	var field = req.body.field;

	//console.log('*** removeImage ***');
	//console.dir(objectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(recordId);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(field);

	soiServices.removeImage(objectType, recordId, field, function(err, data) {
		res.json(data);
	});
}

exports.fetchGridRecords = function(req, res, next) {
	var objectType = req.body.objectType;
	var gridFields = req.body.gridFields;
	var currentPage = req.body.currentPage;
	var pageSize = req.body.pageSize;
	var sortField = req.body.sortField;
	var sortOrder = req.body.sortOrder;
	var criteria = req.body.criteria;
	var filters = req.body.filters;
	var schemas = req.body.schemas;

	console.log('*** fetchGridRecords ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	// console.dir(gridFields);
	// console.log('~~~~~~~~~~~~~~');
	// console.dir(currentPage);
	// console.log('~~~~~~~~~~~~~~');
	// console.dir(pageSize);
	// console.log('~~~~~~~~~~~~~~');
	// console.dir(sortField);
	// console.log('~~~~~~~~~~~~~~');
	// console.dir(sortOrder);
	// console.log('~~~~~~~~~~~~~~');
	// console.dir(criteria);
	// console.log('~~~~~~~~~~~~~~');
	// console.dir(filters);
	// console.log('~~~~~~~~~~~~~~');
	// console.dir(schemas);

	soiServices.fetchGridRecords(objectType, gridFields, currentPage, pageSize, sortField, sortOrder, criteria, filters, schemas, function(err, data) {
		res.json(data);
	});
}


exports.getSchemasServer = function(callback) {
  var schemas = [ 
  { objectType: 'EAcquired' },
  { objectType: 'EEntrepreneurialResourcesProvider' },
  { objectType: 'EAcquire' },
  { objectType: 'EBoardMember' },
  { objectType: 'EAdvisor' },
  { objectType: 'EFunded' },
  { objectType: 'EInvestor' },
  { objectType: 'ECoApplicant' },
  { objectType: 'EApplicant' },
  { objectType: 'EInventor' },
  { objectType: 'EPartner' },
  { objectType: 'EFounded' },
  { objectType: 'ESpinOff' },
  { objectType: 'ETeaches' },
  { objectType: 'EWorksfor' },
	{ objectType: 'EMediaTarget' },  
  { objectType: 'VInvestment' },
  { objectType: 'VPatent' },
  { objectType: 'VInvestmentFirm' },
  { objectType: 'VCompany' },
  { objectType: 'VSpinOff' },
  { objectType: 'VResearchInstitution' },
  { objectType: 'VPerson' },
  { objectType: 'VMedia' },
  { objectType: 'VEntrepreneurialResource' },
   ];

	//console.log('*** getSchemasServer ***');
	//console.dir(schemas);  

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

		//console.log('*** getSchemasServer done ***');
		////console.dir(returnObj);  


    callback(null, returnObj);
	});

}


exports.getSchemas = function(req, res, next) {
	var schemas = req.body.schemas
	var token = req.body.token

	console.log('*** getSchemas ***');
	console.dir(schemas);
	console.log('~~~~~~~~~~~~~~');
	console.dir(token);

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

	//console.log('*** getEdge ***');
	//console.dir(edgeObjectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(recordItemId);

	soiServices.getRelationship(edgeObjectType, recordItemId, function(err, data) {
		res.json(data);
	});	
}


exports.getRelationshipDetails = function(req, res, next) {
	var edgeObjectType = req.body.edgeObjectType;
	var recordItemId = req.body.recordItemId;

	//console.log('*** getRelationshipDetails ***');
	//console.dir(edgeObjectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(recordItemId);

	soiServices.getRelationshipDetails(edgeObjectType, recordItemId, function(err, data) {
		res.json(data);
	});
}

exports.getEdge = function(req, res, next) {
	var edgeObjectType = req.body.edgeObjectType;
	var edgeRecordItemId = req.body.edgeRecordItemId;

	//console.log('*** getEdge ***');
	//console.dir(edgeObjectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(edgeRecordItemId);

	soiServices.getEdge(edgeObjectType, edgeRecordItemId, function(err, data) {
		res.json(data);
	});
}


exports.getEdgeBySource = function(req, res, next) {
	var edgeObjectType = req.body.edgeObjectType;
	var recordItemId = req.body.recordItemId;

	//console.log('*** getEdge ***');
	//console.dir(edgeObjectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(recordItemId);

	soiServices.getEdgeBySource(edgeObjectType, recordItemId, function(err, data) {
		res.json(data);
	});
}

exports.deleteEdge = function(req, res, next) {
	var objectType = req.body.objectType;
	var sourceId = req.body.sourceId;
	var targetId = req.body.targetId;

	//console.log('*** updateEdge ***');
	//console.dir(objectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(sourceId);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(targetId);

	soiServices.deleteEdge(objectType, sourceId, targetId, function(err, data) {
		res.json(data);
	});
}

exports.updateEdge = function(req, res, next) {
	var objectType = req.body.objectType;
	var recordData = req.body.recordData;
	var sourceId = req.body.sourceId;
	var targetId = req.body.targetId;

	//console.log('*** updateEdge ***');
	//console.dir(objectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(recordData);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(sourceId);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(targetId);

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


	//console.log('*** fetchRecords ***');
	//console.dir(objectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(prop);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(value);

	soiServices.fetchRecordByProp(objectType, prop, value, function(err, data) {
		res.json(data);
	});
}


exports.fetchRecords = function(req, res, next) {
	var objectType = req.body.objectType;
	var criteria = req.body.criteria;

	//console.log('*** fetchRecords ***');
	//console.dir(objectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(criteria);

	soiServices.fetchRecords(objectType, criteria, function(err, data) {
		res.json(data);
	});
}


exports.findShortestPathDetail = function(req, res, next) {
	var src = req.body.src;
	var dest = req.body.dest;
	var mode = req.body.mode;

	console.log('*** findShortestPathDetail ***');
	console.dir(src);
	console.log('~~~~~~~~~~~~~~');
	console.dir(dest);
	console.log('~~~~~~~~~~~~~~');
	console.dir(mode);

	soiServices.findShortestPathDetail(src, dest, mode, function(err, data) {
		res.json(data);
	});
}

exports.findShortestPath = function(req, res, next) {
	var src = req.body.src;
	var dest = req.body.dest;
	var mode = req.body.mode;

	console.log('*** findShortestPath ***');
	console.dir(src);
	console.log('~~~~~~~~~~~~~~');
	console.dir(dest);
	console.log('~~~~~~~~~~~~~~');
	console.dir(mode);

	soiServices.findShortestPath(src, dest, mode, function(err, data) {
		res.json(data);
	});
}

exports.findShortestPathFilter = function(req, res, next) {
	var src = req.body.src;
	var dest = req.body.dest;
	var depth = req.body.depth;
	var mode = req.body.mode;

	console.log('*** findShortestPathFilter ***');
	console.dir(src);
	console.log('~~~~~~~~~~~~~~');
	console.dir(dest);
	console.log('~~~~~~~~~~~~~~');
	console.dir(depth);
	console.log('~~~~~~~~~~~~~~');
	console.dir(mode);

	soiServices.findShortestPathFilter(src, dest, depth, mode, function(err, data) {
		res.json(data);
	});
}



exports.getRecordDetails = function(req, res, next) {
	var objectType = req.body.objectType;
	var recordId = req.body.recordId;
	var depth = req.body.depth;
	var filters = req.body.filters;
	var searchTerms = req.body.searchTerms;
	var schemas = req.body.schemas
	var search = req.body.search

	console.log('*** getRecordDetails ***');
	//console.dir(objectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(recordId);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(depth);
	// console.log('~~~~~~~~~~~~~~');
	// console.dir(filters);
	// console.log('~~~~~~~~~~~~~~');
	// console.dir(searchTerms);
	// console.log('~~~~~~~~~~~~~~');
	// console.dir(schemas);
	console.log('~~~~~~~~~~~~~~');
	console.dir(search);


	soiServices.getRecordDetails(objectType, recordId, depth, filters, searchTerms, schemas, search, function(err, data) {
		res.json(data);
	});
}

exports.addPanelRecord = function(req, res, next) {
	var objectType = req.body.objectType;
	var panelRecord = req.body.panelRecord;

	//console.log('*** addPanelRecord ***');
	//console.dir(objectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(panelRecord);

	soiServices.addRecord(objectType, panelRecord, function(err, data) {
		res.json(data);
	});
}

exports.updatePanelRecord = function(req, res, next) {
	var objectType = req.body.objectType;
	var recordId = req.body.recordId;
	var panelRecord = req.body.panelRecord;
	var isAdmin = res.locals.isAdmin;

	console.log('*** updatePanelRecord ***');
	console.dir(objectType);
	console.log('~~~~~~~~~~~~~~');
	console.dir(recordId);
	console.log('~~~~~~~~~~~~~~');
	console.dir(panelRecord);
	console.log('~~~~~~~~~~~~~~');
	console.dir(isAdmin);

	if(!util.defined(isAdmin) || isAdmin != true) {
		res.send(401);
		return;
	}

	soiServices.updateRecord(objectType, recordId, panelRecord, function(err, data) {
		res.json(data);
	});
}

exports.deletePanelRecord = function(req, res, next) {
	var objectType = req.body.objectType;
	var recordId = req.body.recordId;

	//console.log('*** deletePanelRecord ***');
	//console.dir(objectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(recordId);

	soiServices.deleteRecord(objectType, recordId, function(err, data) {
		res.json(data);
	});
}

exports.fetchPanelRecord = function(req, res, next) {
	var objectType = req.body.objectType;
	var schema = req.body.schema;
	var id = req.body.id;

	//console.log('*** fetchPanelRecord ***');
	//console.dir(objectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(schema);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(id);

	soiServices.getRecord(objectType, id, function(err, data) {
		res.json(data);
	});
}

exports.fetchPanelRecords = function(req, res, next) {
	var objectType = req.body.objectType;
	var schema = req.body.schema;
	var currentPage = req.body.currentPage;
	var pageSize = req.body.pageSize;

	//console.log('*** fetchPanelRecords ***');
	//console.dir(objectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(schema);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(currentPage);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(pageSize);

	soiServices.getRecords(objectType, currentPage, pageSize, function(err, data) {
		res.json(data);
	});
}

exports.exportRecords = function(req, res, next) {

	var objectType = req.body.objectType;
	var criteria = req.body.criteria;
	var schema = req.body.schema;

	//console.log('*** exportRecords ***');
	//console.dir(objectType);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(criteria);
	//console.log('~~~~~~~~~~~~~~');
	//console.dir(schema);

	soiServices.exportRecords(objectType, criteria, schema, function(err, records) {
		var strInfo;
		if(util.defined(err)) {
			//console.log('Error Exporting:' + err);
			strInfo = 'Error Exporting:' + err;
			util.logInfo('Export', 'n/a', strInfo);
		} else {
			//console.log('Exporting:' + records);	
			strInfo = 'Exporting: ' + objectType + ':' + records.length;
			util.logInfo('Export', 'n/a', strInfo);	
			res.json({error_code:0,err_desc:null,strLog: strInfo, file: 'n/a', exportData: records});			
		}
	});	
}

exports.deleteLogInfo = function(req, res, next) {

	var file = req.body.file;
	//console.log('*** getLogInfo ***');
	//console.dir(file);
	soiServices.deleteLogInfo(file, function(err, data) {
		res.json(data);
	});	
}

exports.getLogInfo = function(req, res, next) {

	//console.log('*** getLogInfo ***');
	if(util.defined(req,"body.file")) {
		var file = req.body.file;
		//console.dir(file);
		soiServices.getLogInfo(file, function(err, data) {
			res.json(data);
		});	
	} else {
		soiServices.getAllLogInfo(function(err, data) {
			res.json(data);
		});	

	}
}

exports.importStats = function(req, res, next) {
	var dataStr = req.body.dataStr;

	console.log('****');
	console.dir(req.body);

	// soiServices.importStats(objectTypes, terms, function(err, data) {
	// 	res.json(data);
	// });
}
