app.controller('BucketsController', function($scope, $http, oDataBuilder, CONFIG_SETTINGS) 
{ 	
	$scope.records = [];
	$scope.currentParams = {
		filterSet: {
			fivesecond_bucket: null,
			minute_bucket: null,
			hour_bucket: null,
			day_bucket: null	
		},
		count: true,
		search: '*',
		skip: 0,
		getODataFitler: function() {
			var array = [];
			if ($scope.currentParams.filterSet.fivesecond_bucket) {
				array.push($scope.currentParams.filterSet.fivesecond_bucket); 
			}
			if ($scope.currentParams.filterSet.minute_bucket) {
				array.push($scope.currentParams.filterSet.minute_bucket); 
			}
			if ($scope.currentParams.filterSet.hour_bucket) {
				array.push($scope.currentParams.filterSet.hour_bucket); 
			}
			if ($scope.currentParams.filterSet.day_bucket) {
				array.push($scope.currentParams.filterSet.day_bucket); 
			}
			return oDataBuilder.createQueryString(array);
		}	
	};
	$scope.refreshTable = function(successCallback) {		
		var requestConfig = {
			method: 'POST',
			url: CONFIG_SETTINGS.searchUrl,
			headers: {
				'api-key': CONFIG_SETTINGS.apiKey
			},
			data: {
				facets: [
					"fivesecond_bucket,count:20,sort:-value",
					"minute_bucket,count:20,sort:-value",
					"hour_bucket,count:20,sort:-value",
					"day_bucket,count:20,sort:-value"
				],
				filter: $scope.currentParams.getODataFitler(),
				count: $scope.currentParams.count,
				search: $scope.currentParams.search,
				skip: $scope.currentParams.skip
			}
		};		
		$scope.isLoading = true;
		$http(requestConfig).then(function ($result) {
			$scope.records = $result.data.value;
			$scope.facets = $result.data['@search.facets'];
			if (successCallback) {
				successCallback();
			}
			$scope.isLoading = false;
		}, function () {
			console.log('all records GET request failed');
			$scope.isLoading = false;
		});
	};
	$scope.reset = function() {
		$scope.currentParams.filterSet = {
			fivesecond_bucket: null,
			minute_bucket: null,
			hour_bucket: null,
			day_bucket: null	
		};
		$scope.newFiveSecondBucket = null;
		$scope.newMinuteBucket = null;
		$scope.newHourBucket = null;
		$scope.newDayBucket = null;
		$scope.refreshTable();
	};
	$scope.bucketChanged = function(changedBucket, bucketName) {
		$scope.currentParams.filterSet[bucketName] = null;		
		if (changedBucket) {
			$scope.currentParams.filterSet[bucketName] = bucketName + ' eq \'' + changedBucket + '\'';
		}
		$scope.refreshTable();
	};
	$scope.refreshTable();
});