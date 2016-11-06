"use strict";

var app = angular.module('appCalc.calculationService', ['appCalc.Common', 'appCalc.niService']);

app.service('Calculation', function(JobConstructor, Ni, Common, MaterialConstructor){
	
	function setIndex(arr) {
		arr.forEach(function(e, i, a) {			
			e.index = i+1;
		});
	}
	
	this.jobs = [];
	this.materials = [];
	
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
			if (elem.index === job.index) {
				return false;
			}
			return true;
		});
		
		setIndex(this.jobs);
		
		// считаем смету
		this.calculate();
	};
	
	// Добавление материала
	this.addMaterial = function(){	
		var material = new MaterialConstructor();
		// добавляем в список материалов
		this.materials.push(material);
		// устанавливаем индекс
		setIndex(this.materials);
		// считаем сумму
		this.calculate();
	};
	
	this.deleteMaterial = function(material) {
		this.materials.splice(material.index-1, 1);
		setIndex(this.materials);
	};
	
	// Калькуляция работ и материалов.
	this.calculate = function() {
		var total = 0,totalhh = 0, totalam = 0,
			sumSalary = 0,reserve, sum,
			niReserve = Ni.prop.reserve.percent/100,
			niDelivery = Ni.prop.deliveryExp.percent/100,
			materialSum = 0;
		
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
		
		Ni.calc(sumSalary, totalam, total);
		
		// считаем материалы
		this.materials.sum = 0;
		this.materials.forEach(function(material, i, arr){
			materialSum += material.sumMaterial();			
		});
				
		this.materials.sum = materialSum;
		//Запас на материалы
		this.materials.reserve = Common.toFloat(this.materials.sum*niReserve);
		// Расходы по доставке и оформлению материалов
		this.materials.delivery = Common.toFloat((this.materials.sum + this.materials.reserve)*niDelivery);
		this.materials.sum = Common.toFloat(this.materials.sum + this.materials.reserve + this.materials.delivery);					
	}
		
});