"use strict";

var app = angular.module('appCalc.commonDirectives', ['appCalc.Common']);

app.directive('job', [function() {
	return  {
		restrict: 'E',
		scope: {
			job: "=job",
			target: "=target",
			promise: "=promise"
		},
		templateUrl: 'common/directives/job/job.html',
		link: function(scope, element, attrs) {	
			// считаем стоимость работы после того, как загрузится прайс
			scope.promise.then(function() {
				try {
					scope.job.sumJob();
				}catch(err) {
					console.log("error in scope.job.sumJob();", scope.job)
				}
				
			});					
		}
	};
}]);
