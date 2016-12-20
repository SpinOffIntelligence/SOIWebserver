'use strict';

module.exports = function(app) {

	var soiControllers = require('../controllers/soi');

	app.post('/soi/getSchemas', soiControllers.getSchemas);

	app.post('/soi/fetchGridRecords', soiControllers.fetchGridRecords);

	app.post('/soi/searchRecords', soiControllers.searchRecords);

	app.post('/soi/getRecordDetails', soiControllers.getRecordDetails);
	app.post('/soi/fetchPanelRecords', soiControllers.fetchPanelRecords);
	app.post('/soi/updatePanelRecord', soiControllers.updatePanelRecord);
	app.post('/soi/addPanelRecord', soiControllers.addPanelRecord);
	app.post('/soi/deletePanelRecord', soiControllers.deletePanelRecord);
	app.post('/soi/fetchRecords', soiControllers.fetchRecords);
	app.post('/soi/fetchRecordByProp', soiControllers.fetchRecordByProp);

	app.post('/soi/updateEdge', soiControllers.updateEdge);	
	app.post('/soi/getEdge', soiControllers.getEdge);	
	app.post('/soi/getEdgeBySource', soiControllers.getEdgeBySource);	
	app.post('/soi/addEdge', soiControllers.addEdge);
	app.post('/soi/deleteEdge', soiControllers.deleteEdge);

	app.post('/soi/getRelationship', soiControllers.getRelationship);
	app.post('/soi/getRelationshipDetails', soiControllers.getRelationshipDetails);

	app.post('/soi/getLogInfo', soiControllers.getLogInfo);
	app.post('/soi/deleteLogInfo', soiControllers.deleteLogInfo);

	app.post('/soi/exportRecords', soiControllers.exportRecords);
	
 };

