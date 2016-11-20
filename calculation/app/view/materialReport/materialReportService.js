"use strict";

var app = angular.module('appCalc.materialReportService', [
'appCalc.Common', 
'appCalc.calculationService', 
'appCalc.niService', 
'appCalc.jobReportService']);

app.service('MaterialReport', function(Ni, Common, MaterialConstructor, Calculation, JobReport){
	var self = this;
	
	angular.merge(this, Calculation);
	
	this.materials = [];
	
	this.refreshMaterials = function(calculation) {
		var self = this,
		current;
		
		if (!calculation || !angular.isArray(calculation.materials)) return;		
		
		calculation.materials.forEach(function (materialCalc) {
			var exist = false;
			if (!angular.isArray(self.materials)) return;
			
			self.materials.forEach(function(material) {
				if (material.id === materialCalc.id) {
					exist = true;
					material.buy_number = materialCalc.number;
				}
			});
			
			if (!exist) {
				self.addMaterial(materialCalc);						
			}			
		});
	};	
	
	this.addMaterial = function(materialCalc) {
		var current,
		sumMaterial;
		
		Calculation.addMaterial.call(this, materialCalc || {});
		
		current = this.materials[this.materials.length-1];
		
		//define buy_number for new material or copy calculation material number of materialCalc
		if (materialCalc) {
			current.buy_number = materialCalc.number;
			current.number = 0;
		}else {
			current.buy_number = 0;
		}	
		
		// make new method sumMaterial, extended
		sumMaterial = current.sumMaterial;
		current.sumMaterial = function() {
			sumMaterial.call(this);
			
			this.sum = Common.toFloat(this.sum);
			this.buy_sum = Common.toFloat(this.buy_number)*Common.toFloat(this.price);
		}
		
		this.calculate();		
	}
	
	this.calculate = function() {
		var materialsList, listLength;
		// list of materials from different source(buy, store brigadier)
		materialsList = ['materials', 'materialsFromStore', 'materialsBuyBrigadier', 'materialsStoreBrigadier'];
		
		// refresh return materials
		for (var i = 0; i < listLength; i++) {			
			this.calculateReturnMaterials(this.otherReturn, this[materialsList[i]]);
		};
		
		this.otherReturn.calculate();
		
		//calculate materials from project(Calculation)
		Calculation.calculate.call(this);
		var materialSum = 0, materialBuySum = 0;
		
		this.materials.sum = 0;
		this.materials.buy_sum = 0;
		this.materials.forEach(function(material, i, arr){
			material.sumMaterial();
			materialSum += material.sum;	
			materialBuySum += material.buy_sum;
		});		
		
		this.materials.sum = Common.toFloat(materialSum);
		this.materials.buy_sum = Common.toFloat(materialBuySum);		
		
		//sum all materials to make a report
		listLength = materialsList.length;
		this.installMaterials = 0;
		this.buyMaterials = 0;
		for (var i = 0; i < listLength; i++) {
			this.installMaterials += this[materialsList[i]].sum;
			this.buyMaterials += this[materialsList[i]].buy_sum;
			
			this.calculateReturnMaterials(this.otherReturn, this[materialsList[i]]);
		};
		
	};
	
	//
	this.calculateReturnMaterials = function(returnArr, source){
		var material, exist, indexExistMaterial, item, existItem;
		if (!angular.isArray(returnArr)) returnArr = [];
		
		if (arguments.length<2) return;
		
		for (var i = 0; i < source.length; i++) {
			exist = false,
			item = source[i];
			
			exist = returnArr.some(function(returnItem, i){
				indexExistMaterial = i;
				return returnItem.id === item.id;
			});
			
			if (exist) {
				if ((item.buy_number - item.number) < 1) {
					returnArr.splice(indexExistMaterial, 1);
					continue;
				}else {
					existItem = returnArr[indexExistMaterial];
					existItem.number = item.buy_number - item.number;
					existItem.name = item.name;
					existItem.measure = item.measure;
					existItem.price = item.price;
					existItem.sumMaterial();
					continue;
				}						
			};
			
			if ((item.buy_number - item.number) > 0) {
				material = {};
				material.number = item.buy_number - item.number;
				material.name = item.name;
				material.measure = item.measure;
				material.price = item.price;
				material.id = item.id;
					
				material = new MaterialConstructor(material);
				
				
				returnArr.push(material);
			}		
		};
		
		Common.setIndex(returnArr);
	};
	
	
});