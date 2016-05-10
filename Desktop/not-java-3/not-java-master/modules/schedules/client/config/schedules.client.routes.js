(function() {
  'use strict';
  angular.module('schedules.routes').config(routeConfig);
  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider.state('schedules', {
      abstract: true,
      url: '/schedules',
      template: '<ui-view/>'
    }).state('schedules.list', {
      url: '',
      templateUrl: 'modules/schedules/client/views/list-schedules.client.view.html',
      controller: 'SchedulesListController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Schedules List'
      }
    }).state('schedules.addClass', {
      url: '/:scheduleId/addclass',
      templateUrl: 'modules/schedules/client/views/add-class.client.view.html',
      controller: 'AddClassController',
      controllerAs: 'vm',
      resolve: {
        scheduleResolve: getSchedule
      },
      data: {
        roles: ['user', 'admin'],
        pageTitle: 'Add new class'
      }
    }).state('schedules.create', {
      url: '/create',
      templateUrl: 'modules/schedules/client/views/form-schedule.client.view.html',
      controller: 'SchedulesController',
      // becoming the way to access rather than $scope - replace!
      controllerAs: 'vm',
      resolve: {
        scheduleResolve: newSchedule
      },
      data: {
        roles: ['user', 'admin'],
        pageTitle: 'Schedules Create'
      }
    }).state('schedules.edit', {
      url: '/:scheduleId/edit',
      templateUrl: 'modules/schedules/client/views/form-schedule.client.view.html',
      controller: 'SchedulesController',
      controllerAs: 'vm',
      resolve: {
        scheduleResolve: getSchedule
      },
      data: {
        roles: ['user', 'admin'],
        pageTitle: 'Edit Schedule {{ scheduleResolve.title }}'
      }
    }).state('schedules.view', {
      url: '/:scheduleId',
      templateUrl: 'modules/schedules/client/views/view-schedule.client.view.html',
      controller: 'SchedulesController',
      controllerAs: 'vm',
      resolve: {
        scheduleResolve: getSchedule
      },
      data: {
        pageTitle: 'Schedule {{ scheduleResolve.title }}'
      }
    });
  }
  getSchedule.$inject = ['$stateParams', 'SchedulesService'];

  function getSchedule($stateParams, SchedulesService) {
    return SchedulesService.get({
      scheduleId: $stateParams.scheduleId
    }).$promise;
  }
  newSchedule.$inject = ['SchedulesService'];

  function newSchedule(SchedulesService) {
    return new SchedulesService();
  }
}());
