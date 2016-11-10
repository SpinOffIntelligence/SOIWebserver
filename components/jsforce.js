var config = require('../config/config'),
    jsforce = require('jsforce');
var conn;
var connUser;

// Initializing logger
function init(callback) {
  conn = new jsforce.Connection({
    loginUrl : config.sfdc.loginUrl
  });

	conn.login(config.sfdc.userName, config.sfdc.password, function(err, res) {
	    console.log('SFDC Connection complete: ' + err);
      console.log('SFDC Connection Token: ' + conn.accessToken);
      console.log('conn.instanceUrl: ' + conn.instanceUrl);
      callback(err, res);
	});

  return conn;
} 

function get() {
    return conn;
} 

function getToken(callback) {

  console.log('Start getToken');

  var jsforce = require('jsforce');
  var connToken = new jsforce.Connection({
    instanceUrl : conn.instanceUrl,
    accessToken : conn.accessToken,
    maxRequest : 100
  });
  console.log('SFDC Token Connection complete: ' + connToken);
  conn.identity(function(err, res) {

    console.log('conn.identity return:' + err + ':' + res);

    if(err) {

      console.log('cal init');

      init(function(err, res) {

        console.log('init return:' + err + ':' + res);

        if(!err) { 
          var connToken = new jsforce.Connection({
            instanceUrl : conn.instanceUrl,
            accessToken : conn.accessToken
          });

          console.log('recreate token:' + connToken);

          callback(null, connToken);      
        } else {
          callback(err, null);
        }
      });
    } else {
      callback(null, connToken);
    }
  });
  return connToken;
}


function initUser(username,password, callback) {
  connUser = new jsforce.Connection({
    loginUrl : config.sfdc.loginUrl
  });

  connUser.login(username, password, function(err, res) {
      console.log('initUser - SFDC Connection complete: ' + err);
      console.log('SFDC Connection Token: ' + conn.accessToken);
      console.log(conn.instanceUrl);
      callback(err, res);
  });
} 

function getUser() {
    return connUser;
} 



module.exports.init = init;
module.exports.get = get;
module.exports.getToken = getToken;
module.exports.initUser = initUser;
module.exports.getUser = getUser;


// Bootstrap SFDC Connection

