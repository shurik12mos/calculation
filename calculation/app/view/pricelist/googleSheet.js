'use strict';

var app = angular.module('appCalc.googleSheet', ['ngResource', 'ngRoute', 'appCalc.Common']);

app.factory('GetGoogleSheet', function($resource, JobConstructor){
	var GetGoogleSheet = $resource('https://spreadsheets.google.com/feeds/cells/11zwz9-Yj0Dr7_EbUjZavhjafobHEy9zwNaL8iwa3ak4/1/public/values?alt=json',
	{},
	{get: 
		{ 
			action: 'GET',
			transformResponse: function(data){
				var price = angular.fromJson(data);
				
				// parsing priceList to array
				function parsingPrice(data) {
					var pricelist = [],
					arr = data.feed.entry,
					row = 1,
					col,
					content,
					col_num, col_name, col_code, col_rank, col_amortization, col_human_hour, col_measure,
					pricelistLength;
					
					// Parsing data from google spreadsheet. 
					function parsing(arr) {
						var numSection, numSubsection, numJob, row, col, counterRow = 0; 			
						
						arr.forEach(function(item, i, arr){
							content = item.gs$cell.$t;
							row = item.gs$cell.row;
							col = item.gs$cell.col;
							
							// get section by number in column col_num
							if (col == col_num && content !== "" && !isNaN(content) && arr[i+1].gs$cell.$t !== "") {					
								pricelistLength = pricelist.length-1;
								pricelist[content] = pricelist[content]?pricelist[content]:[];
								pricelist[content].name = arr[i+1].gs$cell.$t;
								pricelist[content].code = content;
								pricelist[content].row = row;
								counterRow = row;
											
							}
							
							//get subsection by parsing code for subsection with regexp
							if (col == col_code && content.search(/^\d+\.\d+$/)!== -1 && row > counterRow) {
								numSection = content.match(/^\d+/g)[0];
								numSubsection = content.match(/\d+$/g)[0];
								pricelist[numSection][numSubsection] = pricelist[numSection][numSubsection]?pricelist[numSection][numSubsection]:[];
								
								pricelist[numSection][numSubsection].name = arr[i-1].gs$cell.$t;
								pricelist[numSection][numSubsection].code = content;
								pricelist[numSection][numSubsection].row = row;
								counterRow = row;
								/*
								pricelist[numSection][numSubsection] = {
									name: arr[i-1].gs$cell.$t,
									code: content,
									row: row
								}*/
							}
							
							//get jobs by parsing code for job with regexp. It must look like X.X.X
							if (col == col_code && content.search(/^\d+\.\d+\.\d+$/)!== -1  && row > counterRow){				
								numSection = content.match(/^\d+/g)[0];
								numSubsection = content.match(/\.\d+\./)[0].replace(/\./g, "");
								numJob = content.match(/\d+$/g)[0];		
								pricelist[numSection][numSubsection][numJob] = pricelist[numSection][numSubsection][numJob]?pricelist[numSection][numSubsection][numJob]:[];
								pricelist[numSection][numSubsection][numJob] = {
									name: arr[i-1].gs$cell.$t,
									code: content,
									rank: parseFloat(arr[i+1].gs$cell.$t.replace(/,/g, ".")),
									amortization: parseFloat(arr[i+2].gs$cell.$t.replace(/,/g, ".")),
									human_hour: parseFloat(arr[i+3].gs$cell.$t.replace(/,/g, ".")),
									measure:arr[i+4].gs$cell.$t,
									price: parseFloat(arr[i+5].gs$cell.$t.replace(/,/g, "."))
								}
								pricelist[numSection][numSubsection][numJob] = new JobConstructor(pricelist[numSection][numSubsection][numJob]);
								counterRow = row;
								
								// Проверка вставленного значения. Если неккоректно, то удалить
								var temp = pricelist[numSection][numSubsection][numJob];
								if (temp.name == null || temp.code == null || temp.rank == null || temp.human_hour == null || temp.price == null) {
									pricelist[numSection][numSubsection].splice(numJob, 1);
								}
								
							} 
						});
					}
					
					// delete emty items of Array;
					function deleteEmptyItem (arr) {
						var l;
						if (Object.prototype.toString.call(arr) !== "[object Array]") {
							return;
						}
						
						l = arr.length;
						for (var i = 0; i<l; i=i+1) {
							if (arr[i]===undefined) {
									arr.splice(i,1);
							}
							if (Object.prototype.toString.call(arr[i]) === "[object Array]") {					
								arr[i] = deleteEmptyItem(arr[i]);					
							}
						}					
						return arr;
					};
					
					//get num of columns with header of table. It use later.
					for (var i = 0; row < 2; i++) {
						content = arr[i].gs$cell.$t;
						row = arr[i].gs$cell.row;
						col = arr[i].gs$cell.col;
						
						switch(content.toLowerCase()) {
							case '№':
								col_num = col;
								break;
							case 'наименование':
								col_name = col;
								break;
							case 'артикул':
								col_code = col;
								break;
							case 'разряд':
								col_rank = col;
								break;
							case 'амортизация оборудования, грн/час':
								col_amortization = col;
								break;	
							case 'норма чел*час':
								col_human_hour = col;
								break;	
							case 'ед.измерения':
								col_measure = col;
								break;	
						}
					}
					
					parsing(arr);					
					
					pricelist = deleteEmptyItem(pricelist);
					
					return pricelist;
					
				}
				
				price = {price: parsingPrice(price)};				
				return price;
			} //transformResponse
		}
	});
	return GetGoogleSheet;
});