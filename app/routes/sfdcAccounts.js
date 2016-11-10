'use strict';

module.exports = function(app, passport, logger) {

	var sfdcAccounts = require('../controllers/sfdcAccounts');
	app.get('/sfdc/accounts', sfdcAccounts.getAccounts);

};
