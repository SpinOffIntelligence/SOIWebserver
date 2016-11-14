'use strict';

module.exports = function(app) {

	var soiControllers = require('../controllers/soi');

	app.get('/soi/organizations', soiControllers.getOrganizations);
	app.post('/soi/fetchPanelRecords', soiControllers.fetchPanelRecords);
	app.post('/soi/savePanelRecord', soiControllers.savePanelRecord);

 };

