(function () {
    'use strict';
    var app = angular.module('appCalc.members', [
        'appCalc.Common',
        'appCalc.niService'
    ]);

    app.factory('Members', ['Ni', '$rootScope', 'Common', 'Worker', 'MemberBonus',
        function (Ni, $rootScope, Common, Worker, MemberBonus) {
            var self = this;

            this.workers = [];
            this.workers.plan = [];
            this.members = [];


            this.projectDesigner = new MemberBonus(Ni.prop.salaryProject, 0.07, 0, Ni.prop.salaryProject.percent);
            this.members.push(this.projectDesigner);

            this.brigadier = new MemberBonus(Ni.prop.salaryBrigadier, 0.07, 0, Ni.prop.salaryBrigadier.percent);
            this.members.push(this.brigadier);

            this.manager = new MemberBonus(Ni.prop.salaryManager, 0.07, 0, Ni.prop.salaryManager.percent);
            this.members.push(this.manager);

            this.seller = new MemberBonus(Ni.prop.sellExp, 0.14, 0, 0);
            this.members.push(this.seller);

            this.calculate = function (calculation) {
                var data = {
                        workersSum: 0
                    },
                    self = this;

                //Сумма основных показателей
                this.salary = 0;
                this.promotion = 0;
                this.hour = 0;
                this.amortization = 0;
                this.total = 0;
                this.fromService = 0;
                this.fromMaterials = 0;
                //

                data.materials = calculation ? calculation.materials : [];
                data.jobs = calculation ? calculation.jobs : [];

                this.workers.calculate(data.jobs);

                data.workersSum = this.workers.salary;

                this.brigadier.calculate(data);
                this.projectDesigner.calculate(data);
                this.manager.calculate(data);
                this.seller.calculate(data);

                sumTotalNumbers(this.workers, this.brigadier, this.projectDesigner, this.manager, this.seller);

                function sumTotalNumbers() {
                    var args = Array.prototype.slice.call(arguments),
                        i = 0,
                        l = args.length;

                    for (; i < l; i++) {
                        self.salary += args[i].salary || 0;
                        if (angular.isObject(args[i].promotion)) {
                            self.promotion += +args[i].promotion.value;
                        } else if (angular.isNumber(+args[i].promotion)) {
                            self.promotion += +args[i].promotion;
                        }

                        self.hour += args[i].hour || 0;
                        self.amortization += args[i].amortization || 0;
                        self.total += args[i].total || 0;
                        if (!args[i].bonuses) continue;
                        self.fromService += +args[i].bonuses.fromService.value || 0;
                        self.fromMaterials += +args[i].bonuses.fromMaterials.value || 0;
                        self.fromServicePercent += +args[i].bonuses.fromService.percent || 0;
                        self.fromMaterialsPercent += +args[i].bonuses.fromMaterials.percent || 0;
                    }
                }
            };

            this.workers.calculate = function (jobs) {
                this.salary = 0;
                this.promotion = 0;
                this.hour = 0;
                this.amortization = 0;
                this.total = 0;

                if (this.length > 0) {
                    this.forEach(function (worker, i, workers) {
                        worker.calculate();
                        workers.salary += worker.salary.sum;
                        workers.hour += worker.hour.sum || 0;
                        workers.promotion += worker.promotion.value;
                        workers.amortization += worker.amortization.sum;
                        workers.total += worker.total;
                    });
                } else {
                    this.salary = jobs.salaryMainWorkers || 0;
                    this.hour = jobs.human_hour || 0;
                    this.amortization = jobs.amortizations || 0;
                    this.total = jobs.salaryMainWorkers || 0;
                }

                return {
                    salary: this.salary,
                    promotion: this.promotion,
                    hour: this.hour,
                    amortization: this.amortization,
                    total: this.total
                };
            };

            this.addDay = function () {
                var day = {
                        index: 0,
                        date: new Date(),
                        project_hour: 0,
                        project_people: 0,
                        fact_hour: 0,
                        commentary: ""
                    },
                    plan = this.workers.plan,
                    lastDay;

                if (plan.length > 0 && plan[plan.length - 1].date) {
                    day.date = plan[plan.length - 1].date;
                    lastDay = day.date.getDate();
                    day.date.setDate(lastDay + 1);
                }

                this.workers.plan.push(day);
                Common.setIndex(this.workers.plan);
            };

            this.addWorker = function (jobs) {
                var worker = new Worker(jobs);

                this.workers.push(worker);
            };

            return this;
        }
    ]);

    app.factory('Worker', ['Ni', 'Common', function (Ni, Common) {
        function Worker(jobs) {
            this.name = "";
            this.salary = [];
            this.salary.sum = 0;
            this.hour = [];
            this.hour.sum = 0;
            this.jobs = jobs || [];
            this.number = [];
            this.number.sum = 0;
            this.amortization = [];
            this.amortization.sum = 0;
            this.sum_hour = 0;
            this.fact_hour = [];
            this.promotion = {
                defaultPercent: 40,
                percent: 0,
                value: 0
            };
        }

        Worker.prototype.constructor = Worker;

        Worker.prototype.calculate = function () {
            var self = this;
            //salary, hour, amortizations, promotion, partPercent
            this.salary.sum = 0;
            this.hour.sum = 0;
            this.amortization.sum = 0;
            this.total = 0;

            this.number.forEach(function (number, i) {
                var job = self.jobs[i];
                if (!number) number = 0;

                self.salary[i] = Common.toFloat(job.rank * job.human_hour * number * Ni.humanHourPrice.value);
                self.amortization[i] = Common.toFloat(job.amortization * job.human_hour * number, 2);
                self.hour[i] = Common.toFloat(job.human_hour * number || 0);
                self.amortization.sum += self.amortization[i];
                self.salary.sum += self.salary[i];
                self.hour.sum += self.hour[i];
            });

            this.promotion.value = Common.toFloat(this.salary.sum * this.promotion.percent / 100);

            this.salary.sum = Common.toFloat(this.salary.sum);
            this.hour.sum = Common.toFloat(this.hour.sum);

            this.total = this.salary.sum + this.promotion.value;

            this.sum_hour = this.hour.sum;
        };

        Worker.prototype.addJob = function (job) {
            var exist = this.jobs.some(function (item) {
                return item.id === job.id;
            });

            if (!exist) this.jobs.push(job);
        };

        Worker.prototype.deleteJob = function (job) {
            var self = this;
            this.jobs.forEach(function (workerJob, i, jobs) {
                if (workerJob.id === job.id) {
                    jobs.splice(i, 1);
                    self.number.splice(i, 1);
                    self.amortization.splice(i, 1);
                }
            });
        };

        return Worker;
    }]);

    app.factory('MemberBonus', ['Common', 'Ni', function (Common, Ni) {
        function MemberBonus(fromService, fromMaterials, promotion, salaryPercent) {
            this.name = "";
            this.salary = 0;
            this.salaryPercent = salaryPercent || 0;

            this.bonuses = {
                fromService: {
                    percent: fromService.servicePercent || 0,
                    value: 0,
                    prop: fromService
                },
                fromMaterials: {
                    percent: fromMaterials * Ni.prop.deliveryExp.percent || 0,
                    value: 0
                },
                sum: 0
            };
            this.total = 0;

            this.promotion = {
                percent: promotion || 0,
                value: 0
            };
        }

        MemberBonus.prototype.calculate = function (data) {
            var fromMaterials = this.bonuses.fromMaterials,
                percentMaterials = fromMaterials.percent || 0,
                fromService = this.bonuses.fromService,
                percentService = fromService.prop.servicePercent || fromService.percent;

            if (fromService.prop.servicePercent) {
                fromService.percent = fromService.prop.servicePercent;
            }

            this.salary = Common.toFloat(data.workersSum * this.salaryPercent / 100);

            this.promotion.value = Common.toFloat(this.salary * this.promotion.percent / 100);

            this.salaryTotal = this.salary + this.promotion.value;

            fromMaterials.value = Common.toFloat(0.01 * percentMaterials * data.materials.sum || 0);

            fromService.value = Common.toFloat(0.01 * percentService * data.jobs.sum || 0);

            this.bonuses.sum = fromMaterials.value + fromService.value;

            this.total = this.salaryTotal + this.bonuses.sum;
        };

        return MemberBonus;
    }]);

})();
