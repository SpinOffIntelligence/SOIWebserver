loadStatsvar OrientDB = require('orientjs');
var odb =  require('./components/orientdb.js');
var fs = require('fs');
var strUtil = require('util');
var _ = require('underscore');
var soiControllers = require('./app/controllers/soi');
var util = require('./components/utilities.js');
var async = require('async');
var comboCnt = 0;

function setBetweenScore(infoObj, callback) {

  var query = strUtil.format("UPDATE V SET statsbetweencentrality = %s WHERE @rid = '%s'", infoObj.score, infoObj.id);
  //console.log('query:' + query);
  process.stdout.write('+');
  odb.db.query(query).then(function(records){
    //console.log('Updated records:' + records);
    callback(null,records);
  });
}


function getShortestPath(infoObj, callback) {
  var objectType = infoObj.objectType;

  var query = strUtil.format("select shortestPath(%s, %s) ", infoObj.src, infoObj.dest);
  //console.log('query:' + query);
  process.stdout.write('.');
  odb.db.query(query).then(function(records){
    //console.dir(records);
    var obj = {
      infoObj: infoObj,
      data: records
    }
    callback(null,obj);
  });  
}

function loadStats(infoObj, callback) {

  var count = infoObj.count;
  var allRecords = infoObj.records;

  console.log('********************* loadStats: ' + count);

  var allScores = {};
  //var query = strUtil.format("select @rid from V where @class = '%s'", objectType);
  var query = strUtil.format("select @rid, statsbetweencentrality from V");
  console.log('query:' + query);
  odb.db.query(query).then(function(records){

    console.log("records:" + records.length);
    //console.dir(records);
    _.each(records, function(rec) {
      //console.log("rec:" + rec);
      var id = '#' + rec.rid.cluster + ':' + rec.rid.position;
      if(util.defined(rec,"statsbetweencentrality"))
        allScores[id] = rec.statsbetweencentrality;
      else allScores[id] = 0;
    });

    console.log('set scores:' + Object.keys(allScores).length)
    //console.dir(allScores);
    //process.exit(1);

    var mapObjs = [];
    var allRecords = records;
    //_.each(allRecords, function(rec) {
    for(var i=count+1; i<allRecords.length; i++) {
      //console.log('source rec:' + rec.rid);
      var rec = allRecords[i];
      var srcId = rec.rid;
      //_.each(allRecords, function(rec) {
        dest = allRecords[count];
        //if(dest.rid != srcId && i != count) {
          mapObjs.push({
            src: srcId,
            dest: dest.rid
          })
          //console.log('src:' +srcId + '~dest' + dest.rid);
          comboCnt++;
        //}
      //});
    }
    //});

    console.log('Map Objs:' + mapObjs.length);
    //console.dir(mapObjs);

    async.map(mapObjs, getShortestPath, function(err, results){

      _.each(results, function(item) {

        // console.log('map result:');
        // console.dir(item);

        var shortestPath = item.data[0].shortestPath;
        //console.log('ShortestPath:' + item.infoObj.src + '~' + item.infoObj.dest + ':'  + shortestPath.length);
        //console.dir(shortestPath);
        _.each(shortestPath, function(item) {
          var id = '#' + item.cluster + ':' + item.position;
          //console.log('id:' + id);
          if(util.defined(allScores, id)) {
            var val = allScores[id];
            allScores[id] = val+1;
          } else {
            allScores[id]=1;
          }
        });


      })

      console.log('Scores:');
      var mapScoresObjs = [];
      for (var propertyName in allScores) {
        score = allScores[propertyName];
        //console.log(propertyName + ':' + score)
        mapScoresObjs.push({id: propertyName, score: score});
      }

      console.log('mapScoresObjs:' + mapScoresObjs.length);
      //console.dir(mapScoresObjs);

      async.map(mapScoresObjs, setBetweenScore, function(err, results){
        callback(null, records);
      });
    });
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


odb.init(function(err, res) {
  console.log('^^^^')
  console.log('*** statsdegreecentrality');
  var allRecords;


  var query = strUtil.format("update v set statsbetweencentrality = 0");
  console.log('query:' + query);
  odb.db.query(query).then(function(records){

    var query = strUtil.format("select @rid from V");
    console.log('query:' + query);
    odb.db.query(query).then(function(records){
      var allRecords = records;
      var mapObjs = [];
      var cnt=0;
      _.each(allRecords, function(rec) {
        mapObjs.push({count: cnt, records: records});
        cnt++;
      });
      console.log('loadStats mapObjs:' + mapObjs.length);
      //console.dir(mapObjs);

      async.mapSeries(mapObjs, loadStats, function(err, results){
        console.log('loadStats mapObjs done!' + comboCnt)
        process.exit(1);            
      });    

      // loadStats(allRecords, 1, function(err, data) {
      //     console.log('loadStats done!');
      //     process.exit(1);
      // });


    });
  });    





  // processStats('statsdegreecentrality', function(err, data) {
  //     console.log('*** statsdegreecentrality');
  //     processStats('statsbetweencentrality', function(err, data) {
  //       process.exit(1);
  //     });
  // });
});

