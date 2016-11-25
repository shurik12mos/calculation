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
		
		//Производственные расходы по факту
		if ($scope.jobReport.workers) {
			$scope.overhead_exp = $scope.jobReport.workers.reduce(function(sum, worker) {
				try {
					return sum + Common.toFloat(worker.salary.sum);
				}catch(e) {
					return sum;
				};
				
			}, 0);
			$scope.overhead_exp *= Common.toFloat(Ni.prop.overheadExp.percent/100);
		}else {
			$scope.overhead_exp = 0;
		}
		
		//Баланс общепроизводственных расходов
		$scope.materialReport.overheadExpenses = $scope.materialReport.overheadExpenses || [];
		$scope.materialReport.overheadExpenses.sum = $scope.materialReport.overheadExpenses?$scope.materialReport.overheadExpenses.sum:0;
		$scope.overhead_balance = Common.toFloat($scope.overhead_exp - $scope.materialReport.overheadExpenses.sum || 0);
		
		
		//Баланс общепроизводственных расходов
		
	}
]);