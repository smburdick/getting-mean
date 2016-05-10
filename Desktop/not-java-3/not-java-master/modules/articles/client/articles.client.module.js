(function(app) {
  'use strict';
  app.registerModule('articles', ['core']);
  app.registerModule('articles.services');
  app.registerModule('articles.routes', ['ui.router', 'core.routes', 'articles.services']);
  app.registerModule('map', ['uiGmapgoogle-maps']);
}(ApplicationConfiguration));
