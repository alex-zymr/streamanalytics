app.controller('ChartController', function($scope, $http, CONFIG_SETTINGS) 
{ 
	$scope.countOptions = [5, 10, 20, 30];
	$scope.selectedCountOption = 10;
	$scope.selectedSortOption = '-value';
	$scope.refreshSource = function() {
		var requestConfig = {
			method: 'POST',
			url: CONFIG_SETTINGS.searchUrl,
			headers: {
				'api-key': CONFIG_SETTINGS.apiKey
			},
			data: {
				search: '*',
				top: 0,
				facets: ['fivesecond_bucket,count:' + $scope.selectedCountOption + ',sort:' + $scope.selectedSortOption]
			}
		};
		$scope.isLeftLoading = true;
		$http(requestConfig).then(function ($result) {
			var facets = $result.data['@search.facets'];
			$scope.buckets = facets['fivesecond_bucket'];	
			$scope.isLeftLoading = false;	
		}, function () {
			console.log('buckets GET request failed');
			$scope.isLeftLoading = false;	
		});
	};
	$scope.showGraph = function(bucket) {		
		var requestConfig = {
			method: 'POST',
			url: CONFIG_SETTINGS.searchUrl,
			headers: {
				'api-key': CONFIG_SETTINGS.apiKey
			},
			data: {
				search: bucket.value,
				searchFields: 'fivesecond_bucket',
				top: bucket.count,
				select: 'sensor,avgvalue,maxvalue,minvalue'
			}
		};		
		$scope.isRightLoading = true;
		$http(requestConfig).then(function ($result) {
			var results = $result.data.value;
			var dataArray = [];
			$.each(results, function(index, item) {
				dataArray.push({				
					x: [item.minvalue, item.avgvalue, item.maxvalue],
					type: 'box',
					name: item.sensor
				});
			})
			Plotly.newPlot('chartArea', dataArray, {
				paper_bgcolor:"rgba(255, 255, 255, 0)",
				plot_bgcolor:"rgba(0, 0, 0, 0)",
				font:{
					family: "Lato,Helvetica Neue, Helvetica, Arial, sans-serif"
				}
			});			
			$scope.isRightLoading = false;	
		}, function () {
			console.log('fivesecond_bucket GET request failed');
			$scope.isRightLoading = false;	
		});
	};
	$scope.refreshSource();
});