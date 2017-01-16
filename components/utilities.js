'use strict';
var moment = require('moment');
var soiServices = require('../app/services/soi');

function defined(ref, strNames) {
    var name;

    if(ref === null || typeof ref === "undefined") {
      //console.log('defined, ref null!');
      return false;
    }

    if(strNames !== null && typeof strNames !== "undefined") {
      var arrNames = strNames.split('.');
      while (name = arrNames.shift()) {
          //console.log('defined, name:' + name);
          if (ref[name] === null || typeof ref[name] === "undefined") {
            return false;
          }
          ref = ref[name];
      }
    }
    return true;
}

function toLower(inStr) {
  if(inStr !== null && typeof inStr !== "undefined")
    return inStr.toLowerCase();
  else return inStr;
}

function getSchemaType(schema, field) {
  var retObj = {
    isString : false,
    isDate : false,
    isId : false
  }
  console.log('~~~~~ field: ' + field);
  if(defined(schema, field + '.type')) {
    var schemaType = schema[field].type
    console.log('~~~~~ schemaType: ' + schemaType);
    if(schemaType == 'string')
      retObj.isString = true;
    if(schemaType == 'date')
      retObj.isDate = true;
    if(field == 'id' || field == '@rid') 
      retObj.isId == true;
  }
  return retObj;
}


function formatDBDate(strDate) {
  return moment(strDate).format("YYYY-MM-DD");
}

function prepareInboudDate(inDate) {
  console.log('prepareInboudDate:');

  var x = moment(inDate);
  var newDate = x.format('YYYY-MM-DD') + ' 00:00:00';

  console.log('Fix Date:' + newDate);
  
  return newDate;
}

function cleanString(input) {
  var output = "";
  for (var i=0; i<input.length; i++) {
      if (input.charCodeAt(i) <= 127) {
          output += input.charAt(i);
      }
  }
  return output;
}

function prepareInboudString(inString) {
  console.log('prepareInboudString:');

  var cleanStr = cleanString(inString);
  cleanStr = cleanStr.replace(/(\r\n|\n|\r)/gm," ");

  cleanStr = cleanStr.replace(/\'/gm,"\\'");

  cleanStr = cleanStr.trim()

  console.log('Fix String:' + cleanStr);
  
  return cleanStr;
}


function prepareOutboundData(schema, data) {

  console.log('prepareOutboundData:');

  for(var i=0; i<data.length; i++) {
   for(var propertyName in data[i]) {
    if(defined(schema,propertyName)) {
      var schemaInfo = schema[propertyName];
      if(schemaInfo.type == 'date') {
       var mDate = moment(data[i][propertyName]).add(5, 'hours').format('YYYY-MM-DD'); 
       data[i][propertyName] = mDate;

       console.log('^^^^^ new date: ' + data[i][propertyName]);

      }   
    }
   }     
  }
  return data;
}

function prepareInboudDate(obj) {
  console.log('prepareInboudDate:');

  for(var propertyName in obj) {
    if(defined(obj,propertyName)) {
      var val = obj[propertyName];

      console.log(propertyName + ':' + val);

      if(typeof val == 'string' && val.indexOf('.000Z') > -1) {
        var x = moment(val);
        var newDate = x.format('YYYY-MM-DD') + ' 00:00:00';
        obj[propertyName] = newDate;

        console.log('Fix Date:' + obj[propertyName]);

      }
    }
  }
  console.log('done:')
  console.dir(obj);
  return obj;
}


function cleanInBoundData(objectType, recordData, schemas) {
  var cleanData = {};
  var sendObj = {};

  console.log('**** cleanInBoundData:');
  console.dir(recordData);

  if(this.defined(recordData)) {
    for(var propertyName in recordData) {
      console.log('^^^^ propertyName:' + propertyName);
      if(recordData[propertyName] == null) {
        console.log('fail1');
      } else if(propertyName == 'in') {
        console.log('fail2');
      } else if(propertyName == 'out') {
        console.log('fail3');
      } else if(propertyName.indexOf('@') != -1) { 
        console.log('fail4');
      } else if(propertyName == 'id') {
        console.log('fail5');
      } else if(propertyName == 'backup') {
        console.log('fail6');
      } else if(typeof propertyName == 'object') {
        console.log('fail7');
      } else if(typeof propertyName == 'array') {
        console.log('fail8');
      } else if(!this.defined(recordData,propertyName)) {
        console.log('fail9');
      } else {

        var schemaTypes = getSchemaType(schemas[objectType], propertyName);
        if(schemaTypes.isString) {
          cleanData[propertyName] = prepareInboudString(recordData[propertyName]);
        } else if(schemaTypes.isString) {
          cleanData[propertyName] = prepareInboudDate(recordData[propertyName]);
        } else {
          cleanData[propertyName] = recordData[propertyName];  
        }

        
      }
    }
    //sendObj = this.prepareInboudDate(cleanData);

    console.log('**** cleanInBoundData Done:');
    console.dir(cleanData);

    return cleanData;
  } else {
    return null;
  } 
}

function logInfo(mode, file, strInfo) {
  var strDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  console.log('Log Info: ' + mode + ':' + file + ':' + strInfo + ':' + strDateTime);
  soiServices.addLogInfo(mode, file, strInfo, strDateTime,function(err, data) {
  });
}


module.exports.defined = defined;
module.exports.prepareInboudDate = prepareInboudDate;
module.exports.cleanInBoundData = cleanInBoundData;
module.exports.logInfo = logInfo;
module.exports.getSchemaType = getSchemaType;
module.exports.formatDBDate = formatDBDate;
module.exports.prepareOutboundData = prepareOutboundData;
module.exports.prepareInboudString = prepareInboudString;