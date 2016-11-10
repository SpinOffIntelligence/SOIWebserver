'use strict';

var logger = require('mean-logger'),

// Initializing logger
function init(app, passport, mongoose) {
    logger.init(app, passport, mongoose);
    return logger;
} 

function get() {
    return logger;
} 

module.exports.init = init;
module.exports.get = get;