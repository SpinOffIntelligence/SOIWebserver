'use strict';

module.exports = function(app) {

	var soiControllers = require('../controllers/soi');

	app.post('/soi/getSchemas', soiControllers.getSchemas);

	app.post('/soi/getRecordDetails', soiControllers.getRecordDetails);
	app.post('/soi/fetchPanelRecords', soiControllers.fetchPanelRecords);
	app.post('/soi/updatePanelRecord', soiControllers.updatePanelRecord);
	app.post('/soi/addPanelRecord', soiControllers.addPanelRecord);
	app.post('/soi/deletePanelRecord', soiControllers.deletePanelRecord);
	app.post('/soi/fetchRecords', soiControllers.fetchRecords);

	app.post('/soi/updateEdge', soiControllers.updateEdge);	
	app.post('/soi/getEdge', soiControllers.getEdge);	
	app.post('/soi/getEdgeBySource', soiControllers.getEdgeBySource);	
	app.post('/soi/addEdge', soiControllers.addEdge);
	app.post('/soi/deleteEdge', soiControllers.deleteEdge);

	app.post('/soi/getRelationship', soiControllers.getRelationship);
	app.post('/soi/getRelationshipDetails', soiControllers.getRelationshipDetails);

 };

