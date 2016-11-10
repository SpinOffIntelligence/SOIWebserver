'use strict';

module.exports = function(app, passport, logger) {

  var sfdcUsers = require('../controllers/sfdcUsers');
  var legacy = require('../controllers/legacy');

  app.get('/sfdc/users', sfdcUsers.getSFDCUser);
  app.get('/sfdc/user/:userid', sfdcUsers.getSFDCUserById);
  app.post('/sfdc/auth/user', sfdcUsers.authSFDCUser);
  app.post('/legacy/auth/user', legacy.authLegacyUser);

};
