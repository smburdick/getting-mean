(function() {
  'use strict';
  angular.module('schedules').controller('SchedulesController', SchedulesController);
  SchedulesController.$inject = ['$scope', '$state', 'scheduleResolve', '$window', 'Authentication', 'TermsService', 'DepartmentsService', 'SectionsService'];

  function SchedulesController($scope, $state, schedule, $window, Authentication, TermsService, DepartmentsService, SectionsService) {
    var vm = this;
    vm.schedule = schedule;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.terms = TermsService.query();
    // vm.departments = DepartmentsService.query();
    // move to Add Class controller, this one is getting messy
    vm.dept = null;
    // TODO: move this to some other file, have both controllers use it
    vm.findTerm = function(inputTermId) {
      for (var i = 0; i < vm.terms.length; i++) {
        if (vm.terms[i]._id === inputTermId) {
          return vm.terms[i].termName;
        }
      }
    };
    vm.getSections = function() {
      // get all sections, schedule classes (iter) - if ids match, push to disp array
      // var allSections = SectionsService.query();
      // var toReturn = [];
      // for(var i = 0; i < allSections.length; i++) {
      //   for(var j = 0; j < vm.schedule.)
      // }
    };
    // Remove existing schedule
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.schedule.$remove($state.go('schedules.list'));
      }
    }
    // Save schedule
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity');
        return false;
      }
      // TODO: move create/update logic to service
      if (vm.schedule._id) {
        vm.schedule.$update(successCallback, errorCallback);
      } else {
        vm.schedule.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('schedules.view', {
          scheduleId: res._id,
          classes: res.classes
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
    // Add an individual class object to the schedule
    // function addClass(isValid, class) {
    //   if(!isValid) {
    //     $scope.$broadcast('show-errors-check-validity', 'vm.form.addClassForm');
    //     return false;
    //   }
    //
    //   if (vm.schedule._id) {
    //     vm.schedule.$update(successCallback, errorCallback);
    //   } else {
    //     vm.schedule.$save(successCallback, errorCallback);
    //   }
  }
}());
