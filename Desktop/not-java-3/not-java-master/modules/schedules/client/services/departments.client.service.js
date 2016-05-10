(function() {
  'use strict';
  angular.module('schedules.services').factory('DepartmentsService', DepartmentsService);
  DepartmentsService.$inject = ['$resource', 'TermsService'];

  function DepartmentsService($resource, TermsService) {
    return $resource('api/terms/:termId/departments/:departmentId', {
      departmentId: '@_id',
      termId: 'term_id'
    });
  }
}());
