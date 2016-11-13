'use strict';

var odb = require('../../components/orientdb.js');
var _ = require('underscore');
var util = require('../../components/utilities.js');
var strUtil = require('util');

var schemaTypeMap = [
	{dbtype: 7, apptype: 'string'},
	{dbtype: 1, apptype: 'integer'}
];



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

	odb.db.query(
	   query
	).then(function(records){
	   console.log(records);
	   callback(null,records);
	});

}

exports.getSchema = function(objName, callback) {

	odb.db.class.get(objName).then(function(obj){
	   obj.property.list()
	   .then(
	      function(properties){
	        console.log('properties');
	        console.dir(properties);

	        var props=[];
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
	        		name: prop.name,
	        		type: appType,
	        		mandatory: prop.mandatory,
	        		defaultValue: prop.defaultValue,
	        		readOnly: prop.readonly,
	        		notNull: prop.notNull,
	        		min: prop.min,
	        		max: prop.max
	        	}
	        	props.push(obj);
	        }
		      callback(null,props);        
	      }
	    );
	});
}