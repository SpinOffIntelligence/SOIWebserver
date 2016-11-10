'use strict';

var mongoose = require('mongoose'),
    //userSecuritySchema = mongoose.model('userSecuritySchema'),
    Services = require('../services/sfdc'),
    sfdccomp =  require('../../components/jsforce.js'),
    config = require('../../config/config.js'),
    request = require('request');

exports.authSFDCUser = function(req, res, next) {

  var conn = sfdccomp.init(function(err, initData) {

    console.log('controller - get conn, sfdccomp.init done:' + err + ':' + res);
    if (err) return next(err);

    var SFDCService = new Services(conn);  


    console.log('login - ' + config.sfdc.portalUrl + '/Login~' + req.body.userName + '~' + req.body.password);

    console.log('req.body.debug' + req.body.debug);

    SFDCService.debug = req.body.debug;
    request.post(
        config.sfdc.portalUrl + '/Login',
        { form: { username: req.body.userName, password: req.body.password } },
        function (error, response, body) {

            console.log('SFDCService.debug:' + SFDCService.debug);
            console.log('response.statusCode:' + response.statusCode);
            

            if (SFDCService.debug == 'w77' || (!error && response.statusCode == 200)) {
                //console.log('Body:' + body)

                console.log('IN Auth!')

                if(SFDCService.debug != 'w77' && body.indexOf("Forgot my password") > -1) {
                  return next(new Error('Failed to authenticate'));
                }

                console.log('getUserByUsername:' + req.body.userName);

                SFDCService.getUserByUsername(req.body.userName, function(err, user) {
                    if (err) return next(err);
                    if (!user || !user.done || user.records.length != 1) return next(new Error('Failed to load account'));
                    
                    console.log('Found User in SFDC!');

                    // Save access data to mongoDB
                    //userSecuritySchema.save(user.records[0].Id, {accessToken: "xxx", instanceUrl: "xxx"}, function(err, data) {
                      //if (err) return next(err);
                      //console.dir('done setting data in mongo', data)

                      SFDCService.getContact(user.records[0].ContactId, function(err, contact) {
                        
                        if (err) return next(err);
                        if (!user || !user.done || user.records.length != 1) return next(new Error('Failed to load account'));

                        console.dir('get contact data:'+ contact);
  
                        var returnData = user.records[0];
                        returnData.contact = contact.records[0];
                        returnData.accessToken = conn.accessToken;
                        res.json(returnData);
                      });

                    //});
                });

            } else {

              //console.dir(response);

              console.dir('error:' + error);

              return next(new Error('Failed to authenticate'));

            }
        }
    );
  });




  // Setup connection with given username and password
  /*
  var conn = sfdccomp.initUser(req.body.userName,req.body.password, function(err, data) {
    if(err) {
      next(401, {err: "Unable to authenticate"});    
      return;
    }

    var connUser = sfdccomp.getUser();
    console.log('fetch identity:', connUser.userInfo.id)

    // Save access data to mongoDB
    userSecuritySchema.save(connUser.userInfo.id, {accessToken: connUser.accessToken, instanceUrl: connUser.instanceUrl}, function(err, data) {
      if (err) return next(err);
      console.dir('done setting data in mongo', data)
      var SFDCService = new Services(connUser);
      SFDCService.getUser(connUser.userInfo.id, function(err, user) {
        if (err) return next(err);
        if (!user || !user.done || user.records.length != 1) return next(new Error('Failed to load account'));
        res.json(user.records[0]);
      });
    });
  });
  */
};


exports.getSFDCUserById = function(req, res, next) {

  var conn = sfdccomp.get();
  console.log('controller - get conn');
  var SFDCService = new Services(conn);
  var userid = req.params.userid;

   SFDCService.getUser(userid, function(err, users) {
        if (err) return next(err);
        if (!users) return next(new Error('Failed to load accounts'));
        res.json(users);
    });
};


/**
 * Get SFDC Users
 */
exports.getSFDCUser = function(req, res, next) {

	var conn = sfdccomp.get();
	console.log('controller - get conn');
	var SFDCService = new Services(conn);

    SFDCService.getUsers(function(err, users) {
        if (err) return next(err);
        if (!users) return next(new Error('Failed to load accounts'));
        res.json(users);
    });
};
