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
			
			this.salaryMainWorkers = (this.human_hour*this.rank*humanHourPrice);
			this.price = this.salaryMainWorkers;					
			this.price *= (1+salaryBrigadier+salaryManager+salaryProject+profit+overheadExp+adminExp);			
			this.price += this.human_hour*this.amortization;			
			this.price *= (1+promotion);			
			this.price *= (1/(1-sellExp));			
			this.price *= (1/(1-singleTax));			
			this.price *= (1+vat);		
			
			this.price = Common.toFloat(this.price);
			
			this.human_hour = Common.toFloat(this.human_hour, 2);
			this.rank = Common.toFloat(this.rank);
			humanHourPrice = Common.toFloat(humanHourPrice);
			this.amortization = Common.toFloat(this.amortization, 2);
						
		};
		
		this.calculate();		
		return this;
	};
	return Job;
});

app.factory('MaterialConstructor', function(Common, Ni){
	function Material() {
		this.name = "";
		this.measure = "";
		this.number = 0;
		this.price = 0;
				
		// Функция расчета суммы стоимости материала
		this.sumMaterial = function() {
			this.number = Common.toFloat(this.number),
			this.price = Common.toFloat(this.price);
						
			this.sum = (this.number*this.price);			
			this.sum = (Number.isFinite(this.sum)&&this.sum>=0)?Common.toFloat(this.sum):"Ошибка";	
			return this.sum;
		};	
			
		return this;
	};
	return Material;
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
	};
	
	// глубокое копирование массива или объекта. включая свойства у массива.
	this.deepCopy = function(source) {
		var target;
		if (!angular.isArray(source) || !angular.isObject(source)) return source;
		
		if (!target) {
			if (Object.prototype.toString.call(source) === "[object Object]") target = {};
			if (angular.isArray(source)) target = [];			
		}
		
		
		for (var key in source) {
			if (angular.isArray(source[key]) || angular.isObject(source[key])) {
				target[key] = this.deepCopy(source[key]);
			}else {
				target[key] = source[key];
			}
		}
		
		return target;
	};
	
	// убирание фокуса с ячейки при нажатии Enter
	this.endEnter = function(event) {
		if (event.keyCode !== 13) {
			return;
		}
		event.target.blur();		
	}
	
});

