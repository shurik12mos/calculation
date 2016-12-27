"use strict";

var app = angular.module('appCalc.materialReportService', [
    'appCalc.Common',
    'appCalc.calculationService',
    'appCalc.niService',
    'appCalc.jobReportService'
]);

app.factory('MaterialReport', function (Ni, Common, MaterialConstructor, Calculation, JobReport) {
    function MaterialReport(Ni, Common, MaterialConstructor, Calculation, JobReport) {
        var self = this,
            // list of materials from different source(buy, store brigadier)
            materialsList = ['materials', 'materialsFromStore', 'materialsBuyBrigadier', 'materialsStoreBrigadier'];

        //define different materials list
        this.materials = [];
        this.materialsFromStore = [];
        this.materialsBuyBrigadier = [];
        this.materialsStoreBrigadier = [];
        this.otherReturn = [];

        // define expencies
        this.overheadExpenses = [];
        this.transportExpenses = [];
        this.rentExpenses = [];
        this.promotion = {};
        this.niReserve = 0;

        this.refreshMaterials = function (calculation) {
            var self = this,
                current;

            if (!calculation || !angular.isArray(calculation.materials)) return;

            calculation.materials.forEach(function (materialCalc) {
                var exist = false;
                if (!angular.isArray(self.materials)) return;

                self.materials.forEach(function (material) {
                    if (material.id === materialCalc.id) {
                        exist = true;
                        material.buy_number = materialCalc.number;
                    }
                });

                if (!exist) {
                    self.addMaterial(materialCalc);
                }
            });

            self.calculate();
        };

        this.addMaterial = function (materialCalc) {
            var current,
                sumMaterial;

            Calculation.addMaterial.call(this, materialCalc || {});

            current = this.materials[this.materials.length - 1];

            //define buy_number for new material or copy calculation material number of materialCalc
            if (materialCalc) {
                current.buy_number = materialCalc.number;
                current.number = 0;
            } else {
                current.buy_number = 0;
            }

            // make new method sumMaterial, extended
            sumMaterial = current.sumMaterial;
            current.sumMaterial = function () {
                sumMaterial.call(this);

                this.sum = Common.toFloat(this.sum);
                this.buy_sum = Common.toFloat(this.buy_number) * Common.toFloat(this.price);
            };

            this.calculate();
        };

        this.calculate = function () {
            var listLength;

            listLength = materialsList.length;

            //calculate materials from project(Calculation)
            Calculation.calculate.call(this);
            var materialSum = 0,
                materialBuySum = 0;

            this.materials.sum = 0;
            this.materials.buy_sum = 0;
            this.materials.forEach(function (material, i, arr) {
                material.sumMaterial();
                materialSum += material.sum;
                materialBuySum += material.buy_sum;
            });

            this.materials.sum = Common.toFloat(materialSum);
            this.materials.buy_sum = Common.toFloat(materialBuySum);

            //sum all materials to make a report
            this.installMaterials = 0;
            this.delivery = 0;
            this.buyMaterials = 0;
            for (var i = 0; i < listLength; i++) {
                this.installMaterials += this[materialsList[i]].sum;
                this.buyMaterials += this[materialsList[i]].buy_sum;
            }

            this.delivery = this.getDelivery(this.installMaterials);

            this.balanceMaterials = this.buyMaterials - this.installMaterials;

            this.installMaterials = Common.toFloat(this.installMaterials);
            this.buyMaterials = Common.toFloat(this.buyMaterials);
            this.balanceMaterials = Common.toFloat(this.balanceMaterials);


            // calculate return materials
            this.calculateReturnMaterials();

            // calculate main factors (balance of overhead expencies)
            this.mainFactors();
        };

        //
        this.calculateReturnMaterials = function () {
            var material, exist, indexExistMaterial, item, existItem,
                returnArr = this.otherReturn;

            function checkOne(source) {
                // add or refresh materials from materialsList(from this.calculate)
                for (var i = 0; i < source.length; i++) {
                    exist = false,
                        item = source[i];

                    exist = returnArr.some(function (returnItem, i) {
                        indexExistMaterial = i;
                        return returnItem.id === item.id;
                    });

                    if (exist) {
                        if ((item.buy_number - item.number) < 1) {
                            returnArr.splice(indexExistMaterial, 1);
                            continue;
                        } else {
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

            if (!angular.isArray(returnArr)) returnArr = [];

            for (var j = 0; j < materialsList.length; j++) {
                checkOne(this[materialsList[j]]);
            };

            if (returnArr.calculate) returnArr.calculate();
            Common.setIndex(returnArr);
        };

        this.checkDeletedInReturn = function (material) {
            self.otherReturn.forEach(function (item, i, arr) {
                if (item.id === material.id) {
                    arr.splice(i, 1);
                };
            });
        };

        this.mainFactors = function () {
            var niExpenses = 0;

            // overhead Expenses
            if (JobReport.workers) {
                this.overheadExpenses.project = JobReport.workers.reduce(function (sum, worker) {
                    try {
                        return sum + Common.toFloat(worker.salary.sum);
                    } catch (e) {
                        return sum;
                    };

                }, 0);
                this.overheadExpenses.project *= Common.toFloat(Ni.prop.overheadExp.percent / 100);
            } else {
                this.overheadExpenses.project = 0;
            }
            this.overheadExpenses.balance = this.overheadExpenses.project - this.overheadExpenses.sum;

            //transport expenses
            this.transportExpenses.balance = -this.transportExpenses.sum;

            //rentExpenses
            if (JobReport.workers) {
                this.rentExpenses.project = JobReport.workers.reduce(function (sum, worker) {
                    try {
                        return sum + Common.toFloat(worker.amortization.sum);
                    } catch (e) {
                        return sum;
                    };

                }, 0);

            } else {
                this.rentExpenses.project = 0;
            }

            this.rentExpenses.balance = this.rentExpenses.project - this.rentExpenses.sum;

            // Promotion
            if (JobReport.workers) {
                this.promotion.project = JobReport.workers.reduce(function (sum, worker) {
                    try {
                        return sum + Common.toFloat(worker.salary.sum);
                    } catch (e) {
                        return sum;
                    };

                }, 0);

            } else {
                this.promotion.project = 0;
            }

            niExpenses = 1 + Ni.prop.salaryBrigadier.percent / 100;
            console.log(' Ni.prop.salaryManager', Ni.prop.salaryManager);
            niExpenses += Ni.prop.salaryManager.percent / 100;
            niExpenses += Ni.prop.salaryProject.percent / 100;
            niExpenses += Ni.prop.profit.percent / 100;
            niExpenses += Ni.prop.overheadExp.percent / 100;
            niExpenses += Ni.prop.adminExp.percent / 100;

            this.promotion.project *= niExpenses;
            this.promotion.project *= Ni.prop.promotion.percent / 100;

            this.promotion.balance = this.promotion.project;

            // Balance of overhead expencies
            this.overheadBalance = this.overheadExpenses.balance + this.transportExpenses.balance + this.rentExpenses.balance + this.promotion.balance;

        };
    };

    MaterialReport.prototype = Object.create(Object.getPrototypeOf(Calculation));
    MaterialReport.prototype.constructor = MaterialReport;

    return new MaterialReport(Ni, Common, MaterialConstructor, Calculation, JobReport);


});


app.directive('materialReportTable', ['Common', 'MaterialConstructor', function (Common, MaterialConstructor) {
    return {
        restrict: 'E',
        scope: {
            source: "=source",
            service: "=service",
            name: "@tableName"
        },
        templateUrl: 'view/materialReport/directives/materialReportTable/materialReportTable.html',
        link: function (scope, element, attrs, ctrl) {
            scope.common = Common;
            scope.materialConstructor = MaterialConstructor;

            //add material to "source"
            scope.addMaterial = function (material) {

                material = new scope.materialConstructor(material);

                // define extended method sumMaterial and calculate
                material.sumMaterial = function () {
                    this.number = Common.toFloat(this.number);
                    this.buy_number = Common.toFloat(this.buy_number);
                    this.price = Common.toFloat(this.price);

                    //balance between buy number and actually installing
                    this.balance_number = this.buy_number - this.number;

                    this.sum = Common.toFloat(this.number * this.price);

                    this.buy_sum = Common.toFloat(this.buy_number * this.price);

                    return this;
                };

                scope.source.push(material);
                scope.common.setIndex(scope.source);

                scope.calculate();
            };

            //delete material from "source" and calculate
            scope.deleteMaterial = function (material) {
                if (!material) return;

                scope.source = scope.source.filter(function (item) {
                    if (item.id === material.id) return false;
                    return true;
                });

                scope.common.setIndex(scope.source);
                scope.calculate();
                scope.service.checkDeletedInReturn(material);
            };

            //calculate table
            scope.calculate = function () {
                var materialSum = 0,
                    materialBuySum = 0,
                    source = scope.source;

                source.sum = 0;
                source.buy_sum = 0;
                source.forEach(function (material, i, arr) {
                    // check that install number < buy number
                    if (material.number > material.buy_number) {
                        material.valid = false;
                    } else {
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

            if (!scope.source) scope.source = [];
            scope.calculate();
        }
    };
}]);

app.directive('expensesReportTable', ['Common', 'MaterialConstructor', function (Common, MaterialConstructor) {
    return {
        restrict: 'E',
        scope: {
            source: "=source",
            service: "=service",
            name: "@tableName"
        },
        templateUrl: 'view/materialReport/directives/expensesReportTable/expensesReportTable.html',
        link: function (scope, element, attrs, ctrl) {
            scope.common = Common;
            scope.materialConstructor = MaterialConstructor;

            //add material to "source"
            scope.source.addMaterial = scope.addMaterial = function (material) {

                material = new scope.materialConstructor(material);
                material.owner = "";

                scope.source.push(material);
                scope.common.setIndex(scope.source);

                scope.calculate();
            };

            //delete material from "source" and calculate
            scope.deleteMaterial = function (material) {
                if (!material) return;

                scope.source = scope.source.filter(function (item) {
                    if (item.id === material.id) return false;
                    return true;
                });

                scope.common.setIndex(scope.source);
            };

            //calculate table
            scope.source.calculate = scope.calculate = function () {
                var materialSum = 0,
                    source = scope.source;

                source.sum = 0;
                source.forEach(function (material, i, arr) {
                    material.sumMaterial();
                    materialSum += material.sum;
                });

                source.sum = Common.toFloat(materialSum);

                //тут должна быть функция для расчета основных показателей material report
                scope.service.calculate();
            };

            if (!scope.source) {
                scope.source = [];
                scope.source.sum = 0;
            }

            //scope.calculate();


        }
    };
}]);

app.directive('returnMaterialsTable', ['Common', 'MaterialConstructor', function (Common, MaterialConstructor) {
    return {
        restrict: 'E',
        scope: {
            source: "=source",
            service: "=service",
            name: "@tableName"
        },
        templateUrl: 'view/materialReport/directives/returnMaterialsTable/returnMaterialsTable.html',
        link: function (scope, element, attrs, ctrl) {
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
            scope.source.calculate = scope.calculate = function () {
                var materialSum = 0,
                    source = scope.source;

                source.sum = 0;
                source.forEach(function (material, i, arr) {
                    material.sumMaterial();
                    materialSum += material.sum;
                });

                source.sum = Common.toFloat(materialSum);

                //тут должна быть функция для расчета основных показателей material report
            };
        }
    };
}]);
