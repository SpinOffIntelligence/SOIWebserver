var config = require('./config'),
    path = require('path'),
    utilities = require('../components/utilities.js');
    
  module.exports = function(app,express){

  app.use("/www", express.static(path.join(__dirname, '../public')));

}