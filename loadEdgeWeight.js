var OrientDB = require('orientjs');
var odb =  require('./components/orientdb.js');
var fs = require('fs');
var strUtil = require('util');
var _ = require('underscore');
var soiControllers = require('./app/controllers/soi');
var util = require('./components/utilities.js');
var async = require('async');
var comboCnt = 0;

function setEdgeScore(id, score, callback) {

  var query = strUtil.format("UPDATE E SET weight = %s WHERE @rid = '%s'", score, id);
  //console.log('query:' + query);
  process.stdout.write('+');
  odb.db.query(query).then(function(records){
    //console.log('Updated records:' + records);
    callback(null,records);
  });
}

function setVertexScore(id, prop, score, callback) {

  var query = strUtil.format("UPDATE V SET %s = %s WHERE @rid = '%s'", prop, score, id);
  console.log('query:' + query);
  process.stdout.write('+');
  odb.db.query(query).then(function(records){
    //console.log('Updated records:' + records);
    callback(null,records);
  });
}


function scoreEdge(rec, className) {

  var score=0;
  var type;
  if(util.defined(rec,"type"))
    type=rec.type;

  switch(className) {
    case 'EPartner':
        if(type == 'Customer')
          score+=3;
        break;

    case 'EApplicant':
        score=5;
        break;

    case 'EInventor':
        score=5;
        break;

    case 'EInvestment':
        score=9;
        break;

    case 'EAcquire':
        score=9;
        break;

    case 'EBoardMember':
        score=6;
        break;

    default:
        
  }    
  return score;
}

function loadVertexStats(infoObj, callback) {

  var count = infoObj.count;
  var record = infoObj.record;

  console.log('********************* loadVertexStats: ' + count);

  var allScores = {};
  //var query = strUtil.format("select @rid from V where @class = '%s'", objectType);

  var id = '#' + record.rid.cluster + ':' + record.rid.position;
  console.log('id: ' + id);

  var query = strUtil.format("traverse * from  %s while $depth < 2", id);
  console.log('query:' + query);

  odb.db.query(query).then(function(records){

    console.log("records:" + records.length);
    //console.dir(records);

    // Prep records
    _.each(records, function(rec) {
      var id = '#' + rec['@rid'].cluster + ':' + rec['@rid'].position;
      console.log("prep id:" + id);
      rec.id = id;
      var className = rec['@class']
      console.log("prep class:" + className);
    });

    _.each(records, function(rec) {
      console.log("rec:" + rec);
      console.dir(rec);

      var id = rec.id;
      console.log("id:" + id);

      var className = rec['@class']
      console.log("className:" + className);

      var score=1;
      if(className.charAt(0) == 'V') {
        // Set Node Scores

        console.log('Is Vertex');

        var totalProp=0;
        var totalUsedProp=0;
        if(util.defined(schemas,className)) {
          console.dir("schemas:" + className);
          //console.dir(schemas[className]);

          for (var prop in schemas[className]) {            
            console.log("Prop:" + prop);
            totalProp++;
            if(util.defined(rec,prop))
              totalUsedProp++;
          }
          console.log('Prop:' + totalProp + ":" + totalUsedProp);
          if(totalProp > 0) {
            var score = Math.ceil((totalUsedProp/totalProp)*100);
            console.log('Vertext Score:' + score);
            setVertexScore(id, 'dataquailityscore', score, function() {
            });
          }
//process.exit(1);             
        }

      }
    });

    var mapObjs = [];
    var allRecords = records;

    console.log('********************* loadVertexStats Done \n\n\n' + count);

    callback(null,mapObjs);
  });
}

function loadEdgeStats(infoObj, callback) {

  var count = infoObj.count;
  var record = infoObj.record;

  console.log('********************* loadStats: ' + count);

  var allScores = {};
  //var query = strUtil.format("select @rid from V where @class = '%s'", objectType);

  var id = '#' + record.rid.cluster + ':' + record.rid.position;
  console.log('id: ' + id);

  var query = strUtil.format("traverse * from  %s while $depth < 2", id);
  console.log('query:' + query);

  odb.db.query(query).then(function(records){

    console.log("records:" + records.length);
    //console.dir(records);

    // Prep records
    _.each(records, function(rec) {
      var id = '#' + rec['@rid'].cluster + ':' + rec['@rid'].position;
      console.log("prep id:" + id);
      rec.id = id;
      var className = rec['@class']
      console.log("prep class:" + className);

      if(className.charAt(0) == 'E') {
        var inId;
        if(util.defined(rec,"in.cluster"))
          inId =  '#' + rec['in'].cluster + ':' + rec['in'].position;
        else inId =  '#' + rec['in']['@rid'].cluster + ':' + rec['in']['@rid'].position;
        rec.inId = inId;

        var outId;
        if(util.defined(rec,"out.cluster"))
          outId =  '#' + rec['out'].cluster + ':' + rec['out'].position;
        else outId =  '#' + rec['out']['@rid'].cluster + ':' + rec['out']['@rid'].position;
        rec.outId = outId;
      }
    });

    _.each(records, function(rec) {
      console.log("rec:" + rec);
      console.dir(rec);

      var id = rec.id;
      console.log("id:" + id);

      var className = rec['@class']
      console.log("className:" + className);

      var score=1;
      if(className.charAt(0) == 'E') {
        console.log("is edge:");
        var weight = rec['weight'];
        console.log("weight:" + weight);
        if(weight == 0) {
          score = scoreEdge(rec,className);
          if(score==0)
            score=1;
          else console.log("~~Score: " + score);

          // Find multiple 
          console.log("in & out:" + rec.inId + ":" + rec.outId);
          var fndIn = _.where(records, {inId: rec.inId, outId: rec.outId});
          console.log("fndIn:" + fndIn.length);
          //console.dir(fndIn);

          var fndOut = _.where(records, {outId: rec.inId, inId: rec.outId});
          console.log("fndOut:" + fndOut.length);
          //console.dir(fndOut);

          if(util.defined(fndIn,"length") && fndIn.length > 0) {
            _.each(fndIn, function(subrec) {
              if(subrec.id != rec.id) {
                score++;
                console.log("*****found multiple:" + subrec.id);
              }
                
            });          
          }
          if(util.defined(fndOut,"length") && fndOut.length > 0) {
            _.each(fndOut, function(subrec) {
              if(subrec.id != rec.id) {
                console.log("*****found multiple:" + subrec.id);
                score++;
              }
                
            });          
          }

          console.log("++++score:" + score);
          setEdgeScore(id, score, function(error, data) {            
          });
        }

      } else {

        // Set Node Scores
        var totalProp=0;
        var totalUsedProp=0;
        if(util.defined(schemas,"className")) {
          _.each(schemas.className, function(prop) {
            totalProp++;
            if(util.define(rec,"prop"))
              totalUsedProp++;''
          });
          console.log('Prop:' + totalProp + ":" + totalUsedProp);
          if(totalProp > 0) {
            var score = Math.ceil((totalUsedProp/totalProp)*100);
            console.log('Vertext Score:' + score);
            setVertexScore(id, 'dataquailityscore', score, function() {
            });
          }
          
        }

      }
    });

    var mapObjs = [];
    var allRecords = records;

    console.log('********************* loadStats Done \n\n\n' + count);

    callback(null,mapObjs);
  });
}

function processStats(statsItem, callback) {

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
        if(statsItem == 'statsbetweencentrality')
          value = Math.floor(Math.random() * 50) + 1;

        dataValues[key] = value;        
      }
    });


    function getInfo(infoObj, callback) {
      var objectType = infoObj.objectType;

      var query = strUtil.format("select from " + objectType);
      console.log('query:' + query);
      odb.db.query(query).then(function(records){
        //console.dir(records);
        var obj = {
          objectType: objectType,
          data: records
        }
        callback(null,obj);
      });
    }

    function setInfo(infoObj, callback) {
      var objectType = infoObj.objectType;
      var statsItem = infoObj.statsItem;
      var statsVal = infoObj.statsVal;
      var id = infoObj.id;

      var query = strUtil.format("UPDATE %s SET %s = %s WHERE @rid = '%s'", objectType, statsItem, statsVal, id);
      console.log('query:' + query);
      odb.db.query(query).then(function(records){
        console.log('Updated records:' + records);
        var obj = {
          objectType: objectType,
          data: records
        }
        callback(null,obj);
      });
    }

    function setDefaultInfo(infoObj, callback) {

      var objectType = infoObj.objectType;
      var statsItem = infoObj.statsItem;

      var defaultVal = 1;
      var query1 = strUtil.format("UPDATE %s SET %s = %s", objectType, statsItem, defaultVal);
      console.log('query1:' + query1);
      odb.db.query(query1).then(function(records){
        callback(null, null);
      });
    }

    soiControllers.getSchemasServer(function(err, data) {
      console.log('$$$$ schemas:');
      //console.dir(data)

      var mapObjs = [];
      for (var propertyName in data) {
      //var propertyName = 'VSpinOff';
        if(propertyName[0] == 'V') {
          console.log('propertyName:' + propertyName);  
          mapObjs.push({objectType: propertyName, statsItem: statsItem});
        }
      }
      console.log('Map Objs:');
      console.dir(mapObjs);

      async.map(mapObjs, getInfo, function(err, results){

        var res = results;

        async.map(mapObjs, setDefaultInfo, function(err, results){


          //process.exit(1);
          var mapSetObjs = [];

          for(var i=0; i<res.length; i++) {
            var objectType = res[i].objectType;
            var records = res[i].data;
            
            console.log('Process Result: ' + objectType + '~' + records.length);
            records = util.prepareOutboundIDs(records);

            _.each(records, function(obj) {
              var id = obj.id;
              console.log("ID: " + id);

              if(util.defined(dataValues, id)) {
                var statsVal = dataValues[id];  

                if(statsVal > 1) {
                  mapSetObjs.push({
                    objectType:objectType,
                    statsItem:statsItem,
                    statsVal:statsVal,
                    id:id
                  });                  
                }
              }
            });
          }
          console.log('mapSetObjs:');
          console.dir(mapSetObjs);

          async.map(mapSetObjs, setInfo, function(err, results){
            console.log('mapSetObjs done!')
            callback(null, results);            
          });


        });
      });
    });
  });

}


var schemas;
odb.init(function(err, res) {
  console.log('^^^^')
  console.log('*** loadEdgeWeight');
  var allRecords;


  console.log('^^^^')
  soiControllers.getSchemasServer(function(err, data) {
    schemas = data;

    console.log('$$$$ schemas:');
    console.dir(schemas)
  });


  var query = strUtil.format("update E set weight = 0");
  console.log('query:' + query);
  odb.db.query(query).then(function(records){


    var query = strUtil.format("update V set dataquailityscore = 0,prestigescore = 0");
    console.log('query:' + query);
    odb.db.query(query).then(function(records){

      var query = strUtil.format("select @rid from V");
      console.log('query:' + query);
      odb.db.query(query).then(function(records){
        var allRecords = records;
        var mapObjs = [];
        var cnt=0;
        _.each(allRecords, function(rec) {
          mapObjs.push({count: cnt, record: rec});
          cnt++;
        });
        console.log('mapObjs:' + mapObjs.length);
        //console.dir(mapObjs);

        async.mapSeries(mapObjs, loadVertexStats, function(err, results){
          console.log('loadVertexStats done!' + comboCnt)

          async.mapSeries(mapObjs, loadEdgeStats, function(err, results){
            console.log('loadEdgeWeight done!' + comboCnt)
            process.exit(1);            
          });    


        });    
      });
    });    
  });    
  // processStats('statsdegreecentrality', function(err, data) {
  //     console.log('*** statsdegreecentrality');
  //     processStats('statsbetweencentrality', function(err, data) {
  //       process.exit(1);
  //     });
  // });
});

