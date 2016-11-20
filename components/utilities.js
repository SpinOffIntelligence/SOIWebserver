'use strict';
var moment = require('moment');

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

  for(var propertyName in obj) {
    if(defined(obj,propertyName)) {
      var val = obj[propertyName];
      if(typeof val == 'string' && val.indexOf('.000Z') > -1) {
        var x = moment(val);
        val = x.format('YYYY-MM-DD') + ' 00:00:00';
      }
    }
    obj[propertyName] = val;
  }
  return obj;
}

module.exports.defined = defined;
module.exports.prepareInboudDate = prepareInboudDate;
