'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Meta Schema
 */

var metaSchema = new Schema({
    readingId: {
        type: String,
        require: true
    },
    done: {
        type: Boolean,
        default: false
    },
    flagged: {
        type: Boolean,
        default: false
    },
    notes: []

});

var UserFRMAppMetaSchema = new Schema({
    userId: {
        type: String, 
        required: true
    },
    metaData: [metaSchema]
});


UserFRMAppMetaSchema.statics.load = function(userId, cb) {
    this.findOne({
        userId: userId
    }).exec(cb);
};


mongoose.model('UserFRMAppMeta', UserFRMAppMetaSchema);
