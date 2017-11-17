var OrientDB = require('orientjs');
var odb =  require('./components/orientdb.js');
var fs = require('fs');
var strUtil = require('util');
var _ = require('underscore');
var soiControllers = require('./app/controllers/soi');
var util = require('./components/utilities.js');
var async = require('async');
var comboCnt = 0;

function removeEdge(id, callback) {

  var query = strUtil.format("delete edge %s", id);
  console.log('query:' + query);
  process.stdout.write('+');
  odb.db.query(query).then(function(records){
    callback(null,records);
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

  var query = strUtil.format("select from V");
  console.log('query:' + query);
  odb.db.query(query).then(function(records){
    var allRecords = records;
    var mapObjs = [];
    var cnt=0;
    _.each(allRecords, function(rec) {
      var id = '#' + rec['@rid'].cluster + ':' + rec['@rid'].position;
      console.log("prep id:" + id);
      mapObjs.push({id: id});
    });
    console.log('mapObjs:' + mapObjs.length);
    //console.dir(mapObjs);
    var query = strUtil.format("select from E");
    console.log('query:' + query);
    odb.db.query(query).then(function(records){
       _.each(records, function(rec) {
        var id = '#' + rec['@rid'].cluster + ':' + rec['@rid'].position;
        console.log("prep id:" + id);

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

        var fndOut = _.findWhere(mapObjs, {id: outId});
        var fndIn = _.findWhere(mapObjs, {id: inId});
        if(!util.defined(fndIn) || !util.defined(fndOut)) {
          removeEdge(id, function(err, data) {
          });
        }
      });
      process.exit(1); 
    });
  });
});

