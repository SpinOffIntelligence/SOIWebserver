'use strict';

var apn = require('apn');

var conn;

  var errFunc = function(err, note) {
      console.log('APN Connection Error:' + err + ':' + note)
  }


// Initializing logger
function init(connection) {

  if(connection !== null && typeof connection !== 'undefined') {
    conn = connection;
  } else {

    var options = {
        cert: 'aps_development.pem',                 /* Certificate file path */
        certData: null,                   /* String or Buffer containing certificate data, if supplied uses this instead of cert file path */
        key:  'GARPApps.pem',                  /* Key file path */
        keyData: null,                    /* String or Buffer containing key data, as certData */
        passphrase: 'spain01',                 /* A passphrase for the Key file */
        ca: null,                         /* String or Buffer of CA data to use for the TLS connection */
        gateway: 'gateway.sandbox.push.apple.com',/* gateway address */
        port: 2195,                       /* gateway port */
        enhanced: true,                   /* enable enhanced format */
        errorCallback: errFunc,         /* Callback when error occurs function(err,notification) */
        cacheLength: 100                  /* Number of notifications to cache for error purposes */
    }
    conn = new apn.Connection(options);
  }

  console.log('APN Connection established:' + conn)
  return conn;
} 

function get() {
    return conn;
} 

module.exports.init = init;
module.exports.get = get;