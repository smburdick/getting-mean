'use strict';
/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Course = mongoose.model('Course'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
/**
 * Show the current course
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var course = req.course ? req.course.toJSON() : {};
  // Add a custom field to the schedule, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the schedule model.
  // course.isCurrentUserOwner = !!(req.user && course.user && department.user._id.toString() === req.user._id.toString());
  res.json(course);
};
/**
 * List of courses
 */
exports.list = function(req, res) {
  Course.find().sort('-created').populate('user', 'displayName').exec(function(err, courses) { // might need to remove 'populate'
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(courses);
    }
  });
};
/**
 * course middleware
 */
exports.courseByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'course is invalid'
    });
  }
  Course.findById(id).populate('user', 'displayName').exec(function(err, course) {
    if (err) {
      return next(err);
    } else if (!course) {
      return res.status(404).send({
        message: 'No course with that identifier has been found'
      });
    }
    req.course = course;
    next();
  });
};
