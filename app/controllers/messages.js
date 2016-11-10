'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
    _ = require('lodash');

var util = require('util');

exports.getAllMessages = function(req, res) {
    Message.find().sort('-created').exec(function(err, messages) {
        if (err) {
           res.send(500, {error: err});
        } else {
            console.log('Found Messages:' + util.inspect(messages, {showHidden: false, depth: null}));
            res.json(messages);         
        }
    });
};

exports.getMessageByExamId = function(req, res) {
    Message.find({sites: req.params.id}).sort('-created').exec(function(err, messages) {
        if (err) {
           res.send(500, {error: err});
        } else {
            console.log('Found Messages:' + util.inspect(messages, {showHidden: false, depth: null}));
            res.json(messages);         
        }
    });
};

/**
 * Find message by id
 */
exports.message = function(req, res, next, id) {
    Message.load(id, function(err, message) {
        if (err) return next(err);
        if (!message) return next(new Error('Failed to load message ' + id));
        req.message = message;
        next();
    });
};

/**
 * Create an message
 */
exports.create = function(req, res) {
    var message = new Message(req.body);
    message.user = req.user;

    message.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                message: message
            });
        } else {
            res.jsonp(message);
        }
    });
};

/**
 * Update an message
 */
exports.update = function(req, res) {
    var message = req.message;

    message = _.extend(message, req.body);

    message.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                message: message
            });
        } else {
            res.jsonp(message);
        }
    });
};

/**
 * Delete an message
 */
exports.destroy = function(req, res) {
    var message = req.message;

    message.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                message: message
            });
        } else {
            res.jsonp(message);
        }
    });
};

/**
 * Show an message
 */
exports.show = function(req, res) {
    res.jsonp(req.message);
};

/**
 * List of Messages
 */
exports.all = function(req, res) {
    Message.find().sort('-created').populate('user', 'name username').exec(function(err, messages) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(messages);
        }
    });
};
