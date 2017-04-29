'use strict';
var moment = require('moment');
var soiServices = require('../app/services/soi');
var config = require('../config/config');
var strUtil = require('util');

var schemas = [];

var exports = module.exports = {};

exports.schemas;

exports.setSchemas = function(schemas) {
  exports.schemas = schemas;
}

function defined(ref, strNames) {
    var name;

    if(ref === null || typeof ref === "undefined") {
      ////console.log('defined, ref null!');
      return false;
    }

    if(strNames !== null && typeof strNames !== "undefined") {
      var arrNames = strNames.split('.');
      while (name = arrNames.shift()) {
          ////console.log('defined, name:' + name);
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

function createWhereClause(criteria, objectType) {

  //console.log('~~~~~ createWhereClause: ' + objectType);
  console.dir(criteria);

  var whereClause='';
  var query;
  var schema = this.schemas[objectType];

  //console.log('~~~~~ schema: ' + schema);
  console.dir(schema);

  if(this.defined(criteria,'length') && criteria.length > 0) {
    for(var i=0; i<criteria.length; i++) {
      var cri = criteria[i];
      var clause;
      var isString = false;
      var isDate = false;

      if(this.defined(schema,cri.field + '.type')) {
        var schemaType = schema[cri.field].type

        //console.log('~~~~~ schemaType: ' + schemaType);

        if(schemaType == 'string')
          isString = true;
        if(schemaType == 'date')
          isDate = true;
      }

      //console.log('~~~~~ isString: ' + isString);
      //console.log('~~~~~ isDate: ' + isDate);

      var val = cri.value;
      if(isDate) {
        val = this.formatDBDate(val);
      }
      
      if(cri.operator == 'equals') {
        if(isString)
          clause = strUtil.format("%s = '%s'", cri.field, val);
        else clause = strUtil.format("%s = %s", cri.field, val);
      } else if(cri.operator == 'greater') {
        if(isString)
          continue;
        else if(isDate)
          clause = strUtil.format("%s > '%s'", cri.field, val);
        else clause = strUtil.format("%s > %s", cri.field, val);
      } else if(cri.operator == 'less') {
        if(isString)
          continue;
        else if(isDate)
          clause = strUtil.format("%s < '%s'", cri.field, val);
        else clause = strUtil.format("%s < %s", cri.field, val);
      } else if(cri.operator == 'contains') {
        if(isString)
          clause = cri.field + " like '%" + val + "%'";
        else continue;
      } else if(cri.operator == 'notequal') {
        if(isString)
          clause = strUtil.format("%s <> '%s'", cri.field, val);
        else clause = strUtil.format("%s <> %s", cri.field, val);
      } else if(cri.operator == 'notcontain') {
        if(isString)
          clause = strUtil.format("NOT %s like '\%%s\%'", cri.field, val);
        else continue;
      }
      if(i != criteria.length-1) {
        whereClause = clause + ' and ';
      } else {
        whereClause += clause;
      }
    }
    //console.log('~~~~~~~~~~ whereClause:' + whereClause);
  }
  return whereClause;
}

function getSchemaType(objectType, field) {

  //console.log('~~~~~ objectType: ');
  console.dir(objectType);

  var schema = exports.schemas[objectType];
  var retObj = {
    isString : false,
    isDate : false,
    isId : false
  }
  //console.log('~~~~~ field: ' + field);

  if(defined(schema, field + '.type')) {
    var schemaType = schema[field].type
    //console.log('~~~~~ schemaType: ' + schemaType);
    if(schemaType == 'string')
      retObj.isString = true;
    if(schemaType == 'date')
      retObj.isDate = true;
    if(field == 'id' || field == '@rid') 
      retObj.isId == true;
  }
  //console.log('~~~~~ retObj: ');
  console.dir(retObj);

  return retObj;
}


function logging(level, msg) {
  if(config.loglevel == 'debug') {
    console.dir(msg);
  } else if(config.loglevel == 'trace' && (level == 'trace' || level == 'error')) {
    console.dir(msg);
  } else if(config.loglevel == 'error' && level == 'error') {
    console.dir(msg);
  }
}

function formatDBDate(strDate) {
  return moment(strDate).format("YYYY-MM-DD");
}

function prepareInboudDate(inDate) {
  //console.log('prepareInboudDate:');

  var x = moment(inDate);
  var newDate = x.format('YYYY-MM-DD');

  //console.log('Fix Date:' + newDate);
  
  return newDate;
}

function cleanString(input) {
  return input;
  
  var output = "";
  for (var i=0; i<input.length; i++) {
    var code = input.charCodeAt(i);
      if (code <= 255) {
          output += input.charAt(i);
      } else {
        //console.log('$$$$$$$>>' + code + ":" + input.charAt(i));
        if(code == 65533)
          output += String.fromCharCode(233);
      }
  }
  return output;
}

function prepareInboudString(inString) {
  //console.log('prepareInboudString:');

  var cleanStr = cleanString(inString);
  cleanStr = cleanStr.replace(/(\r\n|\n|\r)/gm," ");

  cleanStr = cleanStr.replace(/\'/gm,"\\'");

  cleanStr = cleanStr.trim()

  //console.log('Fix String:' + cleanStr);
  
  return cleanStr;
}


function prepareOutboundData(objectType, records) {

  //console.log('prepareOutboundData:');
  console.dir(records);

  var schema = exports.schemas[objectType];

  for (var i = 0; i < records.length; i++) {
    var rec = records[i];
    for (var propertyName in rec) {
      if (defined(schema, propertyName)) {
        var schemaInfo = schema[propertyName];
        if (schemaInfo.type == 'date') {
          var mDate = moment(rec[propertyName]).add(5, 'hours').format('YYYY-MM-DD');
          rec[propertyName] = mDate;
          //console.log('^^^^^ new date: ' + rec[propertyName]);
        }
      } else {
        if (propertyName == '@rid') {
          var recId = rec['@rid'];
          rec.id = '#' + recId.cluster + ':' + recId.position;
        }
      }
    }
  }

  //console.log('prepareOutboundData Done:');
  console.dir(records);  
  return records;
}


// function prepareInboudDate(obj) {
//   //console.log('prepareInboudDate:');

//   for(var propertyName in obj) {
//     if(defined(obj,propertyName)) {
//       var val = obj[propertyName];

//       //console.log(propertyName + ':' + val);

//       if(typeof val == 'string' && val.indexOf('.000Z') > -1) {
//         var x = moment(val);
//         var newDate = x.format('YYYY-MM-DD') + ' 00:00:00';
//         obj[propertyName] = newDate;

//         //console.log('Fix Date:' + obj[propertyName]);

//       }
//     }
//   }
//   //console.log('done:')
//   console.dir(obj);
//   return obj;
// }


function prepareInboundData(objectType, recordData) {
  var cleanData = {};
  var sendObj = {};
  var schema = exports.schemas[objectType];

  //console.log('**** prepareInboundData *****');
  console.dir(recordData);

  if(this.defined(recordData)) {
    for(var propertyName in recordData) {
      //console.log('^^^^ propertyName:' + propertyName);
      var val = recordData[propertyName];
      if(val == null) {
        //console.log('fail1');
      } else if(propertyName == 'in') {
        //console.log('fail2');
      } else if(propertyName == 'out') {
        //console.log('fail3');
      } else if(propertyName.indexOf('@') != -1) { 
        //console.log('fail4');
      } else if(propertyName == 'id') {
        //console.log('fail5');
      } else if(propertyName == 'backup') {
        //console.log('fail6');
      } else if(typeof propertyName == 'object') {
        //console.log('fail7');
      } else if(typeof propertyName == 'array') {
        //console.log('fail8');
      } else if(!this.defined(recordData,propertyName)) {
        //console.log('fail9');
      } else if(this.defined(val,"length") && val.length == 0) {
        //console.log('fail10');
      } else {

        var schemaTypes = getSchemaType(objectType, propertyName);

        if(schemaTypes.isString) {
          cleanData[propertyName] = prepareInboudString(val);
        } else if(schemaTypes.isDate) {
          cleanData[propertyName] = prepareInboudDate(val);
        } else {
          cleanData[propertyName] = val;  
        }

        
      }
    }
    //sendObj = this.prepareInboudDate(cleanData);

    //console.log('**** prepareInboundData Done:');
    console.dir(cleanData);

    return cleanData;
  } else {
    return null;
  } 
}

function logInfo(mode, file, strInfo) {
  var strDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
  //console.log('Log Info: ' + mode + ':' + file + ':' + strInfo + ':' + strDateTime);
  soiServices.addLogInfo(mode, file, strInfo, strDateTime,function(err, data) {
  });
}

module.exports.defined = defined;
module.exports.prepareOutboundData = prepareOutboundData;
module.exports.prepareInboundData = prepareInboundData;
module.exports.prepareInboudDate = prepareInboudDate;
module.exports.prepareInboudString = prepareInboudString;
module.exports.logInfo = logInfo;
module.exports.getSchemaType = getSchemaType;
module.exports.formatDBDate = formatDBDate;
module.exports.logging = logging;
module.exports.createWhereClause = createWhereClause;