'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * User Security Schema
 */

var userSecuritySchema = new Schema({
    userId: {
        type: String,
        require: true
    },
    securityData: {
        accessToken: {
            type: String,
            require: true
        },
        instanceUrl: {
            type: String,
            require: true
        }        
    }
});


userSecuritySchema.statics.load = function(userId, cb) {
    this.findOne({
        userId: userId
    }).exec(cb);
};

userSecuritySchema.statics.save = function(userId, userSecurityData, cb) {
    this.findOneAndUpdate({userId: userId}, {securityData: userSecurityData}, {new: true, upsert: true}, cb);
};



mongoose.model('userSecuritySchema', userSecuritySchema);
