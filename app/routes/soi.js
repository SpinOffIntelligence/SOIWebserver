'use strict';

module.exports = function(app) {
	var soiControllers = require('../controllers/soi');

	app.post('/soi/account/register', soiControllers.accountRegister);
	app.post('/soi/account/login', soiControllers.accountLogin);
	app.post('/soi/account/forgot', soiControllers.accountForgot);
	app.post('/soi/account/updateProfile', soiControllers.accountUpdateProfile);



	app.post('/soi/getSchemas', soiControllers.getSchemas);
	app.post('/soi/fetchGridRecords', soiControllers.fetchGridRecords);
	app.post('/soi/searchRecords', soiControllers.searchRecords);

	app.post('/soi/removeImage', soiControllers.removeImage);


	app.post('/soi/getPickListValues', soiControllers.getPickListValues);
	app.post('/soi/addPickListValues', soiControllers.addPickListValues);
	app.post('/soi/savePickListValues', soiControllers.savePickListValues);

	app.post('/soi/pickListItem', soiControllers.deletePickListItem);

	app.post('/soi/getRecordDetails', soiControllers.getRecordDetails);
	app.post('/soi/fetchPanelRecords', soiControllers.fetchPanelRecords);

	app.post('/soi/findShortestPath', soiControllers.findShortestPath);
	app.post('/soi/findShortestPathDetail', soiControllers.findShortestPathDetail);
	app.post('/soi/findShortestPathFilter', soiControllers.findShortestPathFilter);

	app.post('/soi/fetchPanelRecord', soiControllers.fetchPanelRecord);

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

	app.post('/soi/importStats', soiControllers.importStats);
	
 };

