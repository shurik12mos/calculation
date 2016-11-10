"use strict";

var app = angular.module('appCalc.jobReportService', ['appCalc.Common', 'appCalc.calculationService']);

app.service('JobReport', function(Common, Calculation){
	var self = this;
	
	angular.merge(this, Calculation);
	
	this.workers = [];
	
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
				};
			}
			if (!exist)	Calculation.addJob.call(self, jobCalc);
		});
		
		
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
			salary: []
		};
		
		console.log("newWorker", this.workers);
		
		
		this.workers.push(newWorker);
	};
	
	// description - calculate workers hour, salary before promotion
	// in - void (use this.workers)
	// out - void
	this.workersCalculate = function(){
		
	};
	
	// description - calculate jobReport (use Calculation.calculate and this.workersCalculate)
	// in - void (use this.jobs and this.workers)
	// out - void
	this.calculate = function(){
		Calculation.calculate.call(self);
		
		this.workersCalculate();
	};
});