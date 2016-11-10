'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    UserFRMAppMeta = mongoose.model('UserFRMAppMeta'),
    UserFRMAppSettings = mongoose.model('UserFRMAppSettings'),
    Message = mongoose.model('Message'),    
    Services = require('../services/sfdc'),
    sfdccomp =  require('../../components/jsforce.js'),
    apncomp =  require('../../components/apn.js'),
    utilities =  require('../../components/utilities.js'),
    _ = require('lodash');

var gcm = require('node-gcm');
var apn = require('apn');
var util = require('util');
var fs = require('fs');

/**
 * Get User and Settings
 */
exports.getFRMAppUserExam = function(req, res) {


  // Load User
  var exam = {
      name:"FRM Part 1",
      address:"2130 Fulton Street",
      city:"San Francisco",
      state:"CA",
      zip:"94117-1080",
      country:"USA",
      day:"November 11th, 2013",
      time:"7:00 am",
      duration:"2"
  };

  sfdccomp.getToken(function(err, conn) {
    if (err) return res.send(500, {error: err});

    console.log('controller - get conn');
    var SFDCService = new Services(conn);
    
    SFDCService.getExams(req.params.id, function(err, data) {
        if (err) return res.send(500, {error: err});
        if (!data) return res.send(404, {error: 'Not Found'});

        //exam.name = Exam_Site__r.Site__r.Name;
        //exam.address = Exam_Site__r.Site__r.Display_Address__c;
        //exam.day = Exam_Site__r.Exam__r.Exam_Date__c;

        exam.registrations = data;

        res.json(exam);         
    });  
  });

    //res.json(exam);
};





exports.getFRMAppQuestionsReadings = function(req, res) {

  console.log('getFRMAppQuestionsReadings');

  sfdccomp.getToken(function(err, conn) {
    if (err) return res.send(500, {error: err});
    console.log('controller - get conn');
    var SFDCService = new Services(conn);

    //var body = req.body;

    SFDCService.getQuestionsReadings(req.params.exam, req.params.year, function(err, data) {
        if (err) return res.send(500, {error: err});
        if (!data) return res.send(404, {error: 'Not Found'});
        res.json(data);
    });
  });
};

exports.getFRMAppReadings = function(req, res) {

  console.log('getFRMAppReadings');

  sfdccomp.getToken(function(err, conn) {
    if (err) return res.send(500, {error: err});
    console.log('controller - get conn');
    var SFDCService = new Services(conn);

    //var body = req.body;

    SFDCService.getReadings(req.params.exam, req.params.year, function(err, data) {
        if (err) return res.send(500, {error: err});
        if (!data) return res.send(404, {error: 'Not Found'});
        res.json(data);
    });
  });
};

exports.getFRMAppQuestion = function(req, res) {

  console.log('getFRMAppQuestion');

  sfdccomp.getToken(function(err, conn) {
    if (err) return res.send(500, {error: err});
    console.log('controller - get conn');
    var SFDCService = new Services(conn);

    //var body = req.body;

    SFDCService.getQuestion(req.params.exam, req.params.year, function(err, data) {
        if (err) return res.send(500, {error: err});
        if (!data) return res.send(404, {error: 'Not Found'});
        res.json(data);
    });
  });
};


exports.getExamSites = function(req, res) {

  sfdccomp.getToken(function(err, conn) {
    if (err) return res.send(500, {error: err});
    console.log('controller - get conn');
    var SFDCService = new Services(conn);

    SFDCService.getExamSites(function(err, settings) {
        if (err) return res.send(500, {error: err});
        if (!settings) return res.send(404, {error: 'Not Found'});
        res.json(settings);
    });
  });
};

exports.registerMsg = function(req, res) {
    
    var body = req.body;

    UserFRMAppSettings.findOneAndUpdate({userId: req.params.id}, {settings: {gcmId: body.gcmId}}, {new: true, upsert: true}, function(err, settings) {

        if (err) {
           res.send(500, {error: err});
        } else {
            res.json(settings);
        }

    });
}

/**
 * Get Meta
 */
exports.getMeta = function(req, res) {


console.log('controller getMeta - get conn');

    sfdccomp.getToken(function(err, conn) {
        if (err) return res.send(500, {error: err});
        console.log('controller getMeta - get conn');

        var SFDCService = new Services(conn);

        //UserFRMAppSettings.load(req.params.id, function(err, settings) {
        SFDCService.getMeta(req.params.id, function(err, data) {

            console.log('return from SFDCService.getMeta');
            console.dir(data);

            if (err) return res.send(500, {error: err});
            if (!data) return res.send(404, {error: 'Not Found'});
            res.json(data);
        
        });
    });
};

/**
 * Upsert Meta
 */
exports.setMetaItem = function(req, res) {

    var inMeta = req.body;
    console.log('setMetaItem: ' + util.inspect(inMeta, {showHidden: false, depth: null}));

    sfdccomp.getToken(function(err, conn) {
        if (err) return res.send(500, {error: err});
        console.log('controller setMetaItem - get conn');

        var SFDCService = new Services(conn);

        console.log('setMetaItem - get');
        SFDCService.finalData = [];
        SFDCService.getMeta(req.params.id, function(err, data) {

            try {
                if(data !== null && typeof data !== 'undefined')
                    console.log('setMetaItem - get:' + util.inspect(data, {showHidden: false, depth: null}));
                else console.log('setMetaItem - get: EMPTY');

                //console.log('Now Loop:' + inMeta.length);

                //for(var i=0; i<inMeta.length; i++) {
                    var inMetaData = inMeta;

                    console.log('inMetaData:' + inMetaData)

                    var meta = null;
                    if(utilities.defined(data,"metaData.length") && data.metaData.length > 0)
                        var meta = _.findWhere(data.metaData, {readingId: inMetaData.readingId});

                    console.log('Find meta:' + util.inspect(meta, {showHidden: false, depth: null}));

                    // If not found create!!
                    if(meta === null || typeof meta === 'undefined') {
                        console.log('Create');
                        SFDCService.createMeta(req.params.id, inMetaData, function(err, ret) {
                            if (err) {
                               res.send(500, {error: err});
                            } else {
                                inMetaData.Id = ret.id;
                            }
                        });            

                    } else {

                        inMetaData.Id = meta.Id;
                        console.log('setMetaItem - update' + util.inspect(inMeta, {showHidden: false, depth: null}));

                        console.log('Set');
                        SFDCService.setMeta(req.params.id, inMetaData, function(err, ret) {
                            if (err) {
                               res.send(500, {error: err});
                            } else {
                                //res.json(ret);
                            }
                        });            
                    }                
                //}
                console.log('setMetaItem - final!' + util.inspect(inMeta, {showHidden: false, depth: null}));
                res.json(inMeta);
            }
            catch(err) {
                console.log('ERROR: ' + err.message);
            }

        });
    });
};



/**
 * Upsert Meta
 */
exports.setMeta = function(req, res) {

    var inMeta = req.body;
    console.log('setMeta: ' + util.inspect(inMeta, {showHidden: false, depth: null}));

    sfdccomp.getToken(function(err, conn) {
        if (err) return res.send(500, {error: err});
        console.log('controller setMeta - get conn');

        var SFDCService = new Services(conn);

        console.log('setMeta - get');
        SFDCService.finalData = [];
        SFDCService.getMeta(req.params.id, function(err, data) {

            try {
                if(data !== null && typeof data !== 'undefined')
                    console.log('setMeta - get:' + util.inspect(data, {showHidden: false, depth: null}));
                else console.log('setMeta - get: EMPTY');

                console.log('Now Loop:' + inMeta.length);

                for(var i=0; i<inMeta.length; i++) {
                    var inMetaData = inMeta[i];

                    console.log('Loop meta:' + inMetaData)

                    var meta = null;
                    if(utilities.defined(data,"metaData.length") && data.metaData.length > 0)
                        var meta = _.findWhere(data.metaData, {readingId: inMetaData.readingId});

                    console.log('Find meta:' + util.inspect(meta, {showHidden: false, depth: null}));

                    // If not found create!!
                    if(meta === null || typeof meta === 'undefined') {
                        console.log('Create');
                        SFDCService.createMeta(req.params.id, inMetaData, function(err, ret) {
                            if (err) {
                               res.send(500, {error: err});
                            } else {
                                inMetaData.Id = ret.id;
                            }
                        });            

                    } else {

                        inMetaData.Id = meta.Id;
                        console.log('setMeta - update' + util.inspect(inMeta, {showHidden: false, depth: null}));

                        console.log('Set');
                        SFDCService.setMeta(req.params.id, inMetaData, function(err, ret) {
                            if (err) {
                               res.send(500, {error: err});
                            } else {
                                //res.json(ret);
                            }
                        });            
                    }                
                }
                console.log('setMeta - final!' + util.inspect(inMeta, {showHidden: false, depth: null}));
                res.json(inMeta);
            }
            catch(err) {
                console.log('ERROR: ' + err.message);
            }

        });
    });
};

/**
 * Get Settings
 */
exports.getSettings = function(req, res) {

    sfdccomp.getToken(function(err, conn) {
        if (err) return res.send(500, {error: err});
        console.log('controller - get conn');

        var SFDCService = new Services(conn);

        //UserFRMAppSettings.load(req.params.id, function(err, settings) {
        SFDCService.getSettings(req.params.id, function(err, data) {

            console.log('return from SFDCService.getSettings');
            console.dir(data);

            if (err) return res.send(500, {error: err});
            if (!data) return res.send(404, {error: 'Not Found'});
            res.json(data);
        
        });
    });
};


/**
 * Upsert Settings
 */
exports.setSettings = function(req, res) {

    var inSettings = req.body;
    console.log('setSettings: ' + util.inspect(inSettings, {showHidden: false, depth: null}));

    sfdccomp.getToken(function(err, conn) {
        if (err) return res.send(500, {error: err});
        console.log('controller - get conn');

        var SFDCService = new Services(conn);

        console.log('setSettings - get');
        SFDCService.getSettings(req.params.id, function(err, data) {

            console.dir('setSettings - get:' + data);

            // If empty Id create!!
            if(data.settings.Id == '') {
                console.log('Create');
                SFDCService.createSettings(req.params.id, inSettings, function(err, ret) {
                    if (err) {
                       res.send(500, {error: err});
                    } else {
                        res.json(ret);
                    }
                });            

            } else {
                console.log('Set');
                SFDCService.setSettings(req.params.id, inSettings, function(err, ret) {
                    if (err) {
                       res.send(500, {error: err});
                    } else {
                        res.json(ret);
                    }
                });            
            }
        });
    });
};

/**
 * Get Meta Data
 */
// exports.getMeta = function(req, res) {
//     UserFRMAppMeta.load(req.params.id, function(err, meta) {
//         if (err) return res.send(500, {error: err});
//         if (!meta) return res.send(404, {error: 'Not Found'});
//         res.json(meta);
//     });
// };

/**
 * Upsert Meta Data
 */
// exports.setMeta = function(req, res) {

//     UserFRMAppMeta.findOneAndUpdate({userId: req.params.id}, {metaData: req.body}, {new: true, upsert: true}, function(err, settings) {

//         if (err) {
//            res.send(500, {error: err});
//         } else {
//             res.json(settings);
//         }

//     });
// };
exports.sendAlerts = function(req, res) {

    var msg = req.body.msg;
    var title = req.body.title;
    var sound = req.body.sound;
    var apnRegistrationIds = req.body.apns;
    var gcmRegistrationIds = req.body.gcms;

    console.log('title:' + title)
    console.log('msg:' + msg)
    console.log('sound:' + sound)
    console.log('gcmRegistrationIds:' + gcmRegistrationIds)
    console.log('apnRegistrationIds:' + apnRegistrationIds)

    // Google GCN
    if(gcmRegistrationIds.length > 0) {

        var sender = new gcm.Sender('AIzaSyCNK_2q6MtvaRpbhl-2taOp492nsL7TrFs');
        var message = new gcm.Message();
        message.addData('message',msg);
        message.addData('title',title );
        message.addData('msgcnt','1'); // Shows up in the notification in the status bar
        if(req.body.sound == true) {
            message.addData('soundname','beep.wav'); //Sound to play upon notification receipt - put in the www folder in app        
        }
        message.timeToLive = 3000;// Duration in seconds to hold in GCM and retry before timing out. Default 4 weeks (2,419,200 seconds) if not specified.


        sender.send(message, gcmRegistrationIds, 4, function (result) {
            console.log('Send Result:' + result);

            if (result != null) {
               res.send(500, {error: result});
            } else {

                console.log('Send Result Good!');
            }
        });
    }

    // Apple APN
    if(apnRegistrationIds.length > 0) {
        var apnConnection = apncomp.get();
        console.dir('APN Con: ' + apnConnection);

        var note = new apn.Notification();
        note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
        note.badge = 1;
        note.sound = "ping.aiff";
        note.alert = title + ":" + msg;
        note.payload = {'messageFrom': 'GARP'};

        //var myDevice = new apn.Device(registrationIds[0]);
        apnConnection.pushNotification(note, apnRegistrationIds);
    }

    res.send(200);
}

exports.sendMessage = function(req, res) {

    //API Server Key
    var gcmRegistrationIds = [];
    var apnRegistrationIds = [];
    var msg = req.body.msg;
    var title = req.body.title;
    var sites = req.body.sites;

    console.log('sendMessage:' + title + ":" + msg + ":" + sites);   

    // Save Message to Mongo
    var mMessage = new Message();
    mMessage.title = title;
    mMessage.body = msg;
    mMessage.sites = sites;
    mMessage.save(function(err) {
        console.log('mMessage.save:' + mMessage);
    });

    UserFRMAppSettings
    .where('settings.examId').in(sites)
    .exec(function(err, settings) {

        if (err) {
           res.send(500, {error: err});
        } else {

            console.log('Found Users:' + util.inspect(settings, {showHidden: false, depth: null}));
            for(var i=0; i < settings.length; i++) {

                if(settings[i].settings.gcmId !== null && typeof settings[i].settings.gcmId !== 'undefined') {
                    gcmRegistrationIds.push(settings[i].settings.gcmId);
                }
                if(settings[i].settings.apnId !== null && typeof settings[i].settings.apnId !== 'undefined') {
                    apnRegistrationIds.push(settings[i].settings.apnId);
                }

            }
            console.log('gcmRegistrationIds:' + gcmRegistrationIds)
            console.log('apnRegistrationIds:' + apnRegistrationIds)

            // Google GCN
            if(gcmRegistrationIds.length > 0) {

                var sender = new gcm.Sender('AIzaSyCNK_2q6MtvaRpbhl-2taOp492nsL7TrFs');
                var message = new gcm.Message();
                message.addData('message',msg);
                message.addData('title',title );
                message.addData('msgcnt','1'); // Shows up in the notification in the status bar
                if(req.body.sound == true) {
                    message.addData('soundname','beep.wav'); //Sound to play upon notification receipt - put in the www folder in app        
                }
                message.timeToLive = 3000;// Duration in seconds to hold in GCM and retry before timing out. Default 4 weeks (2,419,200 seconds) if not specified.


                sender.send(message, gcmRegistrationIds, 4, function (result) {
                    console.log('Send Result:' + result);

                    if (result != null) {
                       res.send(500, {error: result});
                    } else {

                        console.log('Send Result Good!');
                    }
                });
            }

            // Apple APN
            if(apnRegistrationIds.length > 0) {
                var apnConnection = apncomp.get();
                console.dir('APN Con: ' + apnConnection);

                var note = new apn.Notification();
                note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                note.badge = 1;
                note.sound = "ping.aiff";
                note.alert = title + ":" + msg;
                note.payload = {'messageFrom': 'GARP'};

                //var myDevice = new apn.Device(registrationIds[0]);
                apnConnection.pushNotification(note, apnRegistrationIds);
            }
        }
    });

    res.send(200);
}
