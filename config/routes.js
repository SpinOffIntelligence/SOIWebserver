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

module.exports = function(app,express){

	app.use("/www", express.static(path.join(__dirname, '../public')));
	app.use("/sioapp", express.static(path.join(__dirname, '../../soiapp')));

  app.use(bodyParser.json());  

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

  /** API path that will upload the files */
  app.post('/upload', function(req, res) {
      upload(req,res,function(err){
          if(err){
               res.json({error_code:1,err_desc:err});
               return;
          }
          console.dir(res.req.file.path);

					var array = fs.readFileSync(res.req.file.path).toString().split("\r\n");
					var lineNum=0;
					var mode=null
					var objectType=null;
					var objectTypeSource=null;
					var objectTypeTarget=null;
					var isEdge=false;
					var arrProp=null;
					var numProp=0;
					var arrSaveLines=[];
					var err=null;					
					for(i in array) {
						var line = array[i];
				    console.log(line + ':' + lineNum);
				    var arrLine = line.split(',');
				    if(util.defined(arrLine,"length")) {
					    console.log(arrLine);
					    if(lineNum==0) {
					    	if(arrLine.length > 0) {
					    		mode = arrLine[0];
					    		console.log('mode:' + mode);
								}
								if(arrLine.length > 1) {
					    		objectType=arrLine[1];
					    		console.log('objectType:' + objectType);
					    		if(objectType[0] == 'E') {
					    			isEdge=true;
					    			console.log('Is Edge!');
					    		}
					    	}
					    	if(arrLine.length > 2) {
					    		objectTypeSource=arrLine[2];
					    		console.log('objectTypeSource:' + objectTypeSource);
				    		}
				    		if(arrLine.length > 3) {
					    		objectTypeTarget=arrLine[3];
					    		console.log('objectTypeTarget:' + objectTypeTarget);
				    		}
					    } else if(lineNum==1) {
					    	arrProp=arrLine;
					    	numProp=arrLine.length;
					    	console.log('arrProp:' + arrProp);
					    	console.log('numProp:' + numProp);
					    	if(isEdge && _.indexOf(arrProp,'sourceid') == -1) {
					    		err='Header sourceid missing!';
					    		res.json({error_code:2,err_desc:err});
									return;
					    	} else if(isEdge && _.indexOf(arrProp,'targetid') == -1) {
					    		err='Header targetid missing!';
					    		res.json({error_code:2,err_desc:err});
									return;
					    	}
					    } else if(err==null) {
					    	if(arrLine.length != numProp) {
					    		err='Line ' + lineNum + ' has wrong number of values!';
					    	} else {
					    		var obj = {};
					    		var sourceId = null;
					    		var targetId = null;
					    		for(var i=0; i<arrProp.length; i++) {
					    			var prop = arrProp[i];
					    			var val = arrLine[i];
					    			if(prop=='sourceid') {
					    				sourceId = val;
					    			} else if(prop=='targetid') {
					    				targetId = val;
					    			} else {
					    				obj[prop] = val;	
					    			}
					    		}
  				    		console.log('mode:' + mode);
					    		if(mode.toLowerCase(mode) == 'add') {
						    		var addObj = util.cleanInBoundData(obj);
						    		console.dir(addObj);
						    		if(isEdge==false) {						    			
						    			soiServices.addRecord(objectType, addObj, function(err, returnObj) {
												console.log('Added:');
												console.dir(returnObj);
											});					    			
						    		} else {
						    			console.log('sourceId:' + sourceId);
						    			console.log('targetId:' + targetId);
						    			console.log('data:');
						    			console.dir(addObj);

						    			if(sourceId.indexOf('#') == -1) {
						    				getSourceTargetID(objectTypeSource, objectTypeTarget, sourceId, targetId, function(err, data) {
						    					if(util.defined(err)) {
						    						console.log('getSourceTargetID Error:' + err);
						    						res.json({error_code:2,err_desc:err});
						    						return;
						    					} else {
						    						console.log('getSourceTargetID:' + data.sourceRecId + ":" + data.targetRecId);
														soiServices.addEdge(objectType, addObj, data.sourceRecId, data.targetRecId, function(err, records) {
															console.log('Edge Added:' + records);
				    								});
						    					}
						    				})

						    			} else {
						    				soiServices.addEdge(objectType, addObj, sourceId, targetId, function(err, records) {
						    					console.log('Edge Added:' + records);
						    				});
						    			}
						    		}
						    	} else if(mode.toLowerCase(mode) == 'update') {

						    	} else if(mode.toLowerCase(mode) == 'delete') {
						    		if(isEdge) {
											if(sourceId.indexOf('#') == -1) {
						    				getSourceTargetID(objectTypeSource, objectTypeTarget, sourceId, targetId, function(err, data) {
						    					if(util.defined(err)) {
						    						console.log('getSourceTargetID Error:' + err);
						    						res.json({error_code:2,err_desc:err});
						    						return;
						    					} else {
						    						console.log('getSourceTargetID:' + data.sourceRecId + ":" + data.targetRecId);
														soiServices.deleteEdge(objectType, data.sourceRecId, data.targetRecId, function(err, records) {
															console.log('Edge Deleted:' + records);
				    								});
						    					}
						    				})

						    			} else {
						    				soiServices.deleteEdge(objectType, sourceId, targetId, function(err, records) {
						    					console.log('Edge Deleted:' + records);
						    				});
						    			}
						    		} else {
							    		soiServices.deleteVertexByProp(objectType, arrProp[0], val, function(err, records) {
							    			if(util.defined(err)) {
							    				console.log('Error Deleting:' + err);
							    			} else {
							    				console.log('Record Deleted:' + records);	
							    			}
							    		});						    			
						    		}
						    	}
					    	}
					    }
					    lineNum++;					    	
				    }
					}
					if(err!=null) {
						res.json({error_code:0,err_desc:null});
					} else {
						res.json({error_code:1,err_desc:err});
					}
          
      });
  });
}