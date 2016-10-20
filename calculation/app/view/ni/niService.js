"use strict";

var app = angular.module('appCalc.niService', []);

app.service('Ni', function(){
	// Стоимость часа работы
	this.humanHourPrice = {
		value: 16,
		defaultValue: 16,
		measure: "грн/ч",
		range: "16-35"
	};
	
	// З/п основных рабочих от чел*час Разряд 1_2_3_4_5
	this.salaryMainWorkers = {
		value: 0,
		measure: "грн"
	};
	
	// З/п в общепроизводственных расходах (бригадир) от чел*час
	this.salaryBrigadier = {
		value: 0,
		measure: "грн",
		percent: 17,
		defaultPercent: 17
	};
	
	// З/п в общепроизводственных расходах (менеджер) от чел*час
	this.salaryManager = {
		value: 0,
		measure: "грн",
		percent: 14,
		defaultPercent: 14		
	};
	
	// Проектирование от пп1-2 Кат сложности 1_2_3_4_5	
	this.salaryProject = {
		value: 0,
		measure: "грн",
		percent: 30,
		defaultPercent: 30	
	};
	
	// Прибыль от пп1
	this.profit = {
		value: 0,
		measure: "грн",
		percent: getPercentProfit(),
		defaultPercent: 65		
	};
	
	//Общепроизводственные расходы от пп1	
	this.overheadExp = {
		value: 0,
		measure: "грн",
		percent: 30,
		defaultPercent: 30		
	};
	
	// Административные, загальні расходы от пп1
	this.adminExp = {
		value: 0,
		measure: "грн",
		percent: getPercentAdmin(),
		defaultPercent: 60	
	};
	
	// Амортизация оборудования
	this.amortizations = {
		value: 0,
		measure: "грн",
		percent: 0		
	};
	
	// Поощрения и Риски
	this.promotion = {
		value: 0,
		measure: "грн",
		percent: getPercentPromotion(),
		defaultPercent: 65	
	};
	
	// Подоходный налог+военный сбор
	this.incomeTax = {
		value: 0,
		measure: "грн",
		percent: 0,
		defaultPercent: 19.5		
	};
	
	// Единый социальный взнос
	this.singleSocialTax = {
		value: 0,
		measure: "грн",
		percent: 0,
		defaultPercent: 22		
	};
	
	// Сбытовые затраты
	this.sellExp = {
		value: 0,
		measure: "грн",
		percent: 15,
		defaultPercent: 15		
	};
	
	// Налог единый
	this.singleTax = {
		value: 0,
		measure: "грн",
		percent: 0,
		defaultPercent: 5		
	};
	
	// Налог НДС
	this.VAT = {
		value: 0,
		measure: "грн",
		percent: 0,
		defaultPercent: 20		
	};
	
	// Запас на работы и материалы
	this.reserve = {
		value: 0,
		measure: "грн",
		percent: 5,
		defaultPercent: 5		
	};
	
	// Расходы по оформлению и доставке материалов
	this.deliveryExp = {
		value: 0,
		measure: "грн",
		percent: 10,
		defaultPercent: 10		
	};
	
	// Скидка по прибыли и административным
	this.discountProfit = {
		value: 0,
		measure: "грн",
		percent: 0,
		defaultPercent: 0		
	};
	
	// Скидка по поощрениям
	this.discountPromotion = {
		value: 0,
		measure: "грн",
		percent: 0,
		defaultPercent: 0		
	};
	
	// Возможная премия по договору
	this.possibleBonus = {
		value: 0,
		measure: "грн",
		percent: getPercentBonus()
	};
	
	this.total = function () {
		var total;
		return 0
	}
	
	// Процент прибыли зависит от "скидки по прибыли и административным". Значение по умолчанию - 65%	
	function getPercentProfit() {
		var res = this.profit.defaultPercent*(1-this.discountProfit.percent*4)/100;
		return res;
	}
	
	// Процент административныхзатрат зависит от "скидки по прибыли и административным". Значение по умолчанию - 60%	
	function getPercentAdmin() {
		var res = this.adminExp.defaultPercent*(1-this.discountProfit.percent*2.8)/100;
		return res;
	}
	
	// Процент поощрений и рисков зависит от "скидки по прибыли и административным" и "скидки по поощрениям". Значение по умолчанию - 65%	
	function getPercentPromotion() {
		var res = this.promotion.defaultPercent*(1-this.discountPromotion.percent*2.6)*((1+this.discountProfit.percent*1.2))/100;
		return res;
	}
});