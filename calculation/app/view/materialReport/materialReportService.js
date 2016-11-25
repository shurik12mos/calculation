"use strict";

var app = angular.module('appCalc.materialReportService', [
'appCalc.Common', 
'appCalc.calculationService', 
'appCalc.niService', 
'appCalc.jobReportService']);

app.service('MaterialReport', function(Ni, Common, MaterialConstructor, Calculation, JobReport){
	var self = this,
	// list of materials from different source(buy, store brigadier)
	materialsList = ['materials', 'materialsFromStore', 'materialsBuyBrigadier', 'materialsStoreBrigadier'],
	expensesList = [];
	
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
		var listLength;
		
		listLength = materialsList.length;		
				
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
		this.installMaterials = 0;
		this.buyMaterials = 0;
		for (var i = 0; i < listLength; i++) {
			this.installMaterials += this[materialsList[i]].sum;
			this.buyMaterials += this[materialsList[i]].buy_sum;			
		};
		
		this.calculateReturnMaterials();
	};
	
	//
	this.calculateReturnMaterials = function(){
		var material, exist, indexExistMaterial, item, existItem,
		returnArr = this.otherReturn;
		
		function checkOne (source){
			// add or refresh materials from materialsList(from this.calculate)
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
		};		
		
		//if (!angular.isArray(returnArr)) returnArr = [];
				
		for (var j = 0; j < materialsList.length; j++) {
			checkOne(this[materialsList[j]]);
		};
		
		returnArr.calculate();
		Common.setIndex(returnArr);
	};	
	
	this.checkDeletedInReturn = function (material) {
		self.otherReturn.forEach(function(item, i, arr){
			if (item.id === material.id) {
				arr.splice(i,1);
			};
		});
	};
	
	this.mainFactors = function() {
		var listLength;
		
		listLength = expensesList.length;	
		
		for (var i = 0; i < listLength; i++) {
			this[expensesList[i]].calculate();		
		};
		
		this.otherReturn.calculate();
		
		//
		//
		//
		//
		//
	};
});


app.directive('materialReportTable', ['Common', 'MaterialConstructor', function(Common, MaterialConstructor) {	
	return  {
		restrict: 'E',
		scope: {
			source: "=source",
			service: "=service",
			name: "@tableName"
		},
		templateUrl: 'view/materialReport/directives/materialReportTable/materialReportTable.html',		
		link: function(scope, element, attrs, ctrl) {			
			scope.common = Common;			
			scope.materialConstructor = MaterialConstructor;
			if (!scope.source) scope.source = [];
			
			//add material to "source"
			scope.addMaterial = function(material){
				
				material = new scope.materialConstructor(material);
				
				// define extended method sumMaterial and calculate
				material.sumMaterial = function() {
					this.number = Common.toFloat(this.number);
					this.buy_number = Common.toFloat(this.buy_number);
					this.price = Common.toFloat(this.price);
					
					//balance between buy number and actually installing
					this.balance_number = this.buy_number - this.number;
								
					this.sum = Common.toFloat(this.number*this.price);						
					
					this.buy_sum = Common.toFloat(this.buy_number*this.price);			
										
					return this;					
				}
				
				scope.source.push(material);
				scope.common.setIndex(scope.source);				
				
				scope.calculate();				
			};
			
			//delete material from "source" and calculate
			scope.deleteMaterial = function(material){
				if (!material) return;
				
				scope.source = scope.source.filter(function(item){
					if (item.id === material.id) return false;
					return true;
				});
				
				scope.common.setIndex(scope.source);				
				scope.calculate();
				scope.service.checkDeletedInReturn(material);
			};
			
			//calculate table
			scope.calculate = function(){
				var materialSum = 0, materialBuySum = 0,
				source = scope.source;
		
				source.sum = 0;
				source.buy_sum = 0;
				source.forEach(function(material, i, arr){
					// check that install number < buy number
					if (material.number > material.buy_number) {
						material.valid = false;
					}else {
						material.valid = true;
					}
					
					material.sumMaterial();
					materialSum += material.sum;	
					materialBuySum += material.buy_sum;
				});
							
				source.sum = Common.toFloat(materialSum);
				source.buy_sum = Common.toFloat(materialBuySum);	
				
				scope.service.calculate();
			};
			
		}
	};
}]);

app.directive('expensesReportTable', ['Common', 'MaterialConstructor', function(Common, MaterialConstructor) {	
	return  {
		restrict: 'E',
		scope: {
			source: "=source",
			service: "=service",
			name: "@tableName"
		},
		templateUrl: 'view/materialReport/directives/expensesReportTable/expensesReportTable.html',		
		link: function(scope, element, attrs, ctrl) {			
			scope.common = Common;			
			scope.materialConstructor = MaterialConstructor;
			if (!scope.source) {
				scope.source = [];
				scope.source.sum = 0;
			}
			
			//add material to "source"
			scope.source.addMaterial = scope.addMaterial = function(material){
				
				material = new scope.materialConstructor(material);
				material.owner = "";
				
				scope.source.push(material);
				scope.common.setIndex(scope.source);				
				
				scope.calculate();				
			};
			
			//delete material from "source" and calculate
			scope.deleteMaterial = function(material){
				if (!material) return;
				
				scope.source = scope.source.filter(function(item){
					if (item.id === material.id) return false;
					return true;
				});
				
				scope.common.setIndex(scope.source);				
			};
			
			//calculate table
			scope.source.calculate = scope.calculate = function(){
				var materialSum = 0,
				source = scope.source;
		
				source.sum = 0;				
				source.forEach(function(material, i, arr){
					material.sumMaterial();
					materialSum += material.sum;						
				});
							
				source.sum = Common.toFloat(materialSum);	

				//тут должна быть функция для расчета основных показателей material report
			};			
		}
	};
}]);
	
app.directive('returnMaterialsTable', ['Common', 'MaterialConstructor', function(Common, MaterialConstructor) {	
	return  {
		restrict: 'E',
		scope: {
			source: "=source",
			service: "=service",
			name: "@tableName"
		},
		templateUrl: 'view/materialReport/directives/returnMaterialsTable/returnMaterialsTable.html',		
		link: function(scope, element, attrs, ctrl) {			
			scope.common = Common;			
			scope.materialConstructor = MaterialConstructor;
			if (!scope.source) scope.source = [];
			
			//add material to "source"
			/*scope.source.addMaterial = scope.addMaterial = function(material){
				
				material = new scope.materialConstructor(material);
				material.owner = "";
				
				scope.source.push(material);
				scope.common.setIndex(scope.source);				
				
				scope.calculate();				
			};*/
			
			//delete material from "source" and calculate
			/*scope.deleteMaterial = function(material){
				if (!material) return;
				
				scope.source = scope.source.filter(function(item){
					if (item.id === material.id) return false;
					return true;
				});
				
				scope.common.setIndex(scope.source);				
			};
			*/
			//calculate table
			scope.source.calculate = scope.calculate = function(){
				var materialSum = 0,
				source = scope.source;
		
				source.sum = 0;				
				source.forEach(function(material, i, arr){
					material.sumMaterial();
					materialSum += material.sum;						
				});
							
				source.sum = Common.toFloat(materialSum);	

				//тут должна быть функция для расчета основных показателей material report
			};			
		}
	}
}]);