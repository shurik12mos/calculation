"use strict";

var app = angular.module('appCalc.jobReportService', ['appCalc.Common',
    'appCalc.calculationService',
    'appCalc.niService',
    'appCalc.members'
]);

app.factory('JobReport', function (Common, Calculation, Ni, Members) {
    function JobReport(Common, Calculation, Ni) {
        var self = this;

        this.workers = Members.workers;
        this.workers.plan = Members.workers.plan;
        this.jobs = [];
        this.niReserve = 0;

        // description - refresh jobs from this.jobs and Calculation.jobs
        // in - this.jobs
        // out - void
        this.refreshJobs = function (jobs) {
            if (!jobs || !angular.isArray(jobs)) {
                return;
            }

            if (!self.jobs || !angular.isArray(self.jobs)) {
                self.jobs = angular.copy(jobs);
                return;
            }

            jobs.forEach(function (jobCalc) {
                var exist = false,
                    l = self.jobs.length,
                    i;

                for (i = 0; i < l; i++) {
                    if (self.jobs[i].jobReport) {
                        continue;
                    }

                    if (jobCalc.code === self.jobs[i].code && jobCalc.name === self.jobs[i].name) {
                        exist = true;
                        if (!self.jobs[i].changed) {
                            self.jobs[i] = angular.copy(jobCalc);
                        }
                        self.jobs[i].number_project = jobCalc.number;
                        self.jobs[i].number = 0;
                    }
                }
                if (!exist) {
                    Calculation.addJob.call(self, jobCalc);
                    self.jobs[i].number_project = jobCalc.number;
                    self.jobs[i].number = 0;
                }
            });

            this.refreshNumbersJob(this.jobs, this.workers);
        };

        // description - add empty job to a table-jobs
        // in - job from search job or empty(then create empty job)
        // out - void
        this.addJob = function (job) {
            Calculation.addJob.call(this, job);
            //this.workers.forEach(function (worker) {
            //    worker.addJob(job);
            //  });

            this.jobs[this.jobs.length - 1].jobReport = true;
        };


        this.deleteJob = function (job) {
            Calculation.deleteJob.call(this, job);
            this.calculate;

            this.workers.forEach(function (worker) {
                worker.deleteJob(job);
            });
        };


        // description - refresh number for every job. number is a sum of every worker number of every job
        // in - void ()
        // out - void
        this.refreshNumbersJob = function (jobs, workers) {
            jobs.forEach(function (job, i) {
                var number;
                number = workers.reduce(function (sum, worker) {
                    sum += Number(worker.number[i]);
                    return sum;
                }, 0);
                job.number = number;
            });
        };

        // description - calculate workers hour, salary before promotion
        // in - void (use this.workers)
        // out - void
        this.workersCalculate = function () {
            var self = this;

            //a part where calculate workers plan
            this.workers.plan.project_hour = 0;
            this.workers.plan.fact_hour = 0;
            this.workers.plan.forEach(function (day, i) {
                //calculate fact hour for a every day in plan
                day.fact_hour = self.workers.reduce(function (sum_hour, val) {
                    sum_hour += Common.toFloat(val.fact_hour[i]);
                    return sum_hour;
                }, 0);

                self.workers.plan.fact_hour += Number(day.fact_hour);

                // calculate project_hour
                self.workers.plan.project_hour += day.project_hour * day.project_people;

                self.effective_hour = Common.toFloat(self.jobs.human_hour / Calculation.jobs.human_hour * 100);
                self.effective_money = Common.toFloat(self.jobs.sum / Calculation.jobs.sum * 100);

                //calculate fact_hour for every worker
                self.workers.forEach(function (worker) {
                    worker.sum_hour = worker.fact_hour.reduce(function (sum, val) {
                        return sum += Common.toFloat(val);
                    }, 0)
                });
            });
        };

        // description - calculate jobReport (use Calculation.calculate and this.workersCalculate)
        // in - void (use this.jobs and this.workers)
        // out - void
        this.calculate = function () {
            this.refreshNumbersJob(this.jobs, this.workers);

            Calculation.calculate.call(this);

            Members.calculate(Calculation);
            this.workersCalculate();

        };

        //
        this.addDay = Members.addDay();
    }

    JobReport.prototype = Object.create(Object.getPrototypeOf(Calculation));
    JobReport.prototype.constructor = JobReport;

    return new JobReport(Common, Calculation, Ni);
});
