"use strict";

var app = angular.module('appCalc.calculationService', ['appCalc.Common', 'appCalc.niService']);

app.factory('Calculation', function(JobConstructor, Ni, Common, MaterialConstructor){
	function Calculation(JobConstructor, Ni, Common, MaterialConstructor) {
		this.calculateNi = Ni.calc;
	
		function setIndex(arr) {
			arr.forEach(function(e, i, a) {			
				e.index = i+1;
			});
		}
		
		this.jobs = [];
		this.materials = [];
		
		this.jobs.salaryMainWorkers = 0;
		this.jobs.amortizations = 0;
		this.jobs.total = 0;
		this.jobs.totalhh = 0;
		
		this.jobs.reserve = 0;
		this.jobs.sum = 0;	
		this.jobs.human_hour = 0;	
	};
	
	// добавление работы
		Calculation.prototype.addJob = function(job){
			
			// создаем новую работу		
			job = new JobConstructor(job);			
			
			// определяем сумму
			job.sumJob();		
			// добавляем в список работ
			this.jobs.push(job);
			// устанавливаем индекс
			Common.setIndex(this.jobs);
			// считаем сумму работ
			this.calculate();
		};
		
		// удаление работы
		Calculation.prototype.deleteJob = function(job){
			this.jobs = this.jobs.filter(function(elem) {			
				if (elem.index === job.index) {
					return false;
				}
				return true;
			});
			
			Common.setIndex(this.jobs);
			
			// считаем смету
			this.calculate();
		};
		
		// Добавление материала
		Calculation.prototype.addMaterial = function(material){
			material = new MaterialConstructor(material);
					
			// добавляем в список материалов
			this.materials.push(material);
			// устанавливаем индекс
			Common.setIndex(this.materials);
			// считаем сумму
			this.calculate();
		};
		
		this.deleteMaterial = function(material) {
			this.materials.splice(material.index-1, 1);
			Common.setIndex(this.materials);
		};
		
		// Калькуляция работ и материалов.
		Calculation.prototype.calculate = function() {
			var total = 0,totalhh = 0, totalam = 0,
				sumSalary = 0,reserve, sum,
				niReserve = Ni.prop.reserve.percent/100,
				niDelivery = Ni.prop.deliveryExp.percent/100,
				materialSum = 0;
			
			// считаем сумму всех работ
			if (this.hasOwnProperty('jobs')) {
				this.jobs.forEach(function(element){
					element.sumJob();
					total += element.sum;
					totalhh += element.human_hour*element.number;
					totalam += element.amortization*element.number*element.human_hour;
					sumSalary += element.salaryMainWorkers*element.number;
				});
				
				sumSalary = Common.toFloat(sumSalary);
				reserve = Common.toFloat(total*niReserve);
				sum = Common.toFloat(total+reserve);
				this.jobs.salaryMainWorkers = sumSalary;
				this.jobs.amortizations = totalam;
				this.jobs.total = Common.toFloat(total);
				this.jobs.totalhh = Common.toFloat(totalhh);
				
				this.jobs.reserve = reserve;
				this.jobs.sum = sum;	
				this.jobs.human_hour = totalhh;	
				
				if (this.hasOwnProperty('calculateNi')) {
					this.calculateNi(sumSalary, totalam, total);
				}
			}		
			
			// считаем материалы
			if (this.hasOwnProperty('materials')) {
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
		};
		
		return new Calculation(JobConstructor, Ni, Common, MaterialConstructor);
	
	
		
});