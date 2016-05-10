(function() {
  'use strict';
  angular.module('schedules').run(menuConfig);
  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Schedules',
      state: 'schedules',
      type: 'dropdown',
      roles: ['*']
    });
    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'schedules', {
      title: 'List Schedules',
      state: 'schedules.list'
    });
    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'schedules', {
      title: 'Create Schedule',
      state: 'schedules.create',
      roles: ['user']
    });
  }
}());
