'use strict';
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
/**
 * Term Schema
 */
var TermSchema = new Schema({
  usersName: {
    type: String,
    required: true
  },
  termName: {
    type: String,
    required: true
  },
  departments: [{
    type: Schema.ObjectId,
    ref: 'Department'
  }]
});
/**
 * Department Schema
 */
var DepartmentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  courses: [{
    type: Schema.ObjectId,
    ref: 'Course'
  }],
  term: {
    type: Schema.ObjectId,
    ref: 'Term'
  }
});
/**
 * Course Schema
 */
var CourseSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  courseNumber: {
    type: Number,
    required: true
  },
  sections: [{
    type: Schema.ObjectId,
    ref: 'Section'
  }]
});
/**
 * Time Schema
 */
var TimeSchema = new Schema({
  days: {
    type: String,
    required: true
  },
  times: {
    type: String,
    required: true
  }
});
/**
 * Section Schema
 */
var SectionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  instructor: {
    type: Schema.ObjectId,
    ref: 'Instructor'
  },
  location: {
    type: Schema.ObjectId,
    ref: 'Location'
  },
  times: [TimeSchema]
});
/**
 * Instructor Schema
 */
var InstructorSchema = new Schema({
  name: {
    type: String,
    required: true
  }
});
/**
 * Location Schema
 */
var LocationSchema = new Schema({
  name: {
    type: String
  },
  buildingName: {
    type: String
  },
  floor: {
    type: Number
  },
  coords: [Number, Number] // LATITUDE / LONGITUDE
});
/**
 * Schedule Schema (need to update this)
 */
var ScheduleSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  term: {
    type: Schema.ObjectId,
    ref: 'Term'
  },
  classes: [
    //  {
    //   departmentName: {
    //     type: String,
    //     required: true;
    //   },
    //   time:
    { // edit this to add the course name probably
      type: Schema.ObjectId,
      ref: 'Section'
    }
    // }
  ]
});
mongoose.model('Term', TermSchema);
mongoose.model('Department', DepartmentSchema);
mongoose.model('Course', CourseSchema);
mongoose.model('Section', SectionSchema);
mongoose.model('Instructor', InstructorSchema);
mongoose.model('Location', LocationSchema);
mongoose.model('Schedule', ScheduleSchema);
