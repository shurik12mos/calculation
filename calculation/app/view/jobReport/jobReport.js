"use strict";

var app = angular.module('appCalc.jobReport', ['appCalc.calculation',
  'appCalc.pricelist',
  'appCalc.ni',
  'appCalc.Common',
  'appCalc.commonDirectives',
  'appCalc.jobReportService']);

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view/jobReport', {
    templateUrl: 'view/jobReport/jobReport.html',
    controller: 'JobReportCtrl'
  });
}]);

app.controller('JobReportCtrl', ['$scope', 'Calculation', 'Ni', 'Pricelist', 'Common', 'JobReport',
 function($scope, Calculation, Ni, Pricelist, Common, JobReport) {
	$scope.calculation = Calculation;
	$scope.pricelist = Pricelist;
	$scope.common = Common;
	$scope.jobReport = JobReport;
	$scope.jobReport.refreshJobs(Calculation.jobs);	
	
	$scope.lengthBottom = $scope.jobReport.workers.length+7;
}]);