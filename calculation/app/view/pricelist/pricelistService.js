'use strict';

var app = angular.module('appCalc.pricelistService', ['ngResource', 'ngRoute', 'appCalc.googleSheet', 'appCalc.calculationService']);

app.service('Pricelist', function($resource, GetGoogleSheet, Calculation){	
	var pricelist;
	
	this.init = function(data) {		
		if (!this.pricelist) {
			pricelist = data;
			this.pricelist = data;
		}		
	};
	
	this.checkedCategory = function(event, elem) {		
		console.log("event", event, ' elem ', elem);
		event.preventDefault();
		event.stopImmediatePropagation();
		this.pricelist.forEach(function(e){
			if (e.code === elem.code) {
				e.checked = !e.checked;
				e.forEach(function(e){
					e.checked = false;
				});
			}else {
				e.checked = false;
			}			
		});		
	}
	
	this.checkedSection = function(event, elem, category) {
		event.preventDefault();
		event.stopImmediatePropagation();
		category.forEach(function(e){
			if (e.code === elem.code) {
				e.checked = !e.checked;
			}else {
				e.checked = false;
			}			
		});		
	}
	
	this.checkedJobUninstal = function(event, job) {
		event.stopPropagation();		
		job = angular.copy(job);
		job.name = job.name.replace(/монтаж/i, "Демонтаж");	
		job.name = job.name.replace(/изготовление/i, "Демонтаж");		
		job.name = job.name.replace(/установка/i, "Демонтаж");		
		job.name = job.name.replace(/прокладка/i, "Демонтаж");		
		job.name = job.name.replace(/затягивание/i, "Демонтаж");
		if (job.checkedUninstall) {							
			job.human_hour = 0.4*job.human_hour;
			// делается для того, чтобы было понятно, что работа типа Uninstall. см. this.unChecked
			delete job.checkedInstall;
			Calculation.addJob(job);
		} else {
			Calculation.deleteJob(job);
		}		
	}
	
	this.checkedJobInstall = function(event, job) {
		event.stopPropagation();		
		job = angular.copy(job);
		if (job.checkedInstall) {
			// делается для того, чтобы было понятно, что работа типа Install. см. this.unChecked
			delete job.checkedUnistall;
			Calculation.addJob(job);
		} else {
			Calculation.deleteJob(job);
		}		
	}
	
	// снятие флажка checkbox с работы, которая удалена в Calculation
	this.unChecked = function(){
		var  jobs, self = this, allJobs = [];
		
		jobs = Calculation.jobs;
		console.log('step1', jobs);
		
		this.pricelist.forEach(function(category) {
			category.forEach(function(section) {
				section.forEach(function(job) {
					allJobs.push(job);
					
					job.checkedInstall = false;
					job.checkedUninstall = false;
					
					jobs.forEach(function(jobCalculation) {
						if (jobCalculation.code === job.code) {
							if (jobCalculation.checkedInstall) {
								job.checkedInstall = true;								
							} else if (jobCalculation.checkedUninstall) {
								jobFind.checkedUninstall = true;
							}
						}
					});
				});
			});
		});
		
		console.log('step2', allJobs);
		
		/*jobs.forEach(function(job) {
			
		});
		
		jobs.forEach(checkJobInCalculation);
		
		function checkJobInCalculation(job) {
			var arrCode, categoryNumber, sectionNumber, category, section, jobFind, code;
			console.log('step1', job);
			code = job.code;
				
			if (!code) return false;
			
			try {
				arrCode = code.split(".");
				categoryNumber = arrCode[0];
				sectionNumber = arrCode[0] + "." + arrCode[1];
			}catch (err){
				return false;
			}		
			
			category = self.pricelist.find(function(category) {
				if (category.code === categoryNumber) return true;
				return false;
			});
			
			if (!category) return false;
			
			section = category.find(function(section){
				if (section.code === sectionNumber) return true;
			});
			
			if (!section) return false;
			
			jobFind = section.find(function(job) {
				if (job.code === categoryNumber) return true;
			});
			
			if (!jobFind) return false;
			
			if (job.checkedInstall) {
				jobFind.checkedInstall = false;
			} else if (job.checkedUninstall) {
				jobFind.checkedUninstall = false;
			}
		}					
	}*/
		
		return this;
	}
});