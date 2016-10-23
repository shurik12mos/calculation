"use strict";

var app = angular.module('appCalc.calculationService', ['appCalc.Common', 'appCalc.niService']);

app.service('Calculation', function(JobConstructor, Ni, Common){
	
	function setIndex(arr) {
		arr.forEach(function(e, i, a) {			
			e.index = i+1;
		});
	}
	
	this.jobs = [];
	this.materials = [];
	
	// убирание фокуса с ячейки при нажатии Enter
	this.keyup = function(event) {
		if (event.keyCode !== 13) {
			return;
		}
		
		event.target.blur();		
	}
	
	// добавление работы
	this.addJob = function(job){
		
		// создаем новую работу		
		job = new JobConstructor(job);	
		// определяем сумму
		job.sumJob();		
		// добавляем в список работ
		this.jobs.push(job);
		// устанавливаем индекс
		setIndex(this.jobs);
		// считаем сумму работ
		this.calculate();
	};
	
	// удаление работы
	this.deleteJob = function(job){
		this.jobs = this.jobs.filter(function(elem) {
			console.log("deleteJob job", job, "elem", elem);
			if (elem.code === job.code && elem.name === job.name) {
				return false;
			}
			return true;
		});
		this.calculate();
	};
	
	this.calculate = function() {
		var total = 0,totalhh = 0, totalam = 0,
			sumSalary = 0,reserve, sum,
			niReserve = Ni.prop.reserve.percent/100;
		
		// считаем сумму всех работ
		this.jobs.forEach(function(element){
			element.sumJob();
			total += element.sum;
			totalhh += element.human_hour*element.number;
			totalam += element.amortization*element.number;
			sumSalary += element.salaryMainWorkers*element.number;
		});
		
		sumSalary = Common.toFloat(sumSalary);
		reserve = Common.toFloat(total*niReserve);
		sum = Common.toFloat(total+reserve);
		this.jobs.reserve = reserve;
		this.jobs.sum = sum;	
		this.jobs.human_hour = Common.toFloat(totalhh);	
		
		Ni.calc(sumSalary, totalam);
	}
		
});