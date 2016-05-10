(function() {
  'use strict';
  angular.module('schedules.services').factory('SchedulesService', SchedulesService);
  SchedulesService.$inject = ['$resource'];

  function SchedulesService($resource) {
    return $resource('api/schedules/:scheduleId', {
      scheduleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      },
      addClass: {
        method: 'PUT'
      }
    });
  }
}());
