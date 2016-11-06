'use strict';

var app = angular.module('appCalc.pricelistService', ['ngResource', 'ngRoute', 'appCalc.googleSheet', 'appCalc.calculationService', 'appCalc.Common']);

app.service('Pricelist', function($resource, $q, GetGoogleSheet, Calculation, Common){	
	var cleanPricelist,
	self = this;
	
	this.loadPrice = $q.defer();
	console.log("this.loadPrice", this.loadPrice);
	
	this.init = function() {
		var price, load = false;
		
		if (!this.pricelist) {		
			price = GetGoogleSheet.get(function(success){
				cleanPricelist = Common.deepCopy(success.price);
				self.pricelist = Common.deepCopy(success.price);
				self.unChecked();
				
				load = true;
				self.loadPrice.resolve();
			}, function(error){
				console.log('error', error);
				self.loadPrice.reject();
			});
		}
		
		return load;
	}
	
	
	/*this.init = function(data) {		
		if (!this.pricelist) {
			cleanPricelist = Common.deepCopy(data);
			this.pricelist = Common.deepCopy(data);
			console.log("this.pricelist", this.pricelist);
		}		
	};*/
	
	this.getPrice = function(){
		return cleanPricelist;
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
	};
	
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
	
	this.checkedJobUninstal = function(event, job, target) {
		var find, replaced = false
		event.stopPropagation();		
		job = angular.copy(job);
		
		// массив регулярных выражений для замены
		find = [/монтаж/i, /изготовление/i, /установка/i, /прокладка/i, /затягивание/i];
		
		// меняем любое из совпавших значений в массиве find на "Демонтаж" и устанавливаем флаг replaced в true
		find.forEach(function(item){
			if (job.name.search(item) !== -1) {
				job.name = job.name.replace(item, "Демонтаж");
				replaced = true;
			};
		});
		
		// если не было ни одного совпадени я с регулярными выражениями, то добавляем к имени "Демонтаж"
		if (!replaced) job.name = "Демонтаж " + job.name;
		
		
		if (job.checkedUninstall) {							
			job.human_hour = 0.4*job.human_hour;
			// делается для того, чтобы было понятно, что работа типа Uninstall. см. this.unChecked
			delete job.checkedInstall;
			target.addJob(job);
		} else {
			target.deleteJob(job);
		}		
	}
	
	this.checkedJobInstall = function(event, job, target) {
		event.stopPropagation();		
		job = angular.copy(job);
		if (job.checkedInstall) {
			// делается для того, чтобы было понятно, что работа типа Install. см. this.unChecked
			delete job.checkedUnistall;
			target.addJob(job);
		} else {
			target.deleteJob(job);
		}		
	}
	
	// снятие флажка checkbox с работы, которая удалена в Calculation
	this.unChecked = function(){
		var  jobs, self = this, allJobs = [];
		
		jobs = Calculation.jobs;
				
		this.pricelist.forEach(function(category) {
			category.forEach(function(section) {
				section.forEach(function(job) {
					if (!job) return;
					allJobs.push(job);
					
					job.checkedInstall = false;
					job.checkedUninstall = false;
					
					jobs.forEach(function(jobCalculation) {
						if (jobCalculation.code === job.code) {
							if (jobCalculation.checkedInstall) {
								job.checkedInstall = true;								
							} else if (jobCalculation.checkedUninstall) {
								job.checkedUninstall = true;
							}
						}
					});
				});
			});
		});
		
		this.allJobs = allJobs;
		console.log("this.allJobs", this);
		
		return this;
	}
});