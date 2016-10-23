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
	
	this.checkedJobUninsatal = function(event, job) {
		event.stopPropagation();		
		job = angular.copy(job);
		job.name = job.name.replace(/монтаж/i, "Демонтаж");	
		job.name = job.name.replace(/изготовление/i, "Демонтаж");		
		job.name = job.name.replace(/установка/i, "Демонтаж");		
		job.name = job.name.replace(/прокладка/i, "Демонтаж");		
		job.name = job.name.replace(/затягивание/i, "Демонтаж");
		if (job.checkedUnistall) {							
			job.human_hour = 0.4*job.human_hour;
			Calculation.addJob(job);
		} else {
			Calculation.deleteJob(job);
		}		
	}
	
	this.checkedJobInstall = function(event, job) {
		event.stopPropagation();		
		job = angular.copy(job);
		if (job.checkedInstall) {			
			Calculation.addJob(job);
		} else {
			Calculation.deleteJob(job);
		}		
	}
	
	
		
	return this;
});