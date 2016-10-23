'use strict';

var app = angular.module('appCalc.ni', ['ngResource', 'ngRoute', 'appCalc.niService'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view/ni', {
    templateUrl: 'view/ni/ni.html',
    controller: 'NiCtrl'
  });
}])

.controller('NiCtrl', ['$scope', 'Ni', function($scope, Ni) {
	$scope.ni = Ni;
	$scope.calc = Ni.calc;
	$scope.calc();
}]);
