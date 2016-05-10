(function() {
  'use strict';
  angular.module('map').controller('mapController', mapController).config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
      key: 'AIzaSyCVWrnLFtqpyynJwujU041GgQyDlH3PEsE',
      v: '3.20',
      libraries: 'weather,geometry,visualization,places'
    });
  });
  mapController.$inject = ['$scope', 'SchedulesService', 'TermsService', 'SectionsService', 'LocationsService'];

  function mapController($scope, SchedulesService, TermsService, SectionsService, LocationsService) {
    var vm = this;
    vm.schedules = SchedulesService.query();
    vm.selectedSchedule = null;
    vm.selectedClass = null;
    vm.disp = null;
    vm.terms = TermsService.query();
    vm.classesToDisplay = [];
    vm.locations = [];
    $scope.map = {
      center: {
        latitude: 47.263667,
        longitude: -122.483194
      },
      zoom: 18
    };
    vm.findTerm = function(inputTermId) {
      for (var i = 0; i < vm.terms.length; i++) {
        if (vm.terms[i]._id === inputTermId) {
          return vm.terms[i].termName;
        }
      }
    };
    vm.showClasses = function() {
      vm.sections = SectionsService.query();
      vm.sections.$promise.then(function(result) {
        vm.sections = result;
        var classes = JSON.parse(vm.selectedSchedule).classes;
        for (var i = 0; i < vm.sections.length; i++) {
          for (var j = 0; j < classes.length; j++) {
            if (vm.sections[i]._id === classes[i]) {
              vm.classesToDisplay.push(vm.sections[i]);
            }
          }
        }
      });
    };
    vm.showLocationOnMap = function() {
      vm.locations = LocationsService.query();
      // get the location of selected class
      vm.locations.$promise.then(function(result) {
        vm.locations = result;
        var locationToShow = JSON.parse(vm.selectedClass).location;
        // alert(locationToShow);
        for (var i = 0; i < vm.locations.length; i++) {
          if (vm.locations[i]._id === locationToShow) {
            // alert(vm.locations[i].coords);
            $scope.map = {
              center: {
                latitude: vm.locations[i].coords[0],
                longitude: vm.locations[i].coords[1]
              },
              zoom: 22
            };
          }
        }
      });
      // $scope.map = {
      //   center: {
      //     latitude: 0,
      //     longitude: 0
      //   },
      //   zoom: 18
      // };
    };
  }
}());
