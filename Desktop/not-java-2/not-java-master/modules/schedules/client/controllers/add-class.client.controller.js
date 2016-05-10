(function() {
  'use strict';
  angular.module('schedules').controller('AddClassController', AddClassController);
  AddClassController.$inject = ['$scope', '$state', 'scheduleResolve', 'SchedulesService', 'TermsService', 'DepartmentsService', 'CoursesService', 'SectionsService'];

  function AddClassController($scope, $state, schedule, SchedulesService, TermsService, DepartmentsService, CoursesService, SectionsService) {
    var vm = this;
    vm.schedule = schedule;
    vm.terms = TermsService.query();
    vm.departments = DepartmentsService.query();
    vm.selectedDepartmentID = '';
    vm.courses = [];
    vm.coursesFromDepartment = [];
    vm.coursesToDisplay = [];
    vm.sections = [];
    vm.sectionsFromCourse = [];
    vm.sectionsToDisplay = [];
    vm.selectedSection = null;
    vm.disp = null;
    vm.findTerm = function(inputTermId) { // TODO: move this to some other file, have both controllers use it
      vm.disp = vm.terms[0];
      for (var i = 0; i < vm.terms.length; i++) {
        if (vm.terms[i]._id === inputTermId) {
          return vm.terms[i].termName;
        }
      }
      //    vm.courses.push(CoursesService.query());    }
    };
    vm.resetDepartment = function() {
      // go through vm.courses, pull out the ones we need
      vm.courses = CoursesService.query();
      vm.courses.$promise.then(function(result) {
        vm.courses = result;
        var deptCourses = JSON.parse(vm.coursesFromDepartment);
        vm.sectionsFromCourse = [];
        vm.coursesToDisplay = [];
        vm.sectionsToDisplay = [];
        for (var i = 0; i < vm.courses.length; i++) {
          for (var j = 0; j < deptCourses.length; j++) {
            if (vm.courses[i]._id === deptCourses[j]) {
              vm.coursesToDisplay.push(vm.courses[i]);
            }
          }
        }
      });
    };
    vm.resetCourse = function() {
      vm.sections = SectionsService.query();
      vm.sections.$promise.then(function(res) {
        vm.sections = res;
        var sectionCourses = JSON.parse(vm.sectionsFromCourse);
        vm.sectionsToDisplay = [];
        vm.selectedSection = null;
        for (var i = 0; i < vm.sections.length; i++) {
          for (var j = 0; j < sectionCourses.length; j++) {
            if (vm.sections[i]._id === sectionCourses[j]) {
              vm.sectionsToDisplay.push(vm.sections[j]);
            }
          }
        }
      });
    };
    vm.addClass = function(isValid) {
      // make sure that section isn't saved already
      if (vm.selectedSection != null) {
        for (var i = 0; i < vm.schedule.classes.length; i++) {
          if (vm.schedule.classes[i] === JSON.parse(vm.selectedSection)._id) {
            return;
          }
        }
        vm.schedule.classes.push(JSON.parse(vm.selectedSection));
        //    if (!isValid) {
        //     alert('Not valid');
        //   $scope.$broadcast('show-errors-check-validity');
        //   return false;
        // }
        //  alert();
        vm.schedule.$update(successCallback, errorCallback);
        // if (vm.schedule._id) {
        //   vm.schedule.$addClass(successCallback, errorCallback);
        // }
      }
    };

    function successCallback(res) {
      $state.go('schedules.view', {
        scheduleId: res._id
      });
    }

    function errorCallback(res) {
      vm.error = res.data.message;
    }
    //   vm.filterCourses = function() {
    // //    var coursesFromDepartment = JSON.parse(vm.coursesFromDepartment);
    //     var courses = vm.courses;
    //     for(var i = 0 ; i < vm.courses.length; i++) {
    //       for(var j = 0; j < vm.coursesFromDepartment.length; j++) {
    //         if(vm.courses[i]._id === vm.coursesFromDepartment[j]) {
    //           vm.coursesToDisplay.push(vm.courses[i]);
    //         }
    //       }
    //     }
    //   };
  }
}());
