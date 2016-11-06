'use strict';

angular.module('appCalc.calculation', ['ngRoute', 'appCalc.calculationService', 'appCalc.pricelistService', 'appCalc.Common'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view/calculation', {
    templateUrl: 'view/calculation/calculation.html',
    controller: 'CalculationCtrl'
  });
}])

.controller('CalculationCtrl', ['$scope', 'Calculation', 'Pricelist', function($scope, Calculation, Pricelist) {
	$scope.calculation = Calculation;
	$scope.calculation.calculate();
	$scope.pricelist = Pricelist;
}]);