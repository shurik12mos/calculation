'use strict';

angular.module('appCalc.pricelist', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view/pricelist', {
    templateUrl: 'view/pricelist/pricelist.html',
    controller: 'PricelistCtrl'
  });
}])

.controller('PricelistCtrl', [function() {

}]);