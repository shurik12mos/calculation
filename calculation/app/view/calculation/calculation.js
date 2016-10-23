'use strict';

angular.module('appCalc.calculation', ['ngRoute', 'appCalc.calculationService'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view/calculation', {
    templateUrl: 'view/calculation/calculation.html',
    controller: 'CalculationCtrl'
  });
}])

.controller('CalculationCtrl', ['$scope', 'Calculation', function($scope, Calculation) {
	$scope.calculation = Calculation;
	$scope.calculation.calculate();
}]);