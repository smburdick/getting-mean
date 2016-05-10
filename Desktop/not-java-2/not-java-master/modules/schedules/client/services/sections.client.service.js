(function() {
  'use strict';
  angular.module('schedules.services').factory('SectionsService', SectionsService);
  SectionsService.$inject = ['$resource'];

  function SectionsService($resource) {
    return $resource('/api/terms/:termId/departments/:departmentId/courses/:courseId/sections/:sectionId', {
      termId: 'term_id',
      departmentId: 'department_id',
      courseId: 'course_id',
      sectionId: '@_id'
    });
  }
}());
