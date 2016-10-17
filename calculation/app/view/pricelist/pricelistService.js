'use strict';

var app = angular.module('appCalc.pricelistService', ['ngResource', 'ngRoute', 'appCalc.googleSheet', 'appCalc.calculationService']);

app.service('Pricelist', function($resource, GetGoogleSheet, Calculation){
	console.log("start Pricelist", GetGoogleSheet);
	var pricelist;
	
	this.init = function(data) {
		console.log("this in init", this);
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
	
	this.checkedJobUninsatal = function(event, job) {
		event.stopPropagation();
		console.log("job name before", job, job.checkedUnistall);
		job = angular.copy(job);
		job.name = job.name.replace(/монтаж/i, "Демонтаж");	
		job.name = job.name.replace(/изготовление/i, "Демонтаж");		
		job.name = job.name.replace(/установка/i, "Демонтаж");		
		job.name = job.name.replace(/прокладка/i, "Демонтаж");		
		job.name = job.name.replace(/затягивание/i, "Демонтаж");
		if (job.checkedUnistall) {							
			console.log("job name after", job);
			Calculation.addJob(job);
		} else {
			Calculation.deleteJob(job);
		}		
	}
	
	this.checkedJobInstall = function(event, job) {
		event.stopPropagation();
		console.log("job name before", job);
		job = angular.copy(job);
		if (job.checkedInstall) {
			console.log("checkedIstall");
			Calculation.addJob(job);
		} else {
			Calculation.deleteJob(job);
		}		
	}
	
	
		
	return this;
});