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

app.directive('tableJob', ['Common', function(Common) {
	// source должен иметь массив jobs и методы addJob, deleteJob, calculate
	//type указывает на вид таблицы - короткий(short), расширенный (advanced)
	return  {
		restrict: 'E',
		scope: {
			source: "=source",
			type: "=type"
		},
		templateUrl: 'common/directives/tableJob/tableJob.html',
		link: function(scope, element, attrs) {		
			var advanced = false;
			scope.common = Common;			
		}
	};
}]);