'use strict';

angular.module('appCalc.calculation', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view/calculation', {
    templateUrl: 'view/calculation/calculation.html',
    controller: 'CalculationCtrl'
  });
}])

.controller('CalculationCtrl', [function() {

}]);