'use strict';

var odb = require('../../components/orientdb.js');

exports.getOrganizations = function(req, res, next) {

	console.log(odb.server);

	// odb.db.query(
	//    "select Name from (Select expand( out('Worksfor') ) From VPerson Where Name = 'Bob')"
	// ).then(function(hitters){
	//    console.log(hitters)
	// 	res.json(hitters);
	// });

odb.db.class.get('VOrg').then(function(vorg){
	vorg.create({
	   Name:      "VOrgX1",
	}).then(
	   function(player){
	      console.log('Created Record: ' player.name);
	   }
	);
});

