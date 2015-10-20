angular.module('iStockWatcher.services', [])

.factory('encodeURIService', function() {
    return {
        encode: function(string) {
            //console.log(string);
            return encodeURIComponent(string).replace(/\"/g, "%22").replace(/\ /g,"%20").replace(/[!'{}]/g,escape);            
        }
    };
})

.factory('dateService', function($filter) {
    var currentDate = function() {
        var d = new Date();
        var date = $filter('date')(d, 'yyyy-MM-dd');
        return date;
    };
    var oneYearAgoDate = function() {
        var d = new Date();
        d.setDate(new Date().getDate()-365);
        var date = $filter('date')(d, 'yyyy-MM-dd');
        return date;
    };
    return {
        currentDate: currentDate,
        oneYearAgoDate: oneYearAgoDate
    };
})

.factory('stockDataService', function($q, $http, encodeURIService){
    var getStockDetail = function(ticker){
        var deferred = $q.defer(),
        query = 'select * from yahoo.finance.quotes where symbol IN ("'+ticker+'")',
        url='http://query.yahooapis.com/v1/public/yql?q='+encodeURIService.encode(query)+'&format=json&env=http://datatables.org/alltables.env';
        //console.log(url);
        
        $http.get(url)
        .success(function(json){
            var jsonData = json.query.results.quote;
            deferred.resolve(jsonData);
        })
        .error(function(error){
            console.log("Stock detail error: " + error);
            deferred.reject();
        });
        
        return deferred.promise;
    };
    
    var getStockData = function(ticker){
        var deferred = $q.defer(),
        url="http://finance.yahoo.com/webservice/v1/symbols/"+ticker+"/quote?format=json&view=detail";
        
        $http.get(url)
        .success(function(json){
            var jsonData = json.list.resources[0].resource.fields;
            deferred.resolve(jsonData);
        })
        .error(function(error){
            console.log("Stock data error: " + error);
            deferred.reject();
        });
        
        return deferred.promise;
    };
    
    return {
        getStockData: getStockData,
        getStockDetail: getStockDetail
    };
        
})

.factory('chartDataService', function($q, $http, encodeURIService) {
    
    var getHistoricData = function(ticker, fromDate, toDate) {
        
        var deferred = $q.defer(),
            query = 'select * from yahoo.finance.historicaldata where symbol = "'+ticker+'" and startDate = "'+fromDate+'" and endDate = "'+toDate+'"',
            url='http://query.yahooapis.com/v1/public/yql?q='+encodeURIService.encode(query)+'&format=json&env=http://datatables.org/alltables.env';
        
        $http.get(url)
        .success(function(json){
            //console.log(json);
            var jsonData = json.query.results.quote;
            var priceData = [];
            var volumeData = [];
            
            jsonData.forEach(function(dayDataObject){
                var rawDate = dayDataObject.Date;
                var formattedDate = Date.parse(rawDate);
                var price = parseFloat(Math.round(dayDataObject.Close * 100) / 100).toFixed(3);
                var volume = dayDataObject.Volume;
                
                var volumeDatum = '['+formattedDate+','+volume+']';
                var priceDatum = '['+formattedDate+','+price+']';
                
                volumeData.unshift(volumeDatum);
                priceData.unshift(priceDatum);
            });
            
            var formattedChartData =
                '[{' + 
                '"key":"volume",'+
                '"bar":true,'+
                '"values":['+volumeData+']'+
                '},'+
                '{' + 
                '"key":"'+ticker+'",'+
                '"values":['+priceData+']'+
                '}]'
            
            deferred.resolve(formattedChartData);
        })
        .error(function(error){
            console.log("Chart Data Error: " + error);
            deferred.reject();
        });
        
        return deferred.promise;
        
    };
        
    return {
        getHistoricData: getHistoricData
    };
    
})

;