'use strict';

var app = angular.module('appCalc.pricelist', ['ngResource', 
												'ngRoute', 
												'appCalc.googleSheet', 
												'appCalc.pricelistService', 
												'appCalc.Common', 
												'appCalc.niService'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view/pricelist', {
    templateUrl: 'view/pricelist/pricelist.html',
    controller: 'PricelistCtrl'
  });
}])

.controller('PricelistCtrl', ['GetGoogleSheet', '$scope', 'Pricelist', 'Calculation', '$q', function(GetGoogleSheet, $scope, Pricelist, Calculation, $q) {
	$scope.loadPrice;	
	
	$scope.loadPrice = $q.defer();
	
	if (!Pricelist.pricelist) {		
		$scope.price = GetGoogleSheet.get(function(success){
			Pricelist.init(success.price);
			$scope.pricelist = Pricelist;	
			$scope.pricelist.unChecked();			
			$scope.load = true;
			$scope.loadPrice.resolve();
		}, function(error){
			console.log('error', error);
			$scope.loadPrice.reject();
		});
	}else {
		$scope.pricelist = Pricelist;
		$scope.load = true;	
		$scope.pricelist.unChecked();
	}
	
	$scope.calculation = Calculation;
	
		
}]);

//search directives
app.directive('searchJob', [function() {
	return  {
		restrict: 'E',
		scope: {
			searchSource: "=searchSource",
			searchTarget: "=searchTarget",
			promise: "=promise"
		},
		templateUrl: 'view/pricelist/searchJob.html',
		link: function(scope, element, attrs) {	
			var jobsArr;
			function createJobsArr(source, target) {
				if (!target) target = [];
				
				if (!Array.isArray(source)) return [];
				source.forEach(function(item) {
					if (Array.isArray(item)) {
						createJobsArr(item, target);
					} else if (Object.prototype.toString.call(item) === "[object Object]") {
						target.push(item);
					}
				});
				
				return target;
			};
			
			//jobsArr = createJobsArr(scope.searchSource, jobsArr);
			
			
			
			scope.search = function(value) {
				if (value.length<3) {
					scope.results = [];
				}else {
					scope.results = scope.searchSource.allJobs;
				}				
			}
			
		}
	};
}]);

