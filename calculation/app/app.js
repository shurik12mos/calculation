'use strict';

// Declare app level module which depends on views, and components
angular.module('appCalc', [
  'ngRoute',
  'appCalc.calculation',
  'appCalc.pricelist',
  'appCalc.ni',
  'appCalc.Common'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: 'view/calculation'});
}]);
