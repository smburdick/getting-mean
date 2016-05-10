'use strict';
/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Schedule = mongoose.model('Schedule'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
/**
 * Create a schedule
 */
exports.create = function(req, res) {
  var schedule = new Schedule(req.body);
  schedule.user = req.user;
  // schedule.term = req.term._id;
  schedule.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(schedule);
    }
  });
};
/**
 * Show the current schedule
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var schedule = req.schedule ? req.schedule.toJSON() : {};
  // Add a custom field to the schedule, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the schedule model.
  schedule.isCurrentUserOwner = !!(req.user && schedule.user && schedule.user._id.toString() === req.user._id.toString());
  res.json(schedule);
};
/**
 * Update a schedule
 */
exports.update = function(req, res) {
  var schedule = req.schedule;
  // schedule.title = req.body.title;
  // schedule.content = req.body.content;
  schedule.term = req.body.term;
  schedule.classes = req.body.classes;
  schedule.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(schedule);
    }
  });
};
/**
 * Add a class to a schedule
 */
exports.addClass = function(req, res) {
  var schedule = req.schedule;
  // schedule.classes.push(req.body.class); // add in the error handler
  schedule.classes = req.body.classes;
  schedule.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(schedule);
    }
  });
};
/**
 * Delete a schedule
 */
exports.delete = function(req, res) {
  var schedule = req.schedule;
  schedule.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(schedule);
    }
  });
};
/**
 * List of schedules
 */
exports.list = function(req, res) {
  Schedule.find().sort('-created').populate('user', 'displayName').exec(function(err, schedules) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(schedules);
    }
  });
};
/**
 * schedule middleware
 */
exports.scheduleByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'schedule is invalid'
    });
  }
  Schedule.findById(id).populate('user', 'displayName').exec(function(err, schedule) {
    if (err) {
      return next(err);
    } else if (!schedule) {
      return res.status(404).send({
        message: 'No schedule with that identifier has been found'
      });
    }
    req.schedule = schedule;
    next();
  });
};
