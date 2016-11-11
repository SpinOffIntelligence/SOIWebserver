var util = require('util');
var loggercomp = require('../../components/logger.js');
var logger = loggercomp.get();
var _ = require('underscore');
var moment = require('moment');
var utilities = require('../../components/utilities.js');
var config = require('../../config/config');
var https = require('https');

var SOIService = function SOIService(conn) {
  this.dbcon = conn;
};



SOIService.prototype.getReportsData = function(reportId, callback) {
}
