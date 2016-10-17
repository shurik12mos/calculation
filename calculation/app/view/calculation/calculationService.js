"use strickt";

var app = angular.module('appCalc.calculationService', []);

app.service('Calculation', function(){
	
	function toFloat(element, n) {
		if (!element) element = 0;
		if (!n) n = 2;
		
		element = element.toString().replace(/,/, ".");
		element = Number(element);
		if (Number.isFinite(element)) {
			return Number.parseInt(element*100)/100;
		}else {
			return NaN;
		}
	}
	
	function setIndex(arr) {
		arr.forEach(function(e, i, a) {
			console.log("setIndex", e, i);
			e.index = i+1;
		});
	}
	
	this.jobs = [{
		index: 1
	}];
	this.materials = [{}];
	
	this.keyup = function(event) {
		if (event.keyCode !== 13) {
			return;
		}
		
		event.target.blur();		
	}
	
	this.addJob = function(job){
		console.log("1", job);
		var length = this.jobs.length;
		
		if (!job) {
			job = {};
		}		
		
		this.sumJob(job);		
		this.jobs.splice(length-1,0,job); 
		setIndex(this.jobs);
	};
	
	this.deleteJob = function(job){
		this.jobs = this.jobs.filter(function(elem) {
			console.log("deleteJob job", job, "elem", elem);
			if (elem.code === job.code && elem.name === job.name) {
				return false;
			}
			return true;
		});
	};
	
	this.sumJob = function(job) {
		job.number = toFloat(job.number),
		job.price = toFloat(job.price);
		
		console.log("sumJob", job);
		job.sum = (job.number*job.price);
		job.sum = (Number.isFinite(job.sum)&&job.sum>=0)?job.sum.toFixed(2):"Ошибка";
	};
});