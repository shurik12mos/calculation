'use strict';

var app = angular.module('appCalc.pricelist', ['ngResource', 'ngRoute', 'appCalc.googleSheet', 'appCalc.pricelistService'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view/pricelist', {
    templateUrl: 'view/pricelist/pricelist.html',
    controller: 'PricelistCtrl'
  });
}])

.controller('PricelistCtrl', ['GetGoogleSheet', '$scope', 'Pricelist', function(GetGoogleSheet, $scope, Pricelist) {
	var price ;
	console.log("$scope", $scope, 'GetGoogleSheet', GetGoogleSheet, 'Pricelist', Pricelist);
	if (!Pricelist.pricelist) {
		console.log('error');
		price = GetGoogleSheet.get(function(success){
			Pricelist.init(success.price);
			$scope.pricelist = Pricelist;
			
		}, function(error){
			console.log('error', error);
		});
	}else {
		$scope.pricelist = Pricelist;
		$scope.load = true;	
	}
		
}]);

