(function(app) {
  'use strict';
  app.registerModule('schedules', ['core']);
  app.registerModule('schedules.services');
  app.registerModule('schedules.routes', ['ui.router', 'core.routes', 'schedules.services']);
}(ApplicationConfiguration));
