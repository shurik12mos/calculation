"use strict";

var app = angular.module('appCalc.jobReportService', ['appCalc.Common', 'appCalc.calculationService', 'appCalc.niService']);

app.service('JobReport', function(Common, Calculation, Ni){
	var self = this;
	
	angular.merge(this, Calculation);
	
	this.workers = [];
	this.workers.plan = [];
	
	// description - refresh jobs from this.jobs and Calculation.jobs
	// in - this.jobs
	// out - void
	this.refreshJobs = function(jobs){
		if (!jobs || !angular.isArray(jobs)) return;
		
		if (!self.jobs || !angular.isArray(self.jobs)) {
			self.jobs = angular.copy(jobs);
			return;
		};
		
		jobs.forEach(function(jobCalc) {
			var exist = false,
			l = self.jobs.length;
			
			for (var i=0; i<l; i++) {
				
				if (self.jobs[i].jobReport) continue;
				
				if (jobCalc.code === self.jobs[i].code && jobCalc.name === self.jobs[i].name) {
					exist = true;					
					if (!self.jobs[i].changed) self.jobs[i] = angular.copy(jobCalc);					
					self.jobs[i].number_project = jobCalc.number;
					self.jobs[i].number = 0;
				};
			}
			if (!exist)	{
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
	this.addJob = function(job) {		
		Calculation.addJob.call(self, job);
		
		this.jobs[this.jobs.length-1].jobReport = true;
	};
	
	// description - add new worker
	//in - void (create empty)
	// out - void (add new worker in this.workers)
	this.addWorker = function(){
		var newWorker = {
			name: "",
			info: "",
			number: [],
			amortization: [],
			hour: [],
			salary: [],
			fact_hour: []
		};
		
		this.workers.push(newWorker);
	};
	
	// description - refresh number for every job. number is a sum of every worker number of every job
	// in - void ()
	// out - void
	this.refreshNumbersJob = function(jobs, workers) {
		jobs.forEach(function(job, i) {
			var number;
			number = workers.reduce(function(sum, worker) {
				sum += Number(worker.number[i]);
				return sum;
			}, 0);
			job.number = number;
		});		
	}
	
	// description - calculate workers hour, salary before promotion
	// in - void (use this.workers)
	// out - void
	this.workersCalculate = function(){
		function calculateWorker(worker) {
			worker.salary.sum = 0;
			worker.hour.sum = 0;
			worker.number.sum = 0;
			
			worker.number.forEach(function(number, i){
				if (!number) number = 0;
				var job = self.jobs[i];
				worker.salary[i] = Common.toFloat(job.rank*job.human_hour*number*Ni.humanHourPrice.value);
				worker.amortization[i] = Common.toFloat(job.amortization*job.human_hour*number, 2);
				worker.hour[i] = Common.toFloat(job.human_hour*number);
				worker.salary.sum += worker.salary[i];
				worker.hour.sum += worker.hour[i];
			});
			
			//does not work yet. Dont define financeReport yet
			//worker.promotion_client = worker.salary.sum*financeReport.promotion_client
			//worker.promotion_client = Common.toFloat(worker.promotion_client);
			
			worker.salary.sum = Common.toFloat(worker.salary.sum);
			worker.hour.sum = Common.toFloat(worker.hour.sum);
			
			//does not work yet. Dont define worker.promotion_client yet
			//worker.total_first = worker.salary.sum + worker.promotion_client;			
		};		
		
		this.workers.forEach(function(worker) {			
			calculateWorker(worker);			
		});	
		
		//a part where calculate workers plan		
		this.workers.plan.project_hour = 0;
		this.workers.plan.fact_hour = 0;
		this.workers.plan.forEach(function(day, i) {
			//calculate fact hour for a every day in plan
			day.fact_hour = self.workers.reduce(function(sum_hour, val) {
				sum_hour += Common.toFloat(val.fact_hour[i]);
				return sum_hour;
			}, 0);
			
			self.workers.plan.fact_hour += Number(day.fact_hour);
			
			// calculate project_hour
			self.workers.plan.project_hour += day.project_hour*day.project_people;
			
			self.effective_hour = Common.toFloat(self.jobs.human_hour/Calculation.jobs.human_hour*100);
			self.effective_money = Common.toFloat(self.jobs.sum/Calculation.jobs.sum*100);
			
			//calculate fact_hour for every worker
			self.workers.forEach(function(worker) {
				worker.sum_hour = worker.fact_hour.reduce(function(sum, val) {
					return sum += Common.toFloat(val);
				}, 0)
			});
		});
	};
	
	// description - calculate jobReport (use Calculation.calculate and this.workersCalculate)
	// in - void (use this.jobs and this.workers)
	// out - void
	this.calculate = function(){		
		this.refreshNumbersJob(this.jobs, this.workers);
		
		Calculation.calculate.call(self);

		this.workersCalculate();				
	};
	
	//
	this.addDay = function() {
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
		
		if (plan.length >0 && plan[plan.length-1].date) {
			day.date = plan[plan.length-1].date;
			lastDay = day.date.getDate();
			day.date.setDate(lastDay + 1);
		}
		
		this.workers.plan.push(day);
		Common.setIndex(this.workers.plan);
	}
});