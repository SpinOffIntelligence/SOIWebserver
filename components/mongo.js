var config = require('../config/config'),
    mongoose = require('mongoose');
var db;

// Initializing logger
function init() {
  if(config.db != null) {
  	db = mongoose.connect(config.db);
	console.log("Connect to Mongo");
  }
  return db;
} 

function get() {
    return db;
} 

module.exports.init = init;
module.exports.get = get;


// Bootstrap SFDC Connection

