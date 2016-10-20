'use strict';

var app = angular.module('appCalc.ni', ['ngResource', 'ngRoute', 'appCalc.niService'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view/pricelist', {
    templateUrl: 'view/pricelist/pricelist.html',
    controller: 'PricelistCtrl'
  });
}])

.controller('NiCtrl', ['$scope', 'Ni', function($scope, Ni) {
	$scope.ni = Ni;
		
}]);
