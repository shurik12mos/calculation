"use strict";

var app = angular.module('appCalc.materialReportService', ['appCalc.Common', 'appCalc.calculationService', 'appCalc.niService']);

app.service('MaterialReport', function(Ni, Common, MaterialConstructor, Calculation){
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
	}
});