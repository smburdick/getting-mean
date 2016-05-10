'use strict';
/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Instructor = mongoose.model('Instructor'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
// /**
//  * Create a schedule
//  */
// exports.create = function (req, res) {
//   var schedule = new Schedule(req.body);
//   schedule.user = req.user;
//   schedule.save(function (err) {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       res.json(schedule);
//     }
//   });
// };
/**
 * Show the current schedule
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var instructor = req.instructor ? req.instructor.toJSON() : {};
  // Add a custom field to the schedule, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the schedule model.
  instructor.isCurrentUserOwner = !!(req.user && instructor.user && instructor.user._id.toString() === req.user._id.toString());
  res.json(instructor);
};
/**
 * Update an schedule
 */
// exports.update = function (req, res) {
//   var schedule = req.schedule;
//   // schedule.title = req.body.title;
//   // schedule.content = req.body.content;
//   schedule.term = req.body.term;
//   schedule.save(function (err) {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       res.json(schedule);
//     }
//   });
// };
/**
 * Add a class to a schedule
 */
// exports.addClass = function (req, res) {
//   var schedule = req.schedule;
//   schedule.classes.push(req.body.class); // add in the error handler
// }
/**
 * Delete a schedule
 */
// exports.delete = function (req, res) {
//   var schedule = req.schedule;
//   schedule.remove(function (err) {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       res.json(schedule);
//     }
//   });
// };
/**
 * List of schedules
 */
exports.list = function(req, res) {
  Instructor.find().sort('-created').populate('user', 'displayName').exec(function(err, instructors) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(instructors);
    }
  });
};
/**
 * schedule middleware
 */
exports.instructorByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'instructor is invalid'
    });
  }
  Instructor.findById(id).populate('user', 'displayName').exec(function(err, instructor) {
    if (err) {
      return next(err);
    } else if (!instructor) {
      return res.status(404).send({
        message: 'No instructor with that identifier has been found'
      });
    }
    req.instructor = instructor;
    next();
  });
};
