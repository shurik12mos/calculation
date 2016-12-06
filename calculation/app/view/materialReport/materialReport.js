'use strict';

angular.module('appCalc.materialReport', [
'ngRoute', 
'appCalc.calculationService', 
'appCalc.materialReportService', 
'appCalc.Common', 
'appCalc.niService',
'appCalc.jobReportService'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view/materialReport', {
    templateUrl: 'view/materialReport/materialReport.html',
    controller: 'MaterialReportCtrl'
  });
}])

.controller('MaterialReportCtrl', ['$scope', 'Calculation', 'MaterialReport', 'Ni', 'Common', 'JobReport', 
	function($scope, Calculation, MaterialReport, Ni, Common, JobReport) {
		$scope.calculation = Calculation;
		$scope.materialReport = MaterialReport;
		$scope.ni = Ni;
		$scope.materialReport.refreshMaterials(Calculation);
		$scope.jobReport = JobReport;
		$scope.common = Common;		
	}
]);