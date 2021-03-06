"use strict";

var app = angular.module('appCalc.commonDirectives', ['appCalc.Common', 'appCalc.pricelistService']);

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
			price: "=price",
			type: "=type"
		},
		templateUrl: 'common/directives/tableJob/tableJob.html',
		controller: function($scope) {
			console.log('tableJob controller', $scope.$parent);
		},
		link: function(scope, element, attrs, ctrl) {	
			console.log('tableJob', scope, element, attrs, ctrl);
			var advanced = false;
			scope.common = Common;			
		}
	};
}]);

// не работает. не знаю почему. портит вид таблицы.
/*app.directive('clcAddRow', ['Common', function(Common) {
	return  {
		restrict: 'C',
		scope: {
					
		},
		templateUrl: 'common/directives/tableJob/tableJob.html',
		link: function(scope, element, attrs) {	
			var target1, l, listOfVar, temp;		
			
			if (attrs.ngRepeat) {
				temp = attrs.ngRepeat.search('in ');
				
				temp = attrs.ngRepeat.slice(temp+3);
				console.log("temp", temp);
				temp = temp[temp.length-1];
				
				listOfVar = temp.split('.');
				l = listOfVar.length;
				
				target1 = scope.$parent[listOfVar[0]];
				
				for (var i = 1; i<l; i++) {
					try {
						target1 = target1[listOfVar[i]];
					}catch(e) {
						return;
					}
				}
			}
			
			if (target1 === "undefined") {
				return;
			}
			
			element.on('click', function(e){
				console.log('event', e);
			});	
			console.log('clcAddRow22', target1);
		}
	};
}]);*/

//search directives
app.directive('searchJob', ['Pricelist', function(Pricelist) {
	return  {
		restrict: 'E',
		scope: {
			searchTarget: "=searchTarget",
			promise: "=promise"
		},
		templateUrl: 'view/pricelist/searchJob.html',
		link: function(scope, element, attrs) {	
			var jobsArr;
			Pricelist.init();
			
			scope.searchSource = Pricelist;
			
			scope.searchSource.loadPrice.promise.then(function(){
				
			});
			
			
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

//description - directive with div and textarea. Show content in div, when click in it 
//				it show content in textarea to change it. when blur textarea - show div again
//in - target is content to show and change
//out - void
app.directive('inputDiv', ['Common', function(Common) {
	return  {
		restrict: 'E',
		scope: {
			target: "=target"
		},
		templateUrl: 'common/directives/inputDiv/inputDiv.html',
		link: function(scope, element, attrs) {	
			var target = scope.target;			
			
			scope.focus = false;
			
			element.on('click', function(e){				
				e.target.parentElement.getElementsByTagName('textarea')[0].focus();				
			});	
		}
	};
}]);

//description - directive make value of element is number looks like X.XX
//in - value of element
//out - value to number
app.directive('number', ['Common', function(Common) {
	return  {
		restrict: 'C',
		scope: {
			fraction: "=?dataFraction"
		},		
		link: function(scope, element, attrs) {	
			var self = this;
			scope.value = this.value;
			
			scope.$watch('value', function(oldVal, newVal){
				var value;
				
				value = self.value;
				value = Common.toFloat(value, scope.fraction);
				
				if (!Number.isFinite(value, value)) value = 0;
				
				angular.element(self).text(value);
				angular.element(self).val(value);				
			});			
		}
	};
}]);




