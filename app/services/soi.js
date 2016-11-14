'use strict';

var odb = require('../../components/orientdb.js');
var _ = require('underscore');
var util = require('../../components/utilities.js');
var strUtil = require('util');

var schemaTypeMap = [
	{dbtype: 7, apptype: 'string'},
	{dbtype: 1, apptype: 'integer'}
];


exports.updateRecord = function(panelRecord, callback) {
	var updateObj = {};
	for(var propertyName in panelRecord) {
		if(propertyName.indexOf('@') == -1 && propertyName != 'id' && propertyName != 'backup') {
			updateObj[propertyName] = panelRecord[propertyName];
		}
	}

	odb.db.update(panelRecord.id)
   .set(updateObj).one()
   .then(
      function(update){
         console.log('Records Updated:', update);
         callback(null, update);
      }
   );	
}

exports.getRecords = function(objName, fields, callback) {

	console.log('getRecords');

	var fieldString = '';
	for(var i=0; i<fields.length; i++) {
		var field=fields[i];
		if(i == fields.length-1) {
			fieldString += field.schemaName;
		} else {
			fieldString += field.schemaName + ', ';
		}
	}
	console.log(fieldString);

	var query = strUtil.format("SELECT %s FROM %s", fieldString, objName);
	console.log(query);	

	odb.db.class.get(objName).then(function(obj){
	   obj.property.list()
	   .then(
	      function(properties){
	      	var cluster=0;
	        if(properties.length > 0) {
	        	var cluster = properties[0]['class'].defaultClusterId;

						odb.db.query(
						   query
						).then(function(records){
						   console.log(records);

							var recs=[];
						  for(var i=0; i<records.length; i++) {
						  	var rec = records[i];
						  	var recId = rec['@rid'];

						  	console.log('***************');
						  	console.log(recId.position);

					  		rec.id = '#'+	cluster + ':' + recId.position;
						  	recs.push(rec);
						  }
						  callback(null,recs);
						});		        	
	        } else {
	        	callback(404,null);
	        }
	      }
		  )
	});
}

exports.getSchema = function(objName, callback) {

	odb.db.class.get(objName).then(function(obj){
	   obj.property.list()
	   .then(
	      function(properties){
	        console.log('properties');
	        console.dir(properties);

	        var props={};
	        for(var i=0; i<properties.length; i++) {
	        	var prop = properties[i];
	        	console.log('prop:' + prop);

	        	var appType = '';
	        	var fnd = _.findWhere(schemaTypeMap, {dbtype: prop.type})
	        	if(util.defined(fnd)) {
	        		console.log('type:' + fnd);
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