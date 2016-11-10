'use strict';

// Articles routes use articles controller
var frmApp = require('../controllers/frmApp'),
    messages = require('../controllers/messages'),
    express = require('express');
    
module.exports = function(app, passport, logger) {


    app.get('/frmApp/questions/:exam/:year', frmApp.getFRMAppQuestion);
    app.get('/frmApp/readings/:exam/:year', frmApp.getFRMAppReadings);
    app.get('/frmApp/questionsReadings/:exam/:year', frmApp.getFRMAppQuestionsReadings);
    

    app.get('/frmApp/user/:id/exam', frmApp.getFRMAppUserExam);

    app.get('/frmApp/user/:id/settings', frmApp.getSettings);
    app.put('/frmApp/user/:id/settings', frmApp.setSettings);

    app.get('/frmApp/user/:id/metaData', frmApp.getMeta);
    app.put('/frmApp/user/:id/metaData', frmApp.setMeta);

    app.put('/frmApp/user/:id/metaDataItem', frmApp.setMetaItem);


    //app.get('/frmApp/msg', messages.getAllMessages);
    //app.get('/frmApp/exam/:id/msg', messages.getMessageByExamId);

    app.post('/frmApp/alerts', frmApp.sendAlerts);

    //app.post('/frmApp/user/:id/msg', frmApp.sendMessage);
    app.post('/frmApp/user/:id/registerMsg', frmApp.registerMsg);

    //app.get('/frmApp/system/examSites', frmApp.getExamSites);

    //app.use("/frmApp/data", express.static(__dirname + "../data"))

};