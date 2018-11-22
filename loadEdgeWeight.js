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

  var newScore = Math.ceil(1000 - score);
  var query = strUtil.format("UPDATE E SET weight = %s WHERE @rid = '%s'", newScore, id);
  console.log('query:' + query);
  process.stdout.write('+');
  odb.db.query(query).then(function(records){
    //console.log('Updated records:' + records);
    callback(null,records);
  });
}

function setVertexScores(id, dataquailityscore, statsdegreecentrality, prestigescore, callback) {

  //var newScore = 1000 - score;
  var query = strUtil.format("UPDATE V SET dataquailityscore = %s, statsdegreecentrality = %s, prestigescore = %s WHERE @rid = '%s'", Math.ceil(dataquailityscore), Math.ceil(statsdegreecentrality), Math.ceil(prestigescore), id);
  console.log('query:' + query);
  process.stdout.write('+');
  odb.db.query(query).then(function(records){
    console.log('Updated records:');
    console.dir(records);
    callback(null,records);
  });
}


function setVertexScore(id, prop, score, callback) {

  //var newScore = 1000 - score;
  var query = strUtil.format("UPDATE V SET %s = %s WHERE @rid = '%s'", prop, score, id);
  console.log('query:' + query);
  process.stdout.write('+');
  odb.db.query(query).then(function(records){
    console.log('Updated records:');
    console.dir(records);
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

function getCentralityScore(statType, score) {

  var prVal = score

  if (statType == 'statsbetweencentrality') {

    // 752 - 222873
    if (prVal / 100000 > 1) {
      var plus = (prVal / 100000) / 4;
      prVal = 11 + plus;
    } else if (prVal / 10000 > 1) {
      var plus = (prVal / 10000) / 4;
      prVal = 7 + plus;
    } else if (prVal / 1000 > 1) {
      var plus = (prVal / 1000) / 4;
      prVal = 3 + plus;
    } else if (prVal / 100 > 1) {
      var plus = (prVal / 100) / 4;
      prVal = 1 + plus;
    } else if (prVal / 10 > 1) {
      var plus = (prVal / 10) / 4;
      prVal = 0 + plus;
    }
    console.log('prVal:' + prVal + '~' + score);

  } else {

    prVal = 5 + (prVal * (5 / 84));
    console.log('prVal:' + prVal + '~' + score);

  }
  return prVal;
}



function loadVertexStats(infoObj, callback) {

  var count = infoObj.count;
  var record = infoObj.record;

  console.log('********************* loadVertexStats: ' + count);

  var allScores = {};
  //var query = strUtil.format("select @rid from V where @class = '%s'", objectType);

  var mainId = '#' + record.rid.cluster + ':' + record.rid.position;
  console.log('mainId: ' + mainId);

  var query = strUtil.format("traverse * from %s while $depth < 3", mainId);
  console.log('query:' + query);

  odb.db.query(query).then(function(records){

    console.log("records:" + records.length);
    //console.dir(records);
    var mainRec;

    // Prep records
    _.each(records, function(rec) {

      //console.log("record: ***********************************");
      //console.dir(rec);

      var id = '#' + rec['@rid'].cluster + ':' + rec['@rid'].position;
      console.log("prep id:" + id);
      rec.id = id;
      var className = rec['@class']
      rec.className = className;
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
      } else {
        if(id == mainId)
          mainRec = rec;
      }
    });

    var dataquailityscore=0;
    var statsdegreecentrality=0;
    var prestigescore=0;

    _.each(records, function(rec) {
      console.log("rec:" + rec);

      var id = rec.id;
      console.log("id:" + id);

      var className = rec['@class']
      console.log("className:" + className);

      var score=1;
      if(className.charAt(0) == 'V' && id == mainId) {

        // Set Node Scores
        console.log('Is Vertex');
        //console.dir(rec);

        // Data Quality Score
        var totalProp=0;
        var totalUsedProp=0;
        if(util.defined(schemas,className)) {
          //console.dir("schemas:" + className);
          //console.dir(schemas[className]);

          for (var prop in schemas[className]) {            
            //console.log("Prop:" + prop);
            totalProp++;
            if(util.defined(rec,prop))
              totalUsedProp++;
          }
          console.log('Prop:' + totalProp + ":" + totalUsedProp);
          if(totalProp > 0) {
            var score = Math.ceil((totalUsedProp/totalProp)*10);
            console.log('Vertext Score:' + score);
            dataquailityscore = score;
            //setVertexScore(id, 'dataquailityscore', score, function() {
            //});
          }
        }

        // Prestige Score
        var pscore = 0;
        console.log('pscore~start');

        // Compute Degree centrality - Total In and Out
        var totalEdges = 0;
         _.each(records, function(rec) {
            var className = rec['@class']
            console.log("Degree Centrality className:" + className);

            if(className.indexOf('E') == 0) {
              totalEdges++;
            }
            console.log("totalEdges:" + totalEdges);
        });

        statsdegreecentrality = totalEdges;
        //setVertexScore(id, 'statsdegreecentrality', totalEdges, function() {
        //});

        if(className == 'VPerson' || className == 'VSpinOff' || className == 'VCompany' || className == 'VResearchInstitution') {

          // Total Investments
          var totalInvIn = 0;
          var totalInvOut = 0;
          _.each(records, function(rec) {
            var className = rec['@class']
            console.log("className:" + className);
            
            if(className == 'EInvestor' && util.defined(rec,"inId")) {
              console.log('!!!!!!!!!!!!!! pscore~EInvestor:' + rec.inId);
              if(util.defined(rec,"out.amount")) {
                //console.dir(rec.out.amount);
                totalInvIn+=rec.out.amount;
              }
            }

            if(className == 'EFunded' && util.defined(rec,"outId")) {
              console.log('!!!!!!!!!!!!!! pscore~EInvestor:' + rec.inId);
              if(util.defined(rec,"out.amount")) {
                //console.dir(rec.out.amount);
                totalInvOut+=rec.out.amount;
              }
            }

          });

          console.log('totalInvIn:' + totalInvIn);
          console.log('totalInvOut:' + totalInvOut);

          if(totalInvIn > 0) {
            var calcPoints = (Math.floor(totalInvIn / 50000)) * .5;
            pscore+=calcPoints;       
            console.log('pscore:' + pscore);     
          }

          console.log('totalInvIn calcPoints:' + calcPoints);

          if(totalInvOut > 0) {
            var calcPoints = (Math.floor(totalInvOut / 50000)) * .5;
            pscore+=calcPoints;
            console.log('pscore:' + pscore);
          }

          console.log('totalInvOut calcPoints:' + calcPoints);

          if(className == 'VSpinOff' || className == 'VCompany' || className == 'VResearchInstitution') {

            // Number of SpinOffs
            var fndSpin = _.where(records, {className: 'ESpinOff'});
            console.log('**********Found Spin:');
            //console.dir(fndSpin);
            if(util.defined(fndSpin) && fndSpin.length > 0) {
              var tot = 0;
               _.each(fndSpin, function(rec) {
                console.log('**********Found Spin rec:' + rec["inId"]);
                if(util.defined(rec,"inId") && rec["inId"] != mainId) {
                  tot++;
                }
              });

              console.log('pscore~SpinOffs:' + tot);
              pscore+=tot;
              console.log('pscore:' + pscore);
            }


            // Number of Merger & Acquisition
            var fndRel = _.where(records, {className: 'EAcquire'});
            if(util.defined(fndRel) && fndRel.length > 0) {
              console.log('pscore~Merger:' + fndRel.length);
              pscore+=fndRel.length;
              console.log('pscore:' + pscore);
            }

            // Number of Employees
            // var fndRel = _.where(records, {className: 'EWorksfor'});
            // if(util.defined(fndRel) && fndRel.length > 0) {
            //   console.log('pscore~Employees:' + fndRel.length);
            //   pscore+=fndRel.length * .5;
            // }
            if(util.defined(mainRec,"size")) {
              console.log('pscore~Employees:' + mainRec['size']);
              pscore+=parseInt(mainRec['size']) / 100; 
              console.log('pscore:' + pscore);             
            }

          }

          // Has Awards          
          _.each(records, function(rec) {
            if(util.defined(rec,"certsawards")) {
              var awds = rec.certsawards.split('^').length;
              pscore += awds * .5;
              console.log('pscore~Awards:' + rec.certsawards);
              console.log('pscore:' + pscore);
            }
          })

          // Number of Patents
          var fndPat = _.where(records, {className: 'VPatent'});
          if(util.defined(fndPat) && fndPat.length > 0) {
            console.log('pscore~Patents:' + fndPat.length);
            pscore+=fndPat.length * .5;
            console.log('pscore:' + pscore);
          }

          // Number of Projects
          var fndRel = _.where(records, {className: 'VProject'});
          if(util.defined(fndRel) && fndRel.length > 0) {
            console.log('pscore~Projects:' + fndRel.length);
            pscore+=fndRel.length* .5;
            console.log('pscore:' + pscore);
          }

          // Number of Entrepreneurial Resource
          var fndRel = _.where(records, {className: 'VEntrepreneurialResource'});
          if(util.defined(fndRel) && fndRel.length > 0) {
            console.log('pscore~Resource:' + fndRel.length);
            pscore+=fndRel.length * .5;
            console.log('pscore:' + pscore);
          }

          // Number of VMedia
          var fndRel = _.where(records, {className: 'VMedia'});
          if(util.defined(fndRel) && fndRel.length > 0) {
            console.log('pscore~VMedia:' + fndRel.length);
            pscore+=fndRel.length * .5;
            console.log('pscore:' + pscore);
          }
        }

        console.log('**pscore:' + pscore);
        prestigescore = pscore;

        setVertexScores(id, dataquailityscore, statsdegreecentrality, prestigescore, function() {
        });

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

  console.log('********************* loadEdgeStats: ' + count);

  var allScores = {};
  //var query = strUtil.format("select @rid from V where @class = '%s'", objectType);

  var mainId = '#' + record.rid.cluster + ':' + record.rid.position;
  console.log('mainId: ' + mainId);

  var query = strUtil.format("traverse * from  %s while $depth < 3", mainId);
  console.log('query:' + query);

  odb.db.query(query).then(function(records){

    console.log("records:" + records.length);

    // Save main record
    var mainRec;

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
      } else {
        if(id == mainId)
          mainRec = rec;
      }
    });

    _.each(records, function(rec) {
      console.log("rec:" + rec);
      //console.dir(rec);

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

          var totalIn = 0;
          var totalOut = 0;
          var maxScore = 100000;
          var scaleScore = 1000;

          if(util.defined(rec,"in.prestigescore") && rec.in.prestigescore > 0) {
            console.log("prestigescore: " + rec.in.prestigescore);
            totalIn+=rec.in.prestigescore;
          }
          //else totalIn=maxScore;

          if(util.defined(rec,"in.dataquailityscore") && rec.in.dataquailityscore > 0) {
            console.log("dataquailityscore: " + rec.in.dataquailityscore);
            totalIn+=(rec.in.dataquailityscore/10);
          }
          //else totalIn=maxScore;

          // if(util.defined(rec,"in.statsbetweencentrality") && rec.in.statsbetweencentrality > 0) {
          //   console.log("statsbetweencentrality: " + rec.in.prestigescore);
          //   totalIn+=rec.in.statsbetweencentrality;
          // }
          // else totalIn=maxScore;

          console.log("totalIn:" + totalIn);


          if(util.defined(rec,"out.prestigescore") && rec.out.prestigescore > 0) {
            console.log("prestigescore: " + rec.out.prestigescore);
            totalOut+=rec.out.prestigescore;
          }
          //else totalOut=maxScore;

          if(util.defined(rec,"out.dataquailityscore") && rec.out.dataquailityscore > 0) {
            console.log("dataquailityscore: " + rec.out.dataquailityscore);
            totalOut+=(rec.out.dataquailityscore/10);
          }
          //else totalOut=maxScore;

          // if(util.defined(rec,"out.statsbetweencentrality") && rec.out.statsbetweencentrality > 0) {
          //   console.log("statsbetweencentrality: " + rec.out.prestigescore);
          //   totalOut+=rec.out.statsbetweencentrality;
          // }
          // else totalOut=maxScore;

          console.log("totalOut:" + totalOut);


          setEdgeScore(id, (scaleScore-(totalIn+totalOut)), function(error, data) {            
          });
          //process.exit(1);


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
      //console.dir(mapObjs);

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
          //console.dir(mapSetObjs);

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
    //console.dir(schemas)
  });


  var query = strUtil.format("update E set weight = 0");
  console.log('query:' + query);
  odb.db.query(query).then(function(records){


    var query = strUtil.format("update V set dataquailityscore = 0,prestigescore = 0, statsdegreecentrality = 0");
    console.log('query:' + query);
    odb.db.query(query).then(function(records){

      //var query = strUtil.format("select @rid from V where @class = 'VResearchInstitution'");
      //var query = strUtil.format("select @rid from V where @rid = '#39:0'");
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

});

