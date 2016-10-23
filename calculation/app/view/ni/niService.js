"use strict";

var app = angular.module('appCalc.niService', []);

app.service('Ni', function(){
	var self = this;	
	
	// Свойства числовых показателей 
	this.prop = {};
	
	// Стоимость часа работы
	this.humanHourPrice = {
		name: "Стоимость часа работы",
		id: 1,
		value: 16,
		defaultValue: 16,
		measure: "грн/ч",
		range: "16-35"
	};
	
	// З/п основных рабочих от чел*час Разряд 1_2_3_4_5
	this.prop.salaryMainWorkers = {
		name: "З/п основных рабочих от чел*час Разряд 1_2_3_4_5",
		id: 2,
		value: 0,
		measure: "грн"		
	};
	
	// З/п в общепроизводственных расходах (бригадир) от чел*час
	this.prop.salaryBrigadier = {
		name: "З/п в общепроизводственных расходах (бригадир) от чел*час",
		id: 3,
		value: 0,
		measure: "грн",
		percent: 17,
		defaultPercent: 17,
		calculate: function(sum){
			this.value = parseFloat((this.percent*sum/100).toFixed(2));
		}
	};
	
	// З/п в общепроизводственных расходах (менеджер) от чел*час
	this.prop.salaryManager = {
		name: "З/п в общепроизводственных расходах (менеджер) от чел*час",
		id: 4,
		value: 0,
		measure: "грн",
		percent: 14,
		defaultPercent: 14,
		calculate: function(sum){
			this.value = parseFloat((this.percent*sum/100).toFixed(2));
		}		
	};
	
	// Проектирование от пп1-2 Кат сложности 1_2_3_4_5	
	this.prop.salaryProject = {
		name: "Проектирование от пп1-2 Кат сложности 1_2_3_4_5",
		id: 5,
		value: 0,
		measure: "грн",
		percent: 30,
		defaultPercent: 30,
		calculate: function(sum){
			this.value = parseFloat((this.percent*sum/100).toFixed(2));
		}	
	};
	
	// Прибыль от пп1
	this.prop.profit = {
		name: "Прибыль от пп1",
		id: 6,
		value: 0,
		measure: "грн",
		percent: 65,
		defaultPercent: 65,
		calculate: function(sum){
			this.value = parseFloat((this.percent*sum/100).toFixed(2));
		}		
	};
	
	//Общепроизводственные расходы от пп1	
	this.prop.overheadExp = {
		name: "Общепроизводственные расходы от пп1",
		id: 7,
		value: 0,
		measure: "грн",
		percent: 30,
		defaultPercent: 30,
		calculate: function(sum){
			this.value = parseFloat((this.percent*sum/100).toFixed(2));
		}		
	};
	
	// Административные, загальні расходы от пп1
	this.prop.adminExp = {
		name: "Административные, загальні расходы от пп1",
		id: 8,
		value: 0,
		measure: "грн",		
		defaultPercent: 60,
		calculate: function(sum){
			this.value = parseFloat((this.percent*sum/100).toFixed(2));
		}	
	};
	
	// Амортизация оборудования
	this.prop.amortizations = {
		name: "Амортизация оборудования",
		id: 9,
		value: 0,
		measure: "грн",
		percent: 0,
		calculate: function(sum, amortization){
			if (!amortization) return;
			this.value = parseFloat(amortization.toFixed(2));
		}		
	};
	
	// Поощрения и Риски
	this.prop.promotion = {
		name: "Поощрения и Риски",
		id: 10,
		value: 0,
		measure: "грн",		
		defaultPercent: 65,
		calculate: function(sum){
			this.value = self.prop.salaryMainWorkers.value + self.prop.salaryBrigadier.value + self.prop.salaryManager.value + self.prop.salaryProject.value;
			this.value += self.prop.profit.value + self.prop.overheadExp.value + self.prop.adminExp.value + self.prop.amortizations.value;
			this.value *= this.percent/100;
			this.value = parseFloat(this.value.toFixed(2));
		}		
	};
	
	// Подоходный налог+военный сбор
	this.prop.incomeTax = {
		name: "Подоходный налог+военный сбор",
		id: 11,
		value: 0,
		measure: "грн",
		percent: 0,
		defaultPercent: 19.5,
		calculate: function(sum){
			this.value = self.prop.salaryMainWorkers.value + self.prop.salaryBrigadier.value + self.prop.salaryManager.value + self.prop.salaryProject.value;
			this.value += self.prop.promotion.value;
			this.value *= (1/(1 - this.percent/100)-1);
			this.value =  parseFloat(this.value.toFixed(2));
		}
	};
	
	// Единый социальный взнос
	this.prop.singleSocialTax = {
		name: "Единый социальный взнос",
		id: 12,
		value: 0,
		measure: "грн",
		percent: 0,
		defaultPercent: 22,
		calculate: function(sum){
			this.value = self.prop.salaryMainWorkers.value + self.prop.salaryBrigadier.value + self.prop.salaryManager.value + self.prop.salaryProject.value;			
			this.value += self.prop.promotion.value + self.prop.incomeTax.value;
			this.value *= this.percent/100;
			this.value =  parseFloat(this.value.toFixed(2));
		}		
	};
	
	// Сбытовые затраты
	this.prop.sellExp = {
		name: "Сбытовые затраты",
		id: 13,
		value: 0,
		measure: "грн",
		percent: 14,
		defaultPercent: 14,
		calculate: function(sum){
			this.value = self.prop.salaryMainWorkers.value + self.prop.salaryBrigadier.value + self.prop.salaryManager.value + self.prop.salaryProject.value;
			this.value += self.prop.profit.value + self.prop.overheadExp.value + self.prop.adminExp.value + self.prop.amortizations.value;
			this.value += self.prop.promotion.value + self.prop.incomeTax.value + self.prop.singleSocialTax.value;
			this.value *= (1/(1 - this.percent/100)-1);
			this.value =  parseFloat(this.value.toFixed(2));
		}		
	};
	
	// Налог единый
	this.prop.singleTax = {
		name: "Налог единый",
		id: 14,
		value: 0,
		measure: "грн",
		percent: 0,
		defaultPercent: 5,
		calculate: function(sum){
			this.value = self.prop.salaryMainWorkers.value + self.prop.salaryBrigadier.value + self.prop.salaryManager.value + self.prop.salaryProject.value;
			this.value += self.prop.profit.value + self.prop.overheadExp.value + self.prop.adminExp.value + self.prop.amortizations.value;
			this.value += self.prop.promotion.value + self.prop.incomeTax.value + self.prop.singleSocialTax.value + self.prop.sellExp.value;
			this.value *= (1/(1 - this.percent/100)-1);
			this.value =  parseFloat(this.value.toFixed(2));
		}		
	};
	
	// Налог НДС
	this.prop.VAT = {
		name: "Налог НДС",
		id: 15,
		value: 0,
		measure: "грн",
		percent: 0,
		defaultPercent: 20,
		calculate: function(sum){
			this.value = self.prop.salaryMainWorkers.value + self.prop.salaryBrigadier.value + self.prop.salaryManager.value + self.prop.salaryProject.value;
			this.value += self.prop.profit.value + self.prop.overheadExp.value + self.prop.adminExp.value + self.prop.amortizations.value;
			this.value += self.prop.promotion.value + self.prop.incomeTax.value + self.prop.singleSocialTax.value + self.prop.sellExp.value;
			this.value += self.prop.singleTax.value;
			this.value *= (1/(1 - this.percent/100)-1);
			this.value =  parseFloat(this.value.toFixed(2));
		}			
	};
	
	// Запас на работы и материалы
	this.prop.reserve = {
		name: "Запас на работы и материалы",
		id: 16,
		value: 0,
		measure: "грн",
		percent: 5,
		defaultPercent: 5		
	};
	
	// Расходы по оформлению и доставке материалов
	this.prop.deliveryExp = {
		name: "Расходы по оформлению и доставке материалов",
		id: 17,
		value: 0,
		measure: "грн",
		percent: 10,
		defaultPercent: 10		
	};
	
	// Скидка по прибыли и административным
	this.prop.discountProfit = {
		name: "Скидка по прибыли и административным",
		id: 18,
		value: 0,
		measure: "грн",
		percent: 0,
		defaultPercent: 0		
	};
	
	// Скидка по поощрениям
	this.prop.discountPromotion = {
		name: "Скидка по поощрениям",
		id: 19,
		value: 0,
		measure: "грн",
		percent: 0,
		defaultPercent: 0		
	};
	
	// Возможная премия по договору
	this.prop.possibleBonus = {
		name: "Возможная премия по договору",
		id: 20,
		value: 0,
		measure: "грн"
	};
	
	// Процент прибыли зависит от "скидки по прибыли и административным". Значение по умолчанию - 65%	
	function getPercentProfit(self) {		
		var profit = self.prop.profit,
		discountProfit = self.prop.discountProfit,
		res;
		
		res = profit.defaultPercent*(100-discountProfit.percent*4)/100;		
		profit.percent = res;
	}
	
	// Процент административныхзатрат зависит от "скидки по прибыли и административным". Значение по умолчанию - 60%	
	function getPercentAdmin(self) {
		var adminExp = self.prop.adminExp,
		discountProfit = self.prop.discountProfit,
		res;
		
		res = adminExp.defaultPercent*(100-discountProfit.percent*2.8)/100;
		adminExp.percent = res;				
	}
	
	// Процент поощрений и рисков зависит от "скидки по прибыли и административным" и "скидки по поощрениям". Значение по умолчанию - 65%	
	function getPercentPromotion(self) {
		var promotion = self.prop.promotion,
		discountProfit = self.prop.discountProfit,
		discountPromotion = self.prop.discountPromotion,
		res;
				
		res = promotion.defaultPercent*(1-discountPromotion.percent/100*2.6)/((1+discountProfit.percent/100*1.2));		
		promotion.percent = res;			
	}
	
	// Процент "Возможная премия по договору"
	function getPercentBonus(self) {
		return 0;
	}
	
	// Функция обновления данных this.prop. Вызывается при изменении данных пользователем.
	this.calc = function(sum, amortization) {
		getPercentProfit(self);
		getPercentAdmin(self);
		getPercentPromotion(self);	
		if (sum) {
			self.prop.salaryMainWorkers.value = sum;
		}
		for (var key in this.prop) {
			if (!this.prop.hasOwnProperty(key)) continue;
			if (!this.prop[key].calculate) continue;
			this.prop[key].calculate(sum, amortization);
		}
	}
	
	/*this.total = function () {
		var total;
		return 0
	}*/
	
	/*this.profit.percent = getPercentProfit(self);
	this.adminExp.percent = getPercentAdmin(self);
	this.promotion.percent = getPercentPromotion(self);
	this.possibleBonus.percent = getPercentBonus(self);	
	*/
	
});