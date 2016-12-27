"use strict";

var app = angular.module('appCalc.calculationService', ['appCalc.Common', 'appCalc.niService']);

app.factory('Calculation', function (JobConstructor, Ni, Common, MaterialConstructor) {
    function Calculation(JobConstructor, Ni, Common, MaterialConstructor) {
        this.calculateNi = Ni.calc;

        function setIndex(arr) {
            arr.forEach(function (e, i, a) {
                e.index = i + 1;
            });
        }

        this.jobs = [];
        this.materials = [];

        this.jobs.salaryMainWorkers = 0;
        this.jobs.amortizations = 0;
        this.jobs.total = 0;
        this.jobs.totalhh = 0;

        this.jobs.reserve = 0;
        this.niReserve = Ni.prop.reserve.percent / 100;
        this.jobs.sum = 0;
        this.jobs.human_hour = 0;
    };

    // добавление работы
    Calculation.prototype.addJob = function (job) {

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
    Calculation.prototype.deleteJob = function (job) {
        this.jobs = this.jobs.filter(function (elem) {
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
    Calculation.prototype.addMaterial = function (material) {
        material = new MaterialConstructor(material);

        // добавляем в список материалов
        this.materials.push(material);
        // устанавливаем индекс
        Common.setIndex(this.materials);
        // считаем сумму
        this.calculate();
    };

    this.deleteMaterial = function (material) {
        this.materials.splice(material.index - 1, 1);
        Common.setIndex(this.materials);
    };

    // Калькуляция работ и материалов.
    Calculation.prototype.calculate = function () {
        var total = 0,
            totalhh = 0,
            totalam = 0,
            sumSalary = 0,
            reserve,
            sum = 0,
            niDelivery = Ni.prop.deliveryExp.percent / 100,
            materialSum = 0;

        // считаем сумму всех работ
        if (this.hasOwnProperty('jobs')) {
            this.jobs.forEach(function (element) {
                element.sumJob();
                sum += element.sum;
                totalhh += element.human_hour * element.number;
                totalam += element.amortization * element.number * element.human_hour;
                sumSalary += element.salaryMainWorkers * element.number;
            });

            sumSalary = Common.toFloat(sumSalary);
            reserve = Common.toFloat(sum * this.niReserve);
            total = Common.toFloat(sum + reserve);
            this.jobs.salaryMainWorkers = sumSalary;
            this.jobs.amortization = totalam;
            this.jobs.total = Common.toFloat(total);

            this.jobs.reserve = reserve;
            this.jobs.sum = sum;
            this.jobs.human_hour = totalhh * (1 + this.niReserve);

            if (this.hasOwnProperty('calculateNi')) {
                this.calculateNi(sumSalary, totalam, total);
            }
        }

        // считаем материалы
        if (this.hasOwnProperty('materials')) {
            this.materials.sum = 0;
            this.materials.forEach(function (material, i, arr) {
                materialSum += material.sumMaterial();
            });

            this.materials.sum = materialSum;
            //Запас на материалы
            this.materials.reserve = Common.toFloat(this.materials.sum * this.niReserve);
            // Расходы по доставке и оформлению материалов
            this.materials.delivery = this.getDelivery(this.materials.sum, this.materials.reserve);

            this.materials.total = Common.toFloat(this.materials.sum + this.materials.reserve + this.materials.delivery);
        }
    };

    Calculation.prototype.getDelivery = function (sum, reserve) {
        var niDelivery = Ni.prop.deliveryExp.percent / 100,
            delivery = 0;

        if (!sum || !angular.isNumber(+sum)) sum = 0;
        if (!reserve || !angular.isNumber(+reserve)) reserve = 0;

        delivery = Common.toFloat((sum + reserve) * niDelivery);
        delivery += (sum + reserve) * (1 + niDelivery) * (1 / (1 - Ni.prop.singleTax.percent / 100) - 1);

        return delivery;
    };

    return new Calculation(JobConstructor, Ni, Common, MaterialConstructor);
});
