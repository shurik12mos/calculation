(function () {
    "use strict";
    var app = angular.module('appCalc.jobReport', ['appCalc.calculation',
        'appCalc.pricelist',
        'appCalc.ni',
        'appCalc.Common',
        'appCalc.commonDirectives',
        'appCalc.jobReportService',
        'appCalc.members'
    ]);

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view/jobReport', {
            templateUrl: 'view/jobReport/jobReport.html',
            controller: 'JobReportCtrl'
        });
    }]);

    app.controller('JobReportCtrl', ['$scope', 'Calculation', 'Ni', 'Pricelist', 'Common',
        'JobReport', 'Members',
        function ($scope, Calculation, Ni, Pricelist, Common, JobReport, Members) {
            $scope.calculation = Calculation;
            $scope.pricelist = Pricelist;
            $scope.common = Common;
            $scope.members = Members;
            $scope.jobReport = JobReport;
            $scope.jobReport.refreshJobs(Calculation.jobs);

            $scope.lengthBottom = $scope.jobReport.workers.length + 7;

            $scope.addWorker = function () {
                Members.addWorker(JobReport.jobs);
            }
        }
    ]);

})();
