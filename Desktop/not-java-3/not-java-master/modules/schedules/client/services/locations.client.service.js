(function() {
  'use strict';
  angular.module('schedules.services').factory('LocationsService', LocationsService);
  LocationsService.$inject = ['$resource'];

  function LocationsService($resource) {
    return $resource('/api/terms/:termId/departments/:departmentId/courses/:courseId/sections/:sectionId/locations/:locationId', {
      termId: 'term_id',
      departmentId: 'department_id',
      courseId: 'course_id',
      sectionId: 'section_id',
      locationId: '@_id'
    });
  }
}());
