'use strict';
/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Term = mongoose.model('Term'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
/**
 * Show the current term
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var term = req.term ? req.term.toJSON() : {};
  // Add a custom field to the schedule, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the schedule model.
  term.isCurrentUserOwner = !!(req.user && term.user && term.user._id.toString() === req.user._id.toString());
  res.json(term);
};
// /**
//  * List of terms
//  */
exports.list = function(req, res) {
  Term.find().sort('-created').populate('user', 'displayName').exec(function(err, terms) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(terms);
    }
  });
};
/**
 * term middleware
 */
exports.termByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'term is invalid'
    });
  }
  Term.findById(id).populate('user', 'displayName').exec(function(err, term) {
    if (err) {
      return next(err);
    } else if (!term) {
      return res.status(404).send({
        message: 'No term with that identifier has been found'
      });
    }
    req.term = term;
    next();
  });
};
