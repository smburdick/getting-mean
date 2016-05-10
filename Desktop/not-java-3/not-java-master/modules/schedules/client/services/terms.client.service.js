(function() {
  'use strict';
  angular.module('schedules.services').factory('TermsService', TermsService);
  TermsService.$inject = ['$resource'];

  function TermsService($resource) {
    return $resource('api/terms/:termId', {
      termId: '@_id'
    });
  }
}());
