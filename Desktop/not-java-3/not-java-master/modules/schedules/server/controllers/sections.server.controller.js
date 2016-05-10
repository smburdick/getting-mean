'use strict';
/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Section = mongoose.model('Section'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
/**
 * Show the current term
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var section = req.section ? req.section.toJSON() : {};
  // Add a custom field to the schedule, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the schedule model.
  // department.isCurrentUserOwner = !!(req.user && department.user && department.user._id.toString() === req.user._id.toString());
  res.json(section);
};
/**
 * List of departments
 */
exports.list = function(req, res) {
  Section.find().sort('-created').populate('user', 'displayName').exec(function(err, sections) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(sections);
    }
  });
};
/**
 * department middleware
 */
exports.departmentByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'section is invalid'
    });
  }
  Section.findById(id).populate('user', 'displayName').exec(function(err, section) {
    if (err) {
      return next(err);
    } else if (!section) {
      return res.status(404).send({
        message: 'No section with that identifier has been found'
      });
    }
    req.section = section;
    next();
  });
};
