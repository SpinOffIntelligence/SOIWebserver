'use strict';

var Services = require('../services/sfdc'),
    sfdccomp =  require('../../components/jsforce.js');

/**
 * Get SFDC Accounts
 */
exports.getAccounts = function(req, res, next) {

	var conn = sfdccomp.getToken();
	console.log('controller - get conn');
	var SFDCService = new Services(conn);

    SFDCService.getAccounts(function(err, accounts) {
        if (err) return next(err);
        if (!accounts) return next(new Error('Failed to load accounts'));
        res.json(accounts);
    });
};
