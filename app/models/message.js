'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Message Schema
 */
var MessageSchema = new Schema({
    title: {
        type: String,
        default: '',
        trim: true
    },
    body: {
        type: String,
        default: '',
        trim: true
    },
    sound: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date, 
        default: Date.now
    },
    sites: [String]
});

mongoose.model('Message', MessageSchema);
