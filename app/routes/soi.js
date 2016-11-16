'use strict';

module.exports = function(app) {

	var soiControllers = require('../controllers/soi');

	app.post('/soi/fetchPanelRecords', soiControllers.fetchPanelRecords);
	app.post('/soi/updatePanelRecord', soiControllers.updatePanelRecord);
	app.post('/soi/addPanelRecord', soiControllers.addPanelRecord);
	app.post('/soi/deletePanelRecord', soiControllers.deletePanelRecord);

 };

