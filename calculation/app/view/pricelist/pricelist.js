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
	$scope.pricelist = Pricelist;
	$scope.loadPrice = Pricelist.loadPrice;
	
	$scope.pricelist.init();
	$scope.loadPrice.promise.then(function(){
		$scope.load = true;
		$scope.pricelist.unChecked();
	});
	
	
	
	
	/*$scope.loadPrice;	
	
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
	}*/
	
	$scope.calculation = Calculation;		
}]);

