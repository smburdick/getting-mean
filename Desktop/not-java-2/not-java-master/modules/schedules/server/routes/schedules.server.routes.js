'use strict';
/**
 * Module dependencies
 */
var schedulesPolicy = require('../policies/schedules.server.policy'),
  schedules = require('../controllers/schedules.server.controller'),
  instructorsPolicy = require('../policies/instructors.server.policy'),
  instructors = require('../controllers/instructors.server.controller'),
  termsPolicy = require('../policies/terms.server.policy'),
  terms = require('../controllers/terms.server.controller'),
  departmentsPolicy = require('../policies/terms.server.policy'),
  departments = require('../controllers/departments.server.controller'),
  coursesPolicy = require('../policies/courses.server.policy'),
  courses = require('../controllers/courses.server.controller'),
  sectionsPolicy = require('../policies/sections.server.policy'),
  sections = require('../controllers/sections.server.controller'),
  locationsPolicy = require('../policies/locations.server.policy'),
  locations = require('../controllers/locations.server.controller');
module.exports = function(app) {
  // schedules collection routes
  app.route('/api/schedules').all(schedulesPolicy.isAllowed).get(schedules.list).post(schedules.create);
  // instructors collection routes
  app.route('/api/instructors').all(instructorsPolicy.isAllowed).get(instructors.list);
  // single instructor routes
  app.route('/api/instructors/:instructorId').all(instructorsPolicy.isAllowed).get(instructors.read);
  app.route('/api/terms').all(termsPolicy.isAllowed).get(terms.list);
  // single term routes
  app.route('/api/terms/:termId').all(termsPolicy.isAllowed).get(terms.read);
  // Single schedule routes
  app.route('/api/schedules/:scheduleId').all(schedulesPolicy.isAllowed).get(schedules.read).put(schedules.update).delete(schedules.delete).put(schedules.addClass);
  // Finish by binding the schedule middleware
  app.param('scheduleId', schedules.scheduleByID);
  // bind term middleware
  app.param('termID', terms.termByID);
  // department collection route
  app.route('/api/terms/:termId/departments/').all(termsPolicy.isAllowed) // does this need to be redundant??
    .all(departmentsPolicy.isAllowed).get(departments.list);
  // with dept id
  app.route('/api/terms/:termId/departments/:departmentId').all(termsPolicy.isAllowed).all(departmentsPolicy.isAllowed).get(departments.read);
  // bind department middleware
  app.param('departmentID', departments.departmentByID);
  // courses route
  app.route('/api/terms/:termId/departments/:departmentId/courses').all(coursesPolicy.isAllowed).get(courses.list);
  app.route('/api/terms/:termId/departments/:departmentId/courses/:courseId').all(coursesPolicy.isAllowed).get(courses.read);
  // sections route
  app.route('/api/terms/:termId/departments/:departmentId/courses/:courseId/sections').all(sectionsPolicy.isAllowed).get(sections.list);
  app.route('/api/terms/:termId/departments/:departmentId/courses/:courseId/sections/:sectionId').all(sectionsPolicy.isAllowed).get(sections.read);
  // locations route
  app.route('/api/terms/:termId/departments/:departmentId/courses/:courseId/sections/:sectionId/locations').all(locationsPolicy.isAllowed).get(locations.list);
  app.route('/api/terms/:termId/departments/:departmentId/courses/:courseId/sections/:sectionId/locations/:locationId').all(locationsPolicy.isAllowed).get(locations.read);
};
