'use strict';

module.exports = function(app) {

	var soi = require('../controllers/soi');

	app.get('/soi/organizations', soi.getOrganizations);
	app.post('/soi/fetchRecords', soi.fetchRecords);

 };

