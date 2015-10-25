import angular from 'angular';

import ReloadableService from './reloadable.service';
import ReloadableController from './reloadable.ctrl';

angular.module('hmrTest', [
  require('angular-ui-router'),
  'hmr-runtime'
])
  .config(($stateProvider, $urlRouterProvider) => {
    $stateProvider.state('main', {
      url: '/',
      template: require('./main.html'),
      controller: 'TestController',
      controllerAs: 'vm'
    });
    $urlRouterProvider.otherwise('/');
  })
  .service('ReloadableService', ReloadableService)
  .controller('TestController', ReloadableController);
