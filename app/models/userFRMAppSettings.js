'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Schemas
 */
 var settingsSchema = new Schema({
    
});

var UserFRMAppSettingsSchema = new Schema({
    userId: {
        type: String, 
        required: true
    },
    settings: {
        organizeBy: {
            type: String,
            default: 'topic',
            trim: true
        }, gcmId: {
            type: String,
            trim: true
        }, apnId: {
            type: String,
            trim: true
        }, examId: {
            type: String,
            trim: true
        },reminders: []
    }
});   

/**
 * Validations
 */
// UserFRMAppSettingsSchema.path('organizeBy').validate(function(organizeBy) {
//     if(organizeBy != 'topic' && organizeBy != 'week') {
//         return false
//     } else {
//         return true;
//     }
// }, 'organizeBy can be either topic or week only');


/**
 * Statics
 */
UserFRMAppSettingsSchema.statics.load = function(userId, cb) {
    this.findOne({
        userId: userId
    }).exec(cb);
};

UserFRMAppSettingsSchema.statics.set = function(userId, cb) {
    this.findOne({
        userId: userId
    }).exec(cb);
};


mongoose.model('UserFRMAppSettings', UserFRMAppSettingsSchema);
