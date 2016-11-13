'use strict';

module.exports = function(app) {

	var soiControllers = require('../controllers/soi');

	app.get('/soi/organizations', soiControllers.getOrganizations);
	app.post('/soi/fetchRecords', soiControllers.fetchRecords);

 };

