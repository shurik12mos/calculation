"use strict";

var app = angular.module('appCalc.Common', ['appCalc.niService']);

app.factory('JobConstructor', function(Common, Ni){
	function Job(job) {
		var newJob = {};
		if (!job) {
			job = {
				name: "",
				number: 0,
				amortization: 0,
				human_hour: 0,
				measure: "",
				rank: 1,
				sum: 0
			};
		}
		
		if (Object.prototype.toString.call(job) !== "[object Object]") {
			console.log(job);
			throw new TypeError("haven`t argument job in constructor or bad type of job. Job have to be an 'Object'");
		}
		
		// Копируем собственные свойства объекта job
		for (var key in job) {
			if (!job.hasOwnProperty(key)) continue;
			if (typeof job[key] === "object") {
				angular.copy(job[key], this[key]);
			} else {
				this[key] = job[key];
			}			
		}
		
		// Функция расчета суммы работы
		this.sumJob = function() {
			this.calculate();
			this.number = Common.toFloat(this.number),
			this.price = Common.toFloat(this.price);
						
			this.sum = (this.number*this.price);			
			this.sum = (Number.isFinite(this.sum)&&this.sum>=0)?Common.toFloat(this.sum):"Ошибка";			
		};
		
		// Расчет цены, административных затрат и прочего
		this.calculate = function(){
			var humanHourPrice = Ni.humanHourPrice.value,			
			salaryBrigadier = Ni.prop.salaryBrigadier.percent/100,
			salaryManager = Ni.prop.salaryManager.percent/100,
			salaryProject = Ni.prop.salaryProject.percent/100,
			profit = Ni.prop.profit.percent/100,
			overheadExp = Ni.prop.overheadExp.percent/100,
			adminExp = Ni.prop.adminExp.percent/100,
			promotion = Ni.prop.promotion.percent/100,
			sellExp = Ni.prop.sellExp.percent/100,
			singleTax = Ni.prop.singleTax.percent/100,
			vat = Ni.prop.VAT.percent/100,
			salaryMainWorkers;
			
			this.human_hour = Common.toFloat(this.human_hour, 2);
			this.rank = Common.toFloat(this.rank);
			humanHourPrice = Common.toFloat(humanHourPrice);
			this.amortization = Common.toFloat(this.amortization, 2);
			
			this.salaryMainWorkers = (this.human_hour*this.rank*humanHourPrice);
			this.price = this.salaryMainWorkers;					
			this.price *= (1+salaryBrigadier+salaryManager+salaryProject+profit+overheadExp+adminExp);			
			this.price += this.human_hour*this.amortization;			
			this.price *= (1+promotion);			
			this.price *= (1/(1-sellExp));			
			this.price *= (1/(1-singleTax));			
			this.price *= (1+vat);		
			
			this.price = Common.toFloat(this.price);
						
		};
		
		this.calculate();		
		return this;
	};
	return Job;
});

// сервис общедоступных функций
app.service('Common', function(){
	// функция преобразования к дробному числу. По умолчанию 2 знака после запятой.
	// если не получается преобразовать к числу, то возвращается слово NaN
	this.toFloat = function(element, n) {
		if (!element) element = 0;
		if (!n) n = 2;
		
		element = element.toString().replace(/,/, ".");
		element = Number(element);
		
		if (Number.isFinite(element)) {
			return Math.round(element*Math.pow(10, n))/Math.pow(10, n);
		}else {
			return NaN;
		}
	}
});

