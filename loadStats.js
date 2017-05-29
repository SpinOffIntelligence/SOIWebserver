var OrientDB = require('orientjs');
var odb =  require('./components/orientdb.js');
var fs = require('fs');
var strUtil = require('util');
var _ = require('underscore');
var soiControllers = require('./app/controllers/soi');
var util = require('./components/utilities.js');


odb.init(function(err, res) {
  console.log('^^^^')
  var statsItem = 'statsdegreecentrality';

  fs = require('fs')
  fs.readFile('./stats.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    //console.log(data);

    var arr = data.substring(1, data.length-3).split(", ");
    var dataValues = {};
    _.each(arr, function(item) {
      //console.log(item);
      var arrItem = item.split(':');
      if(arrItem.length>2) {
        var key = arrItem[0].substr(2) + ':' + arrItem[1].slice(0, -1);
        var value = arrItem[2];

        //console.log('key:' + key);
        //console.log('value:' + value);

        dataValues[key] = value;

        
      }
    });

    soiControllers.getSchemasServer(function(err, data) {
      console.log('$$$$ schemas:');
      //console.dir(data)

      //for (var propertyName in data) {
      var propertyName = 'VInvestment';
        if(propertyName[0] == 'V') {
          console.log('propertyName:' + propertyName);  

          var query = strUtil.format("select from " + propertyName);
          console.log('query:' + query);
          odb.db.query(query).then(function(records){

            records = util.prepareOutboundIDs(records);
            //console.log(records);

            _.each(records, function(obj) {
              var id = obj.id;
              console.log("ID: " + id);

              if(util.defined(dataValues, id)) {
                var statsVal = dataValues[id];  

                var query = strUtil.format("UPDATE %s SET %s = %s WHERE @rid = '%s'", propertyName, statsItem, statsVal, id);
                console.log('query:' + query);
                odb.db.query(query).then(function(records){
                  console.log('Updated records:' + records);
                  //process.exit(1);
                });

              }
            })            

            //process.exit(1);
          }).catch(function(error){
            console.error('Exception: ' + error); 
            process.exit(1);
          });
          //process.exit(1);
        }
      //}
    });
  });
});

