(function () {
    "use strict";
    var app = angular.module('appCalc.financeReport', [
        'appCalc.calculation',
        'appCalc.pricelist',
        'appCalc.ni',
        'appCalc.Common',
        'appCalc.commonDirectives',
        'appCalc.jobReportService',
        'appCalc.materialReportService',
        'appCalc.members',
        'appCalc.financeReportService'
    ]);

    app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view/financeReport', {
            templateUrl: 'view/financeReport/financeReport.html',
            controller: 'FinanceReportCtrl'
        });
    }]);

    app.controller('FinanceReportCtrl', ['$scope',
        'Calculation',
        'Ni',
        'Pricelist',
        'Common',
        'JobReport',
        'MaterialReport',
        'Members',
        'FinanceReport',
        function ($scope, Calculation, Ni, Pricelist, Common, JobReport, MaterialReport, Members, FinanceReport) {
            var materials, jobs;

            $scope.calculation = Calculation;
            $scope.pricelist = Pricelist;
            $scope.common = Common;
            $scope.ni = Ni;
            $scope.jobReport = JobReport;
            $scope.materialReport = MaterialReport;
            $scope.members = Members;

            // initialization
            $scope.jobReport.refreshJobs(Calculation.jobs);

            Ni.calc(Members.workers.salary, Members.workers.amortization);

            if (JobReport.jobs.sum > 0) {
                jobs = JobReport.jobs;
            } else {
                jobs = Calculation.jobs;
            }

            if (MaterialReport.installMaterials > 0) {
                materials = MaterialReport.materials.concat(
                    MaterialReport.materialsFromStore,
                    MaterialReport.materialsBuyBrigadier,
                    MaterialReport.materialsStoreBrigadier
                );

                materials.sum = materials.reduce(function (sum, item) {
                    return sum += +item.sum;
                }, 0);

            } else {
                materials = Calculation.materials;
            }

            $scope.cost = function () {
                var calc = 0,
                    real = 0;

                calc += Calculation.materials.sum + Calculation.materials.reserve;
                calc += Calculation.salaryMainWorkers;
                calc += Ni.prop.salaryBrigadier.value;
                calc += Ni.prop.salaryProject.value;
                calc += Ni.prop.salaryManager.value;
                calc += Ni.prop.overheadExp.value;
                calc += Ni.prop.promotion.value;
                calc += (Calculation.materials.sum + Calculation.materials.reserve) * Members.fromMaterialsPercent;
                calc += Calculation.jobs.total * Members.fromServicePercent;
                $scope.costCalc = calc;

                real += MaterialReport.installMaterials;
                real += Members.total;
                real += Members.fromService + Members.fromMaterials;
                real += MaterialReport.overheadExpenses.sum + MaterialReport.transportExpenses.sum;
                $scope.costReal = real;
            };

            $scope.members.calculate({
                materials: materials,
                jobs: jobs
            });

            $scope.cost();
            //

            $scope.membersCalculate = function () {
                $scope.members.calculate({
                    materials: materials,
                    jobs: jobs
                });

                $scope.cost();
            };

            $scope.workersPromotion = function (worker) {
                if (!worker) return;
                var val = +worker.promotion.percent;

                if (!angular.isNumber(val)) worker.promotion.percent = 0;
                if (!val || val < 0) worker.promotion.percent = 0;
                if (val > Ni.prop.possibleBonus.value) {
                    worker.promotion.percent = Ni.prop.possibleBonus.value;
                }

                $scope.membersCalculate();
            };


        }
    ]);

})();
