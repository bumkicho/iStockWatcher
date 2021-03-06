angular.module('iStockWatcher.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('MyStocksCtrl', ['$scope',
function($scope) {
  $scope.stocklist = [
      {ticker: 'AAPL'},
      {ticker: 'GPRO'},
      {ticker: 'FB'},
      {ticker: 'NFLX'},
      {ticker: 'TSLA'},
      {ticker: 'BRK-A'},
      {ticker: 'MSFT'}
  ];
}
])

.controller('StockCtrl', ['$scope','$stateParams','stockDataService','dateService','$window','chartDataService',
function($scope,$stateParams,stockDataService,dateService,$window,chartDataService) {
    $scope.ticker = $stateParams.selectedStockTicker;
    $scope.chartView = 1;
    $scope.fromDate = dateService.oneMonthAgoDate();
    $scope.toDate = dateService.currentDate();    
    //console.log(dateService.currentDate());
    //console.log(dateService.oneYearAgoDate());
    
    $scope.$on("$ionicView.afterEnter", function() {
        getStockPriceData();
        getStockDetailData();
        getChartData();
    });
    
    $scope.switchChratView = function(n){
        if(n==1){
            $scope.fromDate = dateService.oneMonthAgoDate();
            $scope.toDate = dateService.currentDate(); 
            getChartData();
        } else if(n==2){
            $scope.fromDate = dateService.oneQuarterAgoDate();
            $scope.toDate = dateService.currentDate();
            getChartData();
        } else if(n==3){
            $scope.fromDate = dateService.oneYearAgoDate();
            $scope.toDate = dateService.currentDate();
            getChartData();
        }
        
        $scope.chartView = n;
        //console.log($scope.chartView);
    };
    
    function getStockPriceData(){
        var promise = stockDataService.getStockData($scope.ticker);
        promise.then(function(data){
            //console.log(data);
            $scope.stockPriceData = data;
        });
    }
    
    function getStockDetailData(){
        var promise = stockDataService.getStockDetail($scope.ticker);
        promise.then(function(data){
            //console.log(data);
            $scope.stockDetailData = data;
        });
    }
    
    function getChartData(){
        var promise = chartDataService.getHistoricData($scope.ticker, $scope.fromDate, $scope.toDate);
        promise.then(function(data){
           $scope.myData = JSON.parse(data)
           .map(function(series) {
                series.values = series.values.map(function(d) { return {x: d[0], y: d[1] }; });
                return series;
            });

        });
    }

	var xTickFormat = function(d) {
		var dx = $scope.myData[0].values[d] && $scope.myData[0].values[d].x || 0;
		if (dx > 0) {
			return d3.time.format("%b %d")(new Date(dx));
		}
	return null;
	};

	var x2TickFormat = function(d) {
		var dx = $scope.myData[0].values[d] && $scope.myData[0].values[d].x || 0;
		return d3.time.format('%b %Y')(new Date(dx));
	};

	var y1TickFormat = function(d) {
		return d3.format(',f')(d);
	};

	var y2TickFormat = function(d) {
		return d3.format('s')(d);
	};

	var y3TickFormat = function(d) {
		return d3.format(',.2s')(d);
	};

	var y4TickFormat = function(d) {
		return d3.format(',.2s')(d);
	};

	var xValueFunction = function(d, i) {
		return i;
	};
    
    var marginBottom = ($window.innerWidth/100) * 10;

	$scope.chartOptions = {
		chartType: 'linePlusBarWithFocusChart',
		data: 'myData',
		margin: {top: 15, right: 30, bottom: marginBottom, left: 30},
		interpolate: "cardinal",
		useInteractiveGuideline: false,
		yShowMaxMin: false,
		tooltips: false,
        showLegend: false,
        useVoronoi: false,
        xShowMaxMin: false,
		xValue: xValueFunction,
		xAxisTickFormat: xTickFormat,
		x2AxisTickFormat: x2TickFormat,
		y1AxisTickFormat: y1TickFormat,
		y2AxisTickFormat: y2TickFormat,
		y3AxisTickFormat: y3TickFormat,
		y4AxisTickFormat: y4TickFormat,
		transitionDuration: 500,
        y1AxisLabel: 'Price',
        y3AxisLabel: 'Volume'
	};

    
}
])

;
