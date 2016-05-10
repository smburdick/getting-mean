(function() {
  'use strict';
  angular.module('schedules').controller('SchedulesListController', SchedulesListController);
  SchedulesListController.$inject = ['SchedulesService', 'TermsService'];

  function SchedulesListController(SchedulesService, TermsService) {
    var vm = this;
    //    vm.terms = TermsService.query();
    // vm.schedules = SchedulesService.schedules.query();
    vm.schedules = SchedulesService.query();
    vm.terms = TermsService.query();
    vm.findTerm = function(inputTermId) {
      for (var i = 0; i < vm.terms.length; i++) {
        if (vm.terms[i]._id === inputTermId) {
          return vm.terms[i].termName;
        }
      }
    };
  }
}());
