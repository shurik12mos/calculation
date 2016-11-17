'use strict';

angular.module('appCalc.materialReport', ['ngRoute', 'appCalc.calculationService', 'appCalc.materialReportService', 'appCalc.Common'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view/materialReport', {
    templateUrl: 'view/materialReport/materialReport.html',
    controller: 'MaterialReportCtrl'
  });
}])

.controller('MaterialReportCtrl', ['$scope', 'Calculation', 'MaterialReport', function($scope, Calculation, MaterialReport) {
	$scope.calculation = Calculation;
	$scope.materialReport = MaterialReport;
	$scope.materialReport.refreshMaterials(Calculation);
}]);