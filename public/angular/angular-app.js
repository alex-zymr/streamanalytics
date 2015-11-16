var app = angular.module('analyticsApp', [
	'ngRoute'
]);

app.config(function ($routeProvider) {	
    $routeProvider
		.when('/search', {
			templateUrl:'partials/search'
		})
		.when('/chart', {
			templateUrl:'partials/chart', 
			controller:'ChartController'
		})
		.when('/buckets', {
			templateUrl:'partials/buckets', 
			controller:'BucketsController'
		})
		.when('/home', {
			templateUrl:'partials/home'
		})
		.otherwise({
        	redirectTo: '/home'
      	});
});

app.constant('CONFIG_SETTINGS', {
	searchUrl: 'https://sidneydemo.search.windows.net/indexes/sensor/docs/search?api-version=2015-02-28',
	apiKey: '8E4E21E17E0E2345558CD5A9B6FC1585'
});

app.service('oDataBuilder', function () {
	this.createQueryString = function(filterList) {
		var filterString = '';
		$.each(filterList, function(index, filter) {
			if (filterString .length == 0) {
				filterString  = '(' + filter + ')';
			} else {
				filterString  += 'and (' + filter + ')';
			}
			return filterString ;
		});
		return filterString;
	};
});