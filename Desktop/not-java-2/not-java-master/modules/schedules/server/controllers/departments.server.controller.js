'use strict';
/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Department = mongoose.model('Department'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
/**
 * Show the current term
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var department = req.department ? req.department.toJSON() : {};
  // Add a custom field to the schedule, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the schedule model.
  department.isCurrentUserOwner = !!(req.user && department.user && department.user._id.toString() === req.user._id.toString());
  res.json(department);
};
/**
 * List of departments
 */
exports.list = function(req, res) {
  Department.find().sort('-created').populate('user', 'displayName').exec(function(err, departments) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(departments);
    }
  });
};
/**
 * department middleware
 */
exports.departmentByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'department is invalid'
    });
  }
  Department.findById(id).populate('user', 'displayName').exec(function(err, department) {
    if (err) {
      return next(err);
    } else if (!department) {
      return res.status(404).send({
        message: 'No department with that identifier has been found'
      });
    }
    req.department = department;
    next();
  });
};
