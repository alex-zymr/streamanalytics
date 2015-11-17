app.controller('SearchController', function($scope, $http, CONFIG_SETTINGS) {
	$scope.recordMax = 50;
	$scope.defaultTemperature = {
		selectedRange: {
			min: 60,
			max: 70
		},
		boundRange: {
			min: 35,
			max: 95
		}
	}
	$scope.temperature = angular.copy($scope.defaultTemperature);
	
	$scope.resetData = function() {
		$scope.temperature = angular.copy($scope.defaultTemperature);	
		$scope.filterData();	
	};
	
	$scope.filterData = function() {
		var requestConfig = {
			method: 'POST',
			url: CONFIG_SETTINGS.searchUrl,
			headers: {
				'api-key': CONFIG_SETTINGS.apiKey
			},
			data: {
				count: true,
				search: '*',
				filter: '(avgvalue ge ' + $scope.temperature.selectedRange.min + ') and (avgvalue le ' + $scope.temperature.selectedRange.max + ')',
				top: $scope.recordMax,
				orderby: 'eventutctime desc',
				facets: [
					'fivesecond_bucket,count:5,sort:count',
					'minute_bucket,count:5,sort:count',
					'hour_bucket,count:5,sort:count',
					'day_bucket,count:5,sort:count'
				]
			}
		};		
		$scope.isLoading = true;
		$http(requestConfig).then(function ($result) {
			$scope.records = $result.data.value;
			$scope.facets = $result.data['@search.facets'];
			$scope.recordCount = $result.data['@odata.count'];
			$scope.isLoading = false;
		}, function () {
			console.log('all records GET request failed');
			$scope.isLoading = false;
		});
	};
	
	$scope.filterData();
});