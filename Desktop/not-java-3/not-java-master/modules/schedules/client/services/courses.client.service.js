(function() {
  'use strict';
  angular.module('schedules.services').factory('CoursesService', CoursesService);
  CoursesService.$inject = ['$resource'];

  function CoursesService($resource) {
    return $resource('api/terms/:termId/departments/:departmentId/courses/:courseId', {
      departmentId: 'department_id',
      termId: 'term_id',
      courseId: '@_id'
    });
  }
}());
