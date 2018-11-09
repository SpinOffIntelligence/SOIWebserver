var config = require('./config');
var path = require('path');
var strUtil = require('util');
var util = require('../components/utilities.js');
var bodyParser = require('body-parser');
var multer = require('multer');
var readline = require('readline');
var fs = require('fs');
var odb = require('../components/orientdb.js');
var _ = require('underscore');
var soiServices = require('../app/services/soi');
var csv = require('csv-parser');
var moment = require('moment');

module.exports = function(app,express){

	//app.use(express.compress());
	var SecurityProxy = function(req, res, next) {

		var Response = res;
		console.log('req.url:',req.url);
		console.log(req.url.indexOf('\/soi\/'));

		if(req.url.indexOf('\/soi\/') == -1) {
			express.static(path.join(__dirname, '../public'), {index:false, redirect:false})(req, res, next);
			return;
		}
			


		if(util.defined(req,"headers.cookie")) {
			//console.log(req.headers.cookie);
			var strUserSession = util.getCookie('userSession',req.headers.cookie);
			//console.log(strUserSession);
			if(util.defined(strUserSession)) {
				var userSession = JSON.parse(strUserSession);
				console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
				console.log(userSession.token);
				console.log(userSession.email);
				console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

				_that = this;
				soiServices.accountSearch(userSession.email, function(err, records) {
					if(records.length > 0) {
						var userRec = records[0];
						console.dir(userRec);
						if(util.defined(userRec,"token")) {
							if(userRec.token != userSession.token) {
								console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
								console.log('TIMEOUT');
								console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');		
								Response.send(401);
							} else {
				        var recId = userRec['@rid'];
				        strRecId = '#' + recId.cluster + ':' + recId.position;							
								//soiServices.accountSetToken(strRecId, userRec.token, function(err, records) {
								//});

								if(util.defined(userRec,"rights") && userRec.rights == 'Full Admin') {
									res.locals = {};
									res.locals.isAdmin = true;									
								}
								next();
							}
						} else {
							express.static(path.join(__dirname, '../public'), {index:false, redirect:false})(req, res, next);
						}
					} else {
						express.static(path.join(__dirname, '../public'), {index:false, redirect:false})(req, res, next);
					}
				})
			}
		} else {
			express.static(path.join(__dirname, '../public'), {index:false, redirect:false})(req, res, next);	
		}

		
	}

  app.use(SecurityProxy);
	app.use("/www", express.static(path.join(__dirname, '../public')));
	app.use("/soiapp", express.static(path.join(__dirname, '../../soiapp')));
	app.use("/dev", express.static(path.join(__dirname, '../../../dev')));
	

	// New call to compress content
	app.use(bodyParser.json());  

  function getSourceTargetID(objectTypeSource, objectTypeTarget, sourceId, targetId, callback) {

		soiServices.fetchRecordByName(objectTypeSource, sourceId, function(err, records) {
			if(records.length == 0) {
				err = strUtil.format("Source name %s not found!", sourceId);
				callback(err,null);
			} else if(records.length > 1) {
				err = strUtil.format("Source name %s not unique!", sourceId);
				callback(err,null);
			} else {
				var rec = records[0];
				if(util.defined(rec,'@rid')) {
					var sourceRecId = records[0]['@rid'];
					console.log('sourceRecId:' + sourceRecId);
					soiServices.fetchRecordByName(objectTypeTarget, targetId, function(err, records) {
						if(records.length == 0) {
							err = strUtil.format("Target name %s not found!", targetId);
							callback(err,null);
						} else if(records.length > 1) {
							err = strUtil.format("Target name %s not unique!", targetId);
							callback(err,null);
						} else {
							var rec = records[0];
							if(util.defined(rec,'@rid')) {
								var targetRecId = records[0]['@rid'];
								console.log('targetRecId:' + targetRecId);
								var retObj = {
									sourceRecId: sourceRecId,
									targetRecId: targetRecId
								};
								callback(null, retObj);
							}
						}
					});
				}
			}
		});
  }


  app.post('/uploadImage', function(req, res) {

	  var storage = multer.diskStorage({ //multers disk storage settings
	      destination: function (req, file, cb) {
	          cb(null, './public/logos');
	      },
	      filename: function (req, file, cb) {
	          var datetimestamp = Date.now();
	          cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
	      }
	  });

	  var upload = multer({ //multer settings
			storage: storage
		}).single('file');

		upload(req,res,function(err){

			var formData = req.body.formData;
			var filePath = res.req.file.path;

			console.dir(filePath);

			console.log('Upload Image: ');
			console.dir(filePath);

			var idx = filePath.lastIndexOf("\\");
			if(idx == -1) {
				var idx = filePath.lastIndexOf("/");
			}
			var file = filePath.substring(idx+1, filePath.length)

			console.log('**** File: ' + file);

			soiServices.setRecordImage(formData.objectType, formData.logoField, formData.id, file, function(err, data) {
				res.json({error_code: 0, file: res.req.file.path});
				return;
			})
		});
  });


  /** API path that will upload the files */
  app.post('/upload', function(req, res) {

	  var storage = multer.diskStorage({ //multers disk storage settings
	      destination: function (req, file, cb) {
	          cb(null, './uploads/');
	      },
	      filename: function (req, file, cb) {
	          var datetimestamp = Date.now();
	          cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
	      }
	  });

	  var upload = multer({ //multer settings
	                  storage: storage
	              }).single('file');


    upload(req,res,function(err){
		
		if(err){
		   res.json({error_code:1,err_desc:err});
		   return;
		}
		console.log('Body:');
		console.dir(req.body);

		var schemas = req.body.schemas;

    if(util.defined(req,"body.formData")) {
			var formData = req.body.formData;

			console.dir(res.req.file.path);

			//var array = fs.readFileSync(res.req.file.path).toString().split("\r\n");
			var lineNum=0;
			var mode=formData.mode;
			var objectType=formData.objectType;
			var objectTypeSource=formData.sourceObjectType;
			var objectTypeTarget=formData.targetObjectType;
			
			console.log('mode:'+mode);
			console.log('objectType:'+objectType);
			console.log('objectTypeSource:'+objectTypeSource);
			console.log('objectTypeTarget:'+objectTypeTarget);
			
			var isEdge=false;
			var arrProp=null;
			var numProp=0;
			var arrSaveLines=[];
			var err=null;	

			if(objectType[0] == 'E') {
				isEdge=true;
				console.log('Is Edge!');
			}

			var idField;
			if(mode == 'update' || mode == 'delete') {
				idField = formData.idObjField;
				console.log('Update/Delete ID Field: ' + idField);
			}

			var file = res.req.file.path;
			var processInfo = [];
			var strInfo;

			fs.createReadStream(file).pipe(csv()).on('data', function (lineData) {

				console.log('****Line of data:');
				console.dir(lineData);
				var processInfoLine = {
					lineData: lineData
				};

					
				if(isEdge && !lineData.hasOwnProperty('sourceid')) {
					err='Header sourceid missing!';
					strInfo = 'Error on line ' + lineNum + ':' + err;
					util.logInfo(mode, file, strInfo);	
					res.json({error_code:2,err_desc:err});
					return;
				} else if(isEdge &&  !lineData.hasOwnProperty('targetid')) {
					err='Header targetid missing!';
					res.json({error_code:2,err_desc:err});
					strInfo = 'Error on line ' + lineNum + ':' + err;
					util.logInfo(mode, file, strInfo);						
					return;
				}

				if(mode.toLowerCase(mode) == 'add') {

					if(isEdge==false) {						    			
						// var addObj = util.prepareInboudData(objectType, lineData, schemas);
						// console.dir(addObj);
						soiServices.addRecord(objectType, lineData, function(err, returnObj) {
								if(util.defined(err)) {
									console.log('Error:' + err);
									strInfo = 'Record Added Error on line ' + lineNum + ':' + err;
									util.logInfo(mode, file, strInfo);
								} else {
									console.log('Added:');
									console.dir(returnObj);
									strInfo = 'Record Added: ' + objectType + ':' + JSON.stringify(returnObj);
									util.logInfo(mode, file, strInfo);										
								}
							});					    			
					} else {
						var sourceId = util.prepareInboudString(lineData.sourceid);
						var targetId = util.prepareInboudString(lineData.targetid);
						delete lineData.sourceid;
						delete lineData.targetid;
						//var addObj = util.prepareInboudData(objectType, lineData, schemas);
						console.log('sourceId:' + sourceId);
						console.log('targetId:' + targetId);
						console.log('data:');
						console.dir(lineData);

						if(sourceId.indexOf('#') == -1) {
							getSourceTargetID(objectTypeSource, objectTypeTarget, sourceId, targetId, function(err, data) {
								if(util.defined(err)) {
									console.log('getSourceTargetID Error:' + err);
									strInfo = 'getSourceTargetID Error on line ' + lineNum + ':' + err;
									util.logInfo(mode, file, strInfo);	
									res.json({error_code:2,err_desc:err});
									return;
								} else {
										console.log('getSourceTargetID:' + data.sourceRecId + ":" + data.targetRecId);

										soiServices.addEdge(objectType, lineData, data.sourceRecId, data.targetRecId, function(err, records) {
											console.log('Edge Added:' + records);
											strInfo = 'Edge Added: ' + objectType + ':' + JSON.stringify(lineData) + ':' + data.sourceRecId + ':' + data.targetRecId;
											util.logInfo(mode, file, strInfo);
									});
								}
							})

						} else {
							soiServices.addEdge(objectType, lineData, sourceId, targetId, function(err, records) {
								if(util.defined(err)) {
									console.log('Error:' + err);
									strInfo = 'Edge Added Error on line ' + lineNum + ':' + err;
									util.logInfo(mode, file, strInfo);								
								} else {								
									console.log('Edge Added:' + records);
									strInfo = 'Edge Added: ' + objectType + ':' + JSON.stringify(lineData) + ':' + sourceId + ':' + targetId;
									util.logInfo(mode, file, strInfo);	
								}
							});
						}
					}
				} else if(mode.toLowerCase(mode) == 'update') {

					if(isEdge==false) {				
						var idValue = util.prepareInboudString(lineData[idField]);
						delete lineData[idField];
						//var updateObj = util.prepareInboudData(objectType, lineData, schemas);

						//console.log('updateObj:')
						//console.dir(updateObj);

						var sendIdField = idField;
						if(idField.toLowerCase() == 'id')
							sendIdField = '@rid';

						console.log('idField:' + sendIdField);
						console.log('idValue:' + idValue);

						soiServices.updateRecordByProp(objectType, sendIdField, idValue, lineData, schemas, function(err, returnObj) {
								if(util.defined(err)) {
									console.log('Error:' + err);
									strInfo = 'Record Updated Error on line ' + lineNum + ':' + err;
									util.logInfo(mode, file, strInfo);								
								} else {														
									console.log('Update:');
									console.dir(returnObj);
									strInfo = 'Record Updated: ' + objectType + ':' + JSON.stringify(returnObj);
									util.logInfo(mode, file, strInfo);	
								}
							});					    			
					} else {
						var sourceId = util.prepareInboudString(lineData.sourceid);
						var targetId = util.prepareInboudString(lineData.targetid);
						console.log('sourceId:' + sourceId);
						console.log('targetId:' + targetId);
						delete lineData['sourceid'];
						delete lineData['targetid'];
						//var updateObj = util.prepareInboudData(objectType, lineData, schemas);

						if(sourceId.indexOf('#') == -1) {
							getSourceTargetID(objectTypeSource, objectTypeTarget, sourceId, targetId, function(err, data) {
								if(util.defined(err)) {
									console.log('getSourceTargetID Error:' + err);
									strInfo = 'getSourceTargetID Error on line ' + lineNum + ':' + err;
									util.logInfo(mode, file, strInfo);										
									res.json({error_code:2,err_desc:err});
									return;
								} else {
									console.log('getSourceTargetID:' + data.sourceRecId + ":" + data.targetRecId);

										soiServices.updateEdge(objectType, lineData, data.sourceRecId, data.targetRecId, function(err, records) {
											if(util.defined(err)) {
												console.log('Error:' + err);
												strInfo = 'Edge Update Error on line ' + lineNum + ':' + err;
												util.logInfo(mode, file, strInfo);								
											} else {																									
												console.log('Edge Update:' + records);
	 											strInfo = 'Edge Update: ' + objectType + ':' + data.sourceRecId + ':' + data.targetRecId;
												util.logInfo(mode, file, strInfo);	
											}
									});
								}
							})
						} else {
							soiServices.updateEdge(objectType, lineData, sourceId, targetId, function(err, records) {
								if(util.defined(err)) {
									console.log('Error:' + err);
									strInfo = 'Edge Update Error on line ' + lineNum + ':' + err;
									util.logInfo(mode, file, strInfo);								
								} else {																									
									console.log('Edge Update:' + records);
									strInfo = 'Edge Update: ' + objectType + ':' + sourceId + ':' + targetId;
									util.logInfo(mode, file, strInfo);	
								}
							});
						}
					}
				} else if(mode.toLowerCase(mode) == 'delete') {
					if(isEdge) {
						var sourceId = util.prepareInboudString(lineData.sourceid);
						var targetId = util.prepareInboudString(lineData.targetid);
						console.log('sourceId:' + sourceId);
						console.log('targetId:' + targetId);

						if(sourceId.indexOf('#') == -1) {
							getSourceTargetID(objectTypeSource, objectTypeTarget, sourceId, targetId, function(err, data) {
								if(util.defined(err)) {
									console.log('getSourceTargetID Error:' + err);
									strInfo = 'getSourceTargetID Error on line ' + lineNum + ':' + err;
									util.logInfo(mode, file, strInfo);										
									res.json({error_code:2,err_desc:err});
									return;
								} else {
									console.log('getSourceTargetID:' + data.sourceRecId + ":" + data.targetRecId);
										soiServices.deleteEdge(objectType, data.sourceRecId, data.targetRecId, function(err, records) {
											if(util.defined(err)) {
												console.log('Error:' + err);
												strInfo = 'Edge Deleted Error on line ' + lineNum + ':' + err;
												util.logInfo(mode, file, strInfo);								
											} else {																																				
												console.log('Edge Deleted:' + records);
	 											strInfo = 'Edge Deleted: ' + objectType + ':' + data.sourceRecId + ':' + data.targetRecId;
												util.logInfo(mode, file, strInfo);	
											}
									});
								}
							})
						} else {
							soiServices.deleteEdge(objectType, sourceId, targetId, function(err, records) {
								if(util.defined(err)) {
									console.log('Error:' + err);
									strInfo = 'Edge Deleted Error on line ' + lineNum + ':' + err;
									util.logInfo(mode, file, strInfo);								
								} else {																																												
									console.log('Edge Deleted:' + records);
									strInfo = 'Edge Deleted: ' + objectType + ':' + sourceId + ':' + targetId;
									util.logInfo(mode, file, strInfo);	
								}
							});
						}
					} else {
						//var delObj = util.prepareInboudData(lineData);
 						var idValue = util.prepareInboudString(lineData[idField]);

						var sendIdField = idField;
						if(idField.toLowerCase() == 'id')
							sendIdField = '@rid';

						console.log('idField:' + sendIdField);
						console.log('idValue:' + idValue);

						soiServices.deleteVertexByProp(objectType, sendIdField, idValue, schemas, function(err, records) {
							if(util.defined(err)) {
								console.log('Error Deleting:' + err);
								strInfo = 'Record Deleted Error on line ' + lineNum + ':' + err;
								util.logInfo(mode, file, strInfo);									
							} else {
								console.log('Record Deleted:' + records);	
								strInfo = 'Record Deleted: ' + idField + ':' + idValue;
								util.logInfo(mode, file, strInfo);	
							}
						});						    			
					}
				}
				lineNum++;
		    }).on('end', function() {
      		console.log('Done:' + lineNum);	
      		var strLog = lineNum + ' Records completed.';
      		res.json({error_code:0,err_desc:null,strLog: strLog, file: file});
    		});
			} else {
				// no form data
			}
		});
	});	
}