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

function cleanInBoundData(recordData) {
  var cleanData = {};
  var sendObj = {};
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
        cleanData[propertyName] = recordData[propertyName];
      }
    }
    sendObj = this.prepareInboudDate(cleanData);
    return sendObj;
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

