"use strict";

var app = angular.module('appCalc.jobReportService', ['appCalc.Common', 'appCalc.calculationService']);

app.service('JobReport', function(Common, Calculation){
	var self = this;
	
	angular.merge(this, Calculation);
	
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
	
	this.addJob = function(job) {		
		Calculation.addJob.call(self, job);
		
		this.jobs[this.jobs.length-1].jobReport = true;
	}	
});