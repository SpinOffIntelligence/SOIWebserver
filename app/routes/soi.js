'use strict';

module.exports = function(app) {

	var soi = require('../controllers/soi');

	app.get('/soi/organizations', soi.getOrganizations);

 };

