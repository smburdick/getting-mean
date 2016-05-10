(function(app) {
  'use strict';
  app.registerModule('schedules', ['core']); // The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('schedules.services');
  app.registerModule('schedules.routes', ['ui.router', 'core.routes', 'schedules.services']);
  // app.registerModule('terms');
  // app.registerModule('terms.services'),
  // ;
}(ApplicationConfiguration));
