(function(window) {
  'use strict';
  var applicationModuleName = 'mean';
  var service = {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'angularFileUpload'],
    registerModule: registerModule
  };
  window.ApplicationConfiguration = service;
  // Add a new vertical module
  function registerModule(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);
    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  }
}(window));

(function(app) {
  'use strict';
  // Start by defining the main module and adding the module dependencies
  angular.module(app.applicationModuleName, app.applicationModuleVendorDependencies);
  // Setting HTML5 Location Mode
  angular.module(app.applicationModuleName).config(bootstrapConfig);

  function bootstrapConfig($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
    $httpProvider.interceptors.push('authInterceptor');
  }
  bootstrapConfig.$inject = ['$locationProvider', '$httpProvider'];
  // Then define the init function for starting up the application
  angular.element(document).ready(init);

  function init() {
    // Fixing facebook bug with redirect
    if (window.location.hash && window.location.hash === '#_=_') {
      if (window.history && history.pushState) {
        window.history.pushState('', document.title, window.location.pathname);
      } else {
        // Prevent scrolling by storing the page's current scroll offset
        var scroll = {
          top: document.body.scrollTop,
          left: document.body.scrollLeft
        };
        window.location.hash = '';
        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scroll.top;
        document.body.scrollLeft = scroll.left;
      }
    }
    // Then init the app
    angular.bootstrap(document, [app.applicationModuleName]);
  }
}(ApplicationConfiguration));

(function(app) {
  'use strict';
  app.registerModule('articles', ['core']);
  app.registerModule('articles.services');
  app.registerModule('articles.routes', ['ui.router', 'core.routes', 'articles.services']);
  app.registerModule('map', ['uiGmapgoogle-maps']);
}(ApplicationConfiguration));

(function(app) {
  'use strict';
  app.registerModule('chat', ['core']);
  app.registerModule('chat.routes', ['ui.router', 'core.routes']);
}(ApplicationConfiguration));

(function(app) {
  'use strict';
  app.registerModule('core');
  app.registerModule('core.routes', ['ui.router']);
  app.registerModule('core.admin', ['core']);
  app.registerModule('core.admin.routes', ['ui.router']);
}(ApplicationConfiguration));

(function(app) {
  'use strict';
  app.registerModule('schedules', ['core']); // The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('schedules.services');
  app.registerModule('schedules.routes', ['ui.router', 'core.routes', 'schedules.services']);
  // app.registerModule('terms');
  // app.registerModule('terms.services'),
  // ;
}(ApplicationConfiguration));

(function(app) {
  'use strict';
  app.registerModule('users');
  app.registerModule('users.admin');
  app.registerModule('users.admin.routes', ['ui.router', 'core.routes', 'users.admin.services']);
  app.registerModule('users.admin.services');
  app.registerModule('users.routes', ['ui.router', 'core.routes']);
  app.registerModule('users.services');
}(ApplicationConfiguration));

(function() {
  'use strict';
  angular.module('articles').run(menuConfig);
  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Articles',
      state: 'articles',
      type: 'dropdown',
      roles: ['*']
    });
    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'articles', {
      title: 'List Articles',
      state: 'articles.list'
    });
    // Add the dropdown create item
    menuService.addSubMenuItem('topbar', 'articles', {
      title: 'Create Article',
      state: 'articles.create',
      roles: ['user']
    });
    // Map Tab
    menuService.addSubMenuItem('topbar', 'articles', {
      title: 'Map',
      state: 'map'
    });
  }
}());

(function() {
  'use strict';
  angular.module('articles.routes').config(routeConfig);
  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider.state('articles', {
      abstract: true,
      url: '/articles',
      template: '<ui-view/>'
    }).state('articles.list', {
      url: '',
      templateUrl: 'modules/articles/client/views/list-articles.client.view.html',
      controller: 'ArticlesListController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Articles List'
      }
    }).state('articles.create', {
      url: '/create',
      templateUrl: 'modules/articles/client/views/form-article.client.view.html',
      controller: 'ArticlesController',
      controllerAs: 'vm',
      resolve: {
        articleResolve: newArticle
      },
      data: {
        roles: ['user', 'admin'],
        pageTitle: 'Articles Create'
      }
    }).state('articles.edit', {
      url: '/:articleId/edit',
      templateUrl: 'modules/articles/client/views/form-article.client.view.html',
      controller: 'ArticlesController',
      controllerAs: 'vm',
      resolve: {
        articleResolve: getArticle
      },
      data: {
        roles: ['user', 'admin'],
        pageTitle: 'Edit Article {{ articleResolve.title }}'
      }
    }).state('articles.view', {
      url: '/:articleId',
      templateUrl: 'modules/articles/client/views/view-article.client.view.html',
      controller: 'ArticlesController',
      controllerAs: 'vm',
      resolve: {
        articleResolve: getArticle
      },
      data: {
        pageTitle: 'Article {{ articleResolve.title }}'
      }
    }).state('map', {
      url: '/map',
      templateUrl: 'modules/articles/client/views/map.client.view.html',
      controller: 'mapController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Map'
      }
    });
  }
  getArticle.$inject = ['$stateParams', 'ArticlesService'];

  function getArticle($stateParams, ArticlesService) {
    return ArticlesService.get({
      articleId: $stateParams.articleId
    }).$promise;
  }
  newArticle.$inject = ['ArticlesService'];

  function newArticle(ArticlesService) {
    return new ArticlesService();
  }
}());

(function() {
  'use strict';
  angular.module('articles').controller('ArticlesController', ArticlesController);
  ArticlesController.$inject = ['$scope', '$state', 'articleResolve', '$window', 'Authentication'];

  function ArticlesController($scope, $state, article, $window, Authentication) {
    var vm = this;
    vm.article = article;
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    // Remove existing Article
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.article.$remove($state.go('articles.list'));
      }
    }
    // Save Article
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.articleForm');
        return false;
      }
      // TODO: move create/update logic to service
      if (vm.article._id) {
        vm.article.$update(successCallback, errorCallback);
      } else {
        vm.article.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('articles.view', {
          articleId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());

(function() {
  'use strict';
  angular.module('articles').controller('ArticlesListController', ArticlesListController);
  ArticlesListController.$inject = ['ArticlesService'];

  function ArticlesListController(ArticlesService) {
    var vm = this;
    vm.articles = ArticlesService.query();
  }
}());

(function() {
  'use strict';
  angular.module('map').controller('mapController', mapController).config(["uiGmapGoogleMapApiProvider", function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
      key: 'AIzaSyCVWrnLFtqpyynJwujU041GgQyDlH3PEsE',
      v: '3.20',
      libraries: 'weather,geometry,visualization,places'
    });
  }]);
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

(function() {
  'use strict';
  angular.module('articles.services').factory('ArticlesService', ArticlesService);
  ArticlesService.$inject = ['$resource'];

  function ArticlesService($resource) {
    return $resource('api/articles/:articleId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());

(function() {
  'use strict';
  angular.module('chat').run(menuConfig);
  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    // Set top bar menu items
    menuService.addMenuItem('topbar', {
      title: 'Chat',
      state: 'chat'
    });
  }
}());

(function() {
  'use strict';
  angular.module('chat.routes').config(routeConfig);
  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider.state('chat', {
      url: '/chat',
      templateUrl: 'modules/chat/client/views/chat.client.view.html',
      controller: 'ChatController',
      controllerAs: 'vm',
      data: {
        roles: ['user', 'admin'],
        pageTitle: 'Chat'
      }
    });
  }
}());

(function() {
  'use strict';
  angular.module('chat').controller('ChatController', ChatController);
  ChatController.$inject = ['$scope', '$state', 'Authentication', 'Socket'];

  function ChatController($scope, $state, Authentication, Socket) {
    var vm = this;
    vm.messages = [];
    vm.messageText = '';
    vm.sendMessage = sendMessage;
    init();

    function init() {
      // If user is not signed in then redirect back home
      if (!Authentication.user) {
        $state.go('home');
      }
      // Make sure the Socket is connected
      if (!Socket.socket) {
        Socket.connect();
      }
      // Add an event listener to the 'chatMessage' event
      Socket.on('chatMessage', function(message) {
        vm.messages.unshift(message);
      });
      // Remove the event listener when the controller instance is destroyed
      $scope.$on('$destroy', function() {
        Socket.removeListener('chatMessage');
      });
    }
    // Create a controller method for sending messages
    function sendMessage() {
      // Create a new message object
      var message = {
        text: vm.messageText
      };
      // Emit a 'chatMessage' message event
      Socket.emit('chatMessage', message);
      // Clear the message text
      vm.messageText = '';
    }
  }
}());

(function() {
  'use strict';
  angular.module('core.admin').run(menuConfig);
  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
}());

(function() {
  'use strict';
  angular.module('core.admin.routes').config(routeConfig);
  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider.state('admin', {
      abstract: true,
      url: '/admin',
      template: '<ui-view/>',
      data: {
        roles: ['admin']
      }
    });
  }
}());

(function() {
  'use strict';
  angular.module('core').run(menuConfig);
  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenu('account', {
      roles: ['user']
    });
    menuService.addMenuItem('account', {
      title: '',
      state: 'settings',
      type: 'dropdown',
      roles: ['user']
    });
    menuService.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile',
      state: 'settings.profile'
    });
    menuService.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile Picture',
      state: 'settings.picture'
    });
    menuService.addSubMenuItem('account', 'settings', {
      title: 'Change Password',
      state: 'settings.password'
    });
    menuService.addSubMenuItem('account', 'settings', {
      title: 'Manage Social Accounts',
      state: 'settings.accounts'
    });
  }
}());

(function() {
  'use strict';
  angular.module('core').run(routeFilter);
  routeFilter.$inject = ['$rootScope', '$state', 'Authentication'];

  function routeFilter($rootScope, $state, Authentication) {
    $rootScope.$on('$stateChangeStart', stateChangeStart);
    $rootScope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeStart(event, toState, toParams, fromState, fromParams) {
      // Check authentication before changing state
      if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
        var allowed = false;
        for (var i = 0, roles = toState.data.roles; i < roles.length; i++) {
          if ((roles[i] === 'guest') || (Authentication.user && Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(roles[i]) !== -1)) {
            allowed = true;
            break;
          }
        }
        if (!allowed) {
          event.preventDefault();
          if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
            $state.transitionTo('forbidden');
          } else {
            $state.go('authentication.signin').then(function() {
              // Record previous state
              storePreviousState(toState, toParams);
            });
          }
        }
      }
    }

    function stateChangeSuccess(event, toState, toParams, fromState, fromParams) {
      // Record previous state
      storePreviousState(fromState, fromParams);
    }
    // Store previous state
    function storePreviousState(state, params) {
      // only store this state if it shouldn't be ignored
      if (!state.data || !state.data.ignoreState) {
        $state.previous = {
          state: state,
          params: params,
          href: $state.href(state, params)
        };
      }
    }
  }
}());

(function() {
  'use strict';
  angular.module('core.routes').config(routeConfig);
  routeConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function routeConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.rule(function($injector, $location) {
      var path = $location.path();
      var hasTrailingSlash = path.length > 1 && path[path.length - 1] === '/';
      if (hasTrailingSlash) {
        // if last character is a slash, return the same url without the slash
        var newPath = path.substr(0, path.length - 1);
        $location.replace().path(newPath);
      }
    });
    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html',
      controller: 'HomeController',
      controllerAs: 'vm'
    }).state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true,
        pageTitle: 'Not-Found'
      }
    }).state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true,
        pageTitle: 'Bad-Request'
      }
    }).state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true,
        pageTitle: 'Forbidden'
      }
    });
  }
}());

(function() {
  'use strict';
  angular.module('core').controller('HeaderController', HeaderController);
  HeaderController.$inject = ['$scope', '$state', 'Authentication', 'menuService'];

  function HeaderController($scope, $state, Authentication, menuService) {
    var vm = this;
    vm.accountMenu = menuService.getMenu('account').items[0];
    vm.authentication = Authentication;
    vm.isCollapsed = false;
    vm.menu = menuService.getMenu('topbar');
    $scope.$on('$stateChangeSuccess', stateChangeSuccess);

    function stateChangeSuccess() {
      // Collapsing the menu after navigation
      vm.isCollapsed = false;
    }
  }
}());

(function() {
  'use strict';
  angular.module('core').controller('HomeController', HomeController);

  function HomeController() {
    var vm = this;
  }
}());

(function() {
  'use strict';
  angular.module('core').directive('pageTitle', pageTitle);
  pageTitle.$inject = ['$rootScope', '$timeout', '$interpolate', '$state'];

  function pageTitle($rootScope, $timeout, $interpolate, $state) {
    var directive = {
      retrict: 'A',
      link: link
    };
    return directive;

    function link(scope, element) {
      $rootScope.$on('$stateChangeSuccess', listener);

      function listener(event, toState) {
        var title = (getTitle($state.$current));
        $timeout(function() {
          element.text(title);
        }, 0, false);
      }

      function getTitle(currentState) {
        var applicationCoreTitle = 'MEAN.js';
        var workingState = currentState;
        if (currentState.data) {
          workingState = (typeof workingState.locals !== 'undefined') ? workingState.locals.globals : workingState;
          var stateTitle = $interpolate(currentState.data.pageTitle)(workingState);
          return applicationCoreTitle + ' - ' + stateTitle;
        } else {
          return applicationCoreTitle;
        }
      }
    }
  }
}());

(function() {
  'use strict';
  // https://gist.github.com/rhutchison/c8c14946e88a1c8f9216
  angular.module('core').directive('showErrors', showErrors);
  showErrors.$inject = ['$timeout', '$interpolate'];

  function showErrors($timeout, $interpolate) {
    var directive = {
      restrict: 'A',
      require: '^form',
      compile: compile
    };
    return directive;

    function compile(elem, attrs) {
      if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
        if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
          throw new Error('show-errors element does not have the \'form-group\' or \'input-group\' class');
        }
      }
      return linkFn;

      function linkFn(scope, el, attrs, formCtrl) {
        var inputEl,
          inputName,
          inputNgEl,
          options,
          showSuccess,
          initCheck = false,
          showValidationMessages = false;
        options = scope.$eval(attrs.showErrors) || {};
        showSuccess = options.showSuccess || false;
        inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
        inputNgEl = angular.element(inputEl);
        inputName = $interpolate(inputNgEl.attr('name') || '')(scope);
        if (!inputName) {
          throw new Error('show-errors element has no child input elements with a \'name\' attribute class');
        }
        scope.$watch(function() {
          return formCtrl[inputName] && formCtrl[inputName].$invalid;
        }, toggleClasses);
        scope.$on('show-errors-check-validity', checkValidity);
        scope.$on('show-errors-reset', reset);

        function checkValidity(event, name) {
          if (angular.isUndefined(name) || formCtrl.$name === name) {
            initCheck = true;
            showValidationMessages = true;
            return toggleClasses(formCtrl[inputName].$invalid);
          }
        }

        function reset(event, name) {
          if (angular.isUndefined(name) || formCtrl.$name === name) {
            return $timeout(function() {
              el.removeClass('has-error');
              el.removeClass('has-success');
              showValidationMessages = false;
            }, 0, false);
          }
        }

        function toggleClasses(invalid) {
          el.toggleClass('has-error', showValidationMessages && invalid);
          if (showSuccess) {
            return el.toggleClass('has-success', showValidationMessages && !invalid);
          }
        }
      }
    }
  }
}());

(function() {
  'use strict';
  angular.module('core').factory('authInterceptor', authInterceptor);
  authInterceptor.$inject = ['$q', '$injector', 'Authentication'];

  function authInterceptor($q, $injector, Authentication) {
    var service = {
      responseError: responseError
    };
    return service;

    function responseError(rejection) {
      if (!rejection.config.ignoreAuthModule) {
        switch (rejection.status) {
          case 401:
            // Deauthenticate the global user
            Authentication.user = null;
            $injector.get('$state').transitionTo('authentication.signin');
            break;
          case 403:
            $injector.get('$state').transitionTo('forbidden');
            break;
        }
      }
      // otherwise, default behaviour
      return $q.reject(rejection);
    }
  }
}());

(function() {
  'use strict';
  angular.module('core').factory('menuService', menuService);

  function menuService() {
    var shouldRender;
    var service = {
      addMenu: addMenu,
      addMenuItem: addMenuItem,
      addSubMenuItem: addSubMenuItem,
      defaultRoles: ['user', 'admin'],
      getMenu: getMenu,
      menus: {},
      removeMenu: removeMenu,
      removeMenuItem: removeMenuItem,
      removeSubMenuItem: removeSubMenuItem,
      validateMenuExistance: validateMenuExistance
    };
    init();
    return service;
    // Add new menu object by menu id
    function addMenu(menuId, options) {
      options = options || {};
      // Create the new menu
      service.menus[menuId] = {
        roles: options.roles || service.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return service.menus[menuId];
    }
    // Add menu item object
    function addMenuItem(menuId, options) {
      options = options || {};
      // Validate that the menu exists
      service.validateMenuExistance(menuId);
      // Push new menu item
      service.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? service.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });
      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          if (options.items.hasOwnProperty(i)) {
            service.addSubMenuItem(menuId, options.state, options.items[i]);
          }
        }
      }
      // Return the menu object
      return service.menus[menuId];
    }
    // Add submenu item object
    function addSubMenuItem(menuId, parentItemState, options) {
      options = options || {};
      // Validate that the menu exists
      service.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in service.menus[menuId].items) {
        if (service.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          service.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? service.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return service.menus[menuId];
    }
    // Get the menu object by menu id
    function getMenu(menuId) {
      // Validate that the menu exists
      service.validateMenuExistance(menuId);
      // Return the menu object
      return service.menus[menuId];
    }

    function init() {
      // A private function for rendering decision
      shouldRender = function(user) {
        if (this.roles.indexOf('*') !== -1) {
          return true;
        } else {
          if (!user) {
            return false;
          }
          for (var userRoleIndex in user.roles) {
            if (user.roles.hasOwnProperty(userRoleIndex)) {
              for (var roleIndex in this.roles) {
                if (this.roles.hasOwnProperty(roleIndex) && this.roles[roleIndex] === user.roles[userRoleIndex]) {
                  return true;
                }
              }
            }
          }
        }
        return false;
      };
      // Adding the topbar menu
      addMenu('topbar', {
        roles: ['*']
      });
    }
    // Remove existing menu object by menu id
    function removeMenu(menuId) {
      // Validate that the menu exists
      service.validateMenuExistance(menuId);
      delete service.menus[menuId];
    }
    // Remove existing menu object by menu id
    function removeMenuItem(menuId, menuItemState) {
      // Validate that the menu exists
      service.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in service.menus[menuId].items) {
        if (service.menus[menuId].items.hasOwnProperty(itemIndex) && service.menus[menuId].items[itemIndex].state === menuItemState) {
          service.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return service.menus[menuId];
    }
    // Remove existing menu object by menu id
    function removeSubMenuItem(menuId, submenuItemState) {
      // Validate that the menu exists
      service.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in service.menus[menuId].items) {
        if (this.menus[menuId].items.hasOwnProperty(itemIndex)) {
          for (var subitemIndex in service.menus[menuId].items[itemIndex].items) {
            if (this.menus[menuId].items[itemIndex].items.hasOwnProperty(subitemIndex) && service.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
              service.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
            }
          }
        }
      }
      // Return the menu object
      return service.menus[menuId];
    }
    // Validate menu existance
    function validateMenuExistance(menuId) {
      if (menuId && menuId.length) {
        if (service.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
    }
  }
}());

(function() {
  'use strict';
  // Create the Socket.io wrapper service
  angular.module('core').factory('Socket', Socket);
  Socket.$inject = ['Authentication', '$state', '$timeout'];

  function Socket(Authentication, $state, $timeout) {
    var service = {
      connect: connect,
      emit: emit,
      on: on,
      removeListener: removeListener,
      socket: null
    };
    connect();
    return service;
    // Connect to Socket.io server
    function connect() {
      // Connect only when authenticated
      if (Authentication.user) {
        service.socket = io();
      }
    }
    // Wrap the Socket.io 'emit' method
    function emit(eventName, data) {
      if (service.socket) {
        service.socket.emit(eventName, data);
      }
    }
    // Wrap the Socket.io 'on' method
    function on(eventName, callback) {
      if (service.socket) {
        service.socket.on(eventName, function(data) {
          $timeout(function() {
            callback(data);
          });
        });
      }
    }
    // Wrap the Socket.io 'removeListener' method
    function removeListener(eventName) {
      if (service.socket) {
        service.socket.removeListener(eventName);
      }
    }
  }
}());

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
      controllerAs: 'vm', // becoming the way to access rather than $scope - replace!
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
      if (vm.selectedSection != null) {
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
    // vm.departments = DepartmentsService.query(); // move to Add Class controller, this one is getting messy
    vm.dept = null;
    vm.findTerm = function(inputTermId) { // TODO: move this to some other file, have both controllers use it
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

// (function () {
//   'use strict';

//   angular
//     .module('terms')
//     .controller('TermsController', TermsController);

//   TermsController.$inject = ['TermsService'];


//   function TermsController(TermsService) {
//     var vm = this;

//     vm.terms = TermsService.sch.query();
//   }


// }());

(function() {
  'use strict';
  angular.module('schedules.services').factory('CoursesService', CoursesService);
  CoursesService.$inject = ['$resource'];

  function CoursesService($resource) {
    return $resource('api/terms/:termId/departments/:departmentId/courses/:courseId', {
      departmentId: 'department_id',
      termId: 'term_id',
      courseId: '@_id'
    });
  }
}());

(function() {
  'use strict';
  angular.module('schedules.services').factory('DepartmentsService', DepartmentsService);
  DepartmentsService.$inject = ['$resource', 'TermsService'];

  function DepartmentsService($resource, TermsService) {
    return $resource('api/terms/:termId/departments/:departmentId', {
      departmentId: '@_id',
      termId: 'term_id'
    });
  }
}());

(function() {
  'use strict';
  angular.module('schedules.services').factory('LocationsService', LocationsService);
  LocationsService.$inject = ['$resource'];

  function LocationsService($resource) {
    return $resource('/api/terms/:termId/departments/:departmentId/courses/:courseId/sections/:sectionId/locations/:locationId', {
      termId: 'term_id',
      departmentId: 'department_id',
      courseId: 'course_id',
      sectionId: 'section_id',
      locationId: '@_id'
    });
  }
}());

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

(function() {
  'use strict';
  angular.module('schedules.services').factory('SectionsService', SectionsService);
  SectionsService.$inject = ['$resource'];

  function SectionsService($resource) {
    return $resource('/api/terms/:termId/departments/:departmentId/courses/:courseId/sections/:sectionId', {
      termId: 'term_id',
      departmentId: 'department_id',
      courseId: 'course_id',
      sectionId: '@_id'
    });
  }
}());

(function() {
  'use strict';
  angular.module('schedules.services').factory('TermsService', TermsService);
  TermsService.$inject = ['$resource'];

  function TermsService($resource) {
    return $resource('api/terms/:termId', {
      termId: '@_id'
    });
  }
}());

(function() {
  'use strict';
  angular.module('users.admin').run(menuConfig);
  menuConfig.$inject = ['menuService'];
  // Configuring the Users module
  function menuConfig(menuService) {
    menuService.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
}());

(function() {
  'use strict';
  // Setting up route
  angular.module('users.admin.routes').config(routeConfig);
  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider.state('admin.users', {
      url: '/users',
      templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
      controller: 'UserListController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Users List'
      }
    }).state('admin.user', {
      url: '/users/:userId',
      templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
      controller: 'UserController',
      controllerAs: 'vm',
      resolve: {
        userResolve: getUser
      },
      data: {
        pageTitle: 'Edit {{ userResolve.displayName }}'
      }
    }).state('admin.user-edit', {
      url: '/users/:userId/edit',
      templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
      controller: 'UserController',
      controllerAs: 'vm',
      resolve: {
        userResolve: getUser
      },
      data: {
        pageTitle: 'Edit User {{ userResolve.displayName }}'
      }
    });
    getUser.$inject = ['$stateParams', 'AdminService'];

    function getUser($stateParams, AdminService) {
      return AdminService.get({
        userId: $stateParams.userId
      }).$promise;
    }
  }
}());

(function() {
  'use strict';
  // Setting up route
  angular.module('users.routes').config(routeConfig);
  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Users state routing
    $stateProvider.state('settings', {
      abstract: true,
      url: '/settings',
      templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
      controller: 'SettingsController',
      controllerAs: 'vm',
      data: {
        roles: ['user', 'admin']
      }
    }).state('settings.profile', {
      url: '/profile',
      templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html',
      controller: 'EditProfileController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Settings'
      }
    }).state('settings.password', {
      url: '/password',
      templateUrl: 'modules/users/client/views/settings/change-password.client.view.html',
      controller: 'ChangePasswordController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Settings password'
      }
    }).state('settings.accounts', {
      url: '/accounts',
      templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html',
      controller: 'SocialAccountsController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Settings accounts'
      }
    }).state('settings.picture', {
      url: '/picture',
      templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html',
      controller: 'ChangeProfilePictureController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Settings picture'
      }
    }).state('authentication', {
      abstract: true,
      url: '/authentication',
      templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html',
      controller: 'AuthenticationController',
      controllerAs: 'vm'
    }).state('authentication.signup', {
      url: '/signup',
      templateUrl: 'modules/users/client/views/authentication/signup.client.view.html',
      controller: 'AuthenticationController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Signup'
      }
    }).state('authentication.signin', {
      url: '/signin?err',
      templateUrl: 'modules/users/client/views/authentication/signin.client.view.html',
      controller: 'AuthenticationController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Signin'
      }
    }).state('password', {
      abstract: true,
      url: '/password',
      template: '<ui-view/>'
    }).state('password.forgot', {
      url: '/forgot',
      templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html',
      controller: 'PasswordController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Password forgot'
      }
    }).state('password.reset', {
      abstract: true,
      url: '/reset',
      template: '<ui-view/>'
    }).state('password.reset.invalid', {
      url: '/invalid',
      templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html',
      data: {
        pageTitle: 'Password reset invalid'
      }
    }).state('password.reset.success', {
      url: '/success',
      templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html',
      data: {
        pageTitle: 'Password reset success'
      }
    }).state('password.reset.form', {
      url: '/:token',
      templateUrl: 'modules/users/client/views/password/reset-password.client.view.html',
      controller: 'PasswordController',
      controllerAs: 'vm',
      data: {
        pageTitle: 'Password reset form'
      }
    });
  }
}());

(function() {
  'use strict';
  angular.module('users.admin').controller('UserListController', UserListController);
  UserListController.$inject = ['$scope', '$filter', 'AdminService'];

  function UserListController($scope, $filter, AdminService) {
    var vm = this;
    vm.buildPager = buildPager;
    vm.figureOutItemsToDisplay = figureOutItemsToDisplay;
    vm.pageChanged = pageChanged;
    AdminService.query(function(data) {
      vm.users = data;
      vm.buildPager();
    });

    function buildPager() {
      vm.pagedItems = [];
      vm.itemsPerPage = 15;
      vm.currentPage = 1;
      vm.figureOutItemsToDisplay();
    }

    function figureOutItemsToDisplay() {
      vm.filteredItems = $filter('filter')(vm.users, {
        $: vm.search
      });
      vm.filterLength = vm.filteredItems.length;
      var begin = ((vm.currentPage - 1) * vm.itemsPerPage);
      var end = begin + vm.itemsPerPage;
      vm.pagedItems = vm.filteredItems.slice(begin, end);
    }

    function pageChanged() {
      vm.figureOutItemsToDisplay();
    }
  }
}());

(function() {
  'use strict';
  angular.module('users.admin').controller('UserController', UserController);
  UserController.$inject = ['$scope', '$state', '$window', 'Authentication', 'userResolve'];

  function UserController($scope, $state, $window, Authentication, user) {
    var vm = this;
    vm.authentication = Authentication;
    vm.user = user;
    vm.remove = remove;
    vm.update = update;

    function remove(user) {
      if ($window.confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();
          vm.users.splice(vm.users.indexOf(user), 1);
        } else {
          vm.user.$remove(function() {
            $state.go('admin.users');
          });
        }
      }
    }

    function update(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      }
      var user = vm.user;
      user.$update(function() {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function(errorResponse) {
        vm.error = errorResponse.data.message;
      });
    }
  }
}());

(function() {
  'use strict';
  angular.module('users').controller('AuthenticationController', AuthenticationController);
  AuthenticationController.$inject = ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator'];

  function AuthenticationController($scope, $state, $http, $location, $window, Authentication, PasswordValidator) {
    var vm = this;
    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.signup = signup;
    vm.signin = signin;
    vm.callOauthProvider = callOauthProvider;
    // Get an eventual error defined in the URL query string:
    vm.error = $location.search().err;
    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      $location.path('/');
    }

    function signup(isValid) {
      vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      }
      $http.post('/api/auth/signup', vm.credentials).success(function(response) {
        // If successful we assign the response to the global user model
        vm.authentication.user = response;
        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function(response) {
        vm.error = response.message;
      });
    }

    function signin(isValid) {
      vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      }
      $http.post('/api/auth/signin', vm.credentials).success(function(response) {
        // If successful we assign the response to the global user model
        vm.authentication.user = response;
        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function(response) {
        vm.error = response.message;
      });
    }
    // OAuth provider request
    function callOauthProvider(url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }
      // Effectively call OAuth authentication route:
      $window.location.href = url;
    }
  }
}());

(function() {
  'use strict';
  angular.module('users').controller('PasswordController', PasswordController);
  PasswordController.$inject = ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator'];

  function PasswordController($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    var vm = this;
    vm.resetUserPassword = resetUserPassword;
    vm.askForPasswordReset = askForPasswordReset;
    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      $location.path('/');
    }
    // Submit forgotten password account id
    function askForPasswordReset(isValid) {
      vm.success = vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.forgotPasswordForm');
        return false;
      }
      $http.post('/api/auth/forgot', vm.credentials).success(function(response) {
        // Show user success message and clear form
        vm.credentials = null;
        vm.success = response.message;
      }).error(function(response) {
        // Show user error message and clear form
        vm.credentials = null;
        vm.error = response.message;
      });
    }
    // Change user password
    function resetUserPassword(isValid) {
      vm.success = vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.resetPasswordForm');
        return false;
      }
      $http.post('/api/auth/reset/' + $stateParams.token, vm.passwordDetails).success(function(response) {
        // If successful show success message and clear form
        vm.passwordDetails = null;
        // Attach user profile
        Authentication.user = response;
        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function(response) {
        vm.error = response.message;
      });
    }
  }
}());

(function() {
  'use strict';
  angular.module('users').controller('ChangePasswordController', ChangePasswordController);
  ChangePasswordController.$inject = ['$scope', '$http', 'Authentication', 'PasswordValidator'];

  function ChangePasswordController($scope, $http, Authentication, PasswordValidator) {
    var vm = this;
    vm.user = Authentication.user;
    vm.changeUserPassword = changeUserPassword;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    // Change user password
    function changeUserPassword(isValid) {
      vm.success = vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.passwordForm');
        return false;
      }
      $http.post('/api/users/password', vm.passwordDetails).success(function(response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'vm.passwordForm');
        vm.success = true;
        vm.passwordDetails = null;
      }).error(function(response) {
        vm.error = response.message;
      });
    }
  }
}());

(function() {
  'use strict';
  angular.module('users').controller('ChangeProfilePictureController', ChangeProfilePictureController);
  ChangeProfilePictureController.$inject = ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader'];

  function ChangeProfilePictureController($scope, $timeout, $window, Authentication, FileUploader) {
    var vm = this;
    vm.user = Authentication.user;
    vm.imageURL = vm.user.profileImageURL;
    vm.uploadProfilePicture = uploadProfilePicture;
    vm.cancelUpload = cancelUpload;
    // Create file uploader instance
    vm.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture',
      onAfterAddingFile: onAfterAddingFile,
      onSuccessItem: onSuccessItem,
      onErrorItem: onErrorItem
    });
    // Set file uploader image filter
    vm.uploader.filters.push({
      name: 'imageFilter',
      fn: function(item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });
    // Called after the user selected a new picture file
    function onAfterAddingFile(fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);
        fileReader.onload = function(fileReaderEvent) {
          $timeout(function() {
            vm.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    }
    // Called after the user has successfully uploaded a new picture
    function onSuccessItem(fileItem, response, status, headers) {
      // Show success message
      vm.success = true;
      // Populate user object
      vm.user = Authentication.user = response;
      // Clear upload buttons
      cancelUpload();
    }
    // Called after the user has failed to uploaded a new picture
    function onErrorItem(fileItem, response, status, headers) {
      // Clear upload buttons
      cancelUpload();
      // Show error message
      vm.error = response.message;
    }
    // Change user profile picture
    function uploadProfilePicture() {
      // Clear messages
      vm.success = vm.error = null;
      // Start upload
      vm.uploader.uploadAll();
    }
    // Cancel the upload process
    function cancelUpload() {
      vm.uploader.clearQueue();
      vm.imageURL = vm.user.profileImageURL;
    }
  }
}());

(function() {
  'use strict';
  angular.module('users').controller('EditProfileController', EditProfileController);
  EditProfileController.$inject = ['$scope', '$http', '$location', 'UsersService', 'Authentication'];

  function EditProfileController($scope, $http, $location, UsersService, Authentication) {
    var vm = this;
    vm.user = Authentication.user;
    vm.updateUserProfile = updateUserProfile;
    // Update a user profile
    function updateUserProfile(isValid) {
      vm.success = vm.error = null;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      }
      var user = new UsersService(vm.user);
      user.$update(function(response) {
        $scope.$broadcast('show-errors-reset', 'vm.userForm');
        vm.success = true;
        Authentication.user = response;
      }, function(response) {
        vm.error = response.data.message;
      });
    }
  }
}());

(function() {
  'use strict';
  angular.module('users').controller('SocialAccountsController', SocialAccountsController);
  SocialAccountsController.$inject = ['$scope', '$http', 'Authentication'];

  function SocialAccountsController($scope, $http, Authentication) {
    var vm = this;
    vm.user = Authentication.user;
    vm.hasConnectedAdditionalSocialAccounts = hasConnectedAdditionalSocialAccounts;
    vm.isConnectedSocialAccount = isConnectedSocialAccount;
    vm.removeUserSocialAccount = removeUserSocialAccount;
    // Check if there are additional accounts
    function hasConnectedAdditionalSocialAccounts() {
      return ($scope.user.additionalProvidersData && Object.keys($scope.user.additionalProvidersData).length);
    }
    // Check if provider is already in use with current user
    function isConnectedSocialAccount(provider) {
      return vm.user.provider === provider || (vm.user.additionalProvidersData && vm.user.additionalProvidersData[provider]);
    }
    // Remove a user social account
    function removeUserSocialAccount(provider) {
      vm.success = vm.error = null;
      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function(response) {
        // If successful show success message and clear form
        vm.success = true;
        vm.user = Authentication.user = response;
      }).error(function(response) {
        vm.error = response.message;
      });
    }
  }
}());

(function() {
  'use strict';
  angular.module('users').controller('SettingsController', SettingsController);
  SettingsController.$inject = ['$scope', 'Authentication'];

  function SettingsController($scope, Authentication) {
    var vm = this;
    vm.user = Authentication.user;
  }
}());

(function() {
  'use strict';
  angular.module('users').directive('passwordValidator', passwordValidator);
  passwordValidator.$inject = ['PasswordValidator'];

  function passwordValidator(PasswordValidator) {
    var directive = {
      require: 'ngModel',
      link: link
    };
    return directive;

    function link(scope, element, attrs, ngModel) {
      ngModel.$validators.requirements = function(password) {
        var status = true;
        if (password) {
          var result = PasswordValidator.getResult(password);
          var requirementsIdx = 0;
          // Requirements Meter - visual indicator for users
          var requirementsMeter = [{
            color: 'danger',
            progress: '20'
          }, {
            color: 'warning',
            progress: '40'
          }, {
            color: 'info',
            progress: '60'
          }, {
            color: 'primary',
            progress: '80'
          }, {
            color: 'success',
            progress: '100'
          }];
          if (result.errors.length < requirementsMeter.length) {
            requirementsIdx = requirementsMeter.length - result.errors.length - 1;
          }
          scope.requirementsColor = requirementsMeter[requirementsIdx].color;
          scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;
          if (result.errors.length) {
            scope.getPopoverMsg = PasswordValidator.getPopoverMsg();
            scope.passwordErrors = result.errors;
            status = false;
          } else {
            scope.getPopoverMsg = '';
            scope.passwordErrors = [];
            status = true;
          }
        }
        return status;
      };
    }
  }
}());

(function() {
  'use strict';
  angular.module('users').directive('passwordVerify', passwordVerify);

  function passwordVerify() {
    var directive = {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: link
    };
    return directive;

    function link(scope, element, attrs, ngModel) {
      var status = true;
      scope.$watch(function() {
        var combined;
        if (scope.passwordVerify || ngModel) {
          combined = scope.passwordVerify + '_' + ngModel;
        }
        return combined;
      }, function(value) {
        if (value) {
          ngModel.$validators.passwordVerify = function(password) {
            var origin = scope.passwordVerify;
            return (origin === password);
          };
        }
      });
    }
  }
}());

(function() {
  'use strict';
  // Users directive used to force lowercase input
  angular.module('users').directive('lowercase', lowercase);

  function lowercase() {
    var directive = {
      require: 'ngModel',
      link: link
    };
    return directive;

    function link(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function(input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  }
}());

(function() {
  'use strict';
  // Authentication service for user variables
  angular.module('users.services').factory('Authentication', Authentication);
  Authentication.$inject = ['$window'];

  function Authentication($window) {
    var auth = {
      user: $window.user
    };
    return auth;
  }
}());

(function() {
  'use strict';
  // PasswordValidator service used for testing the password strength
  angular.module('users.services').factory('PasswordValidator', PasswordValidator);
  PasswordValidator.$inject = ['$window'];

  function PasswordValidator($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;
    var service = {
      getResult: getResult,
      getPopoverMsg: getPopoverMsg
    };
    return service;

    function getResult(password) {
      var result = owaspPasswordStrengthTest.test(password);
      return result;
    }

    function getPopoverMsg() {
      var popoverMsg = 'Please enter a passphrase or password with 10 or more characters, numbers, lowercase, uppercase, and special characters.';
      return popoverMsg;
    }
  }
}());

(function() {
  'use strict';
  // Users service used for communicating with the users REST endpoint
  angular.module('users.services').factory('UsersService', UsersService);
  UsersService.$inject = ['$resource'];

  function UsersService($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
  // TODO this should be Users service
  angular.module('users.admin.services').factory('AdminService', AdminService);
  AdminService.$inject = ['$resource'];

  function AdminService($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
