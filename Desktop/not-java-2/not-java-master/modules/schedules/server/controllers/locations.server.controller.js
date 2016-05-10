'use strict';
/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Location = mongoose.model('Location'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
/**
 * Show the current location
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var location = req.location ? req.location.toJSON() : {};
  // Add a custom field to the schedule, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the schedule model.
  // course.isCurrentUserOwner = !!(req.user && course.user && department.user._id.toString() === req.user._id.toString());
  res.json(location);
};
// /**
//  * List of courses
//  */
exports.list = function(req, res) {
  Location.find().sort('-created').populate('user', 'displayName').exec(function(err, locations) { // might need to remove 'populate'
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(locations);
    }
  });
};
/**
 * course middleware
 */
exports.locationByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'location is invalid'
    });
  }
  Location.findById(id).populate('user', 'displayName').exec(function(err, location) {
    if (err) {
      return next(err);
    } else if (!location) {
      return res.status(404).send({
        message: 'No location with that identifier has been found'
      });
    }
    req.location = location;
    next();
  });
};
