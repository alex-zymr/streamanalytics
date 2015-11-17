var app = angular.module('analyticsApp', [
	'ngRoute',
	'ui-rangeSlider'
]);

app.config(function ($routeProvider) {	
    $routeProvider
		.when('/search', {
			templateUrl:'partials/search', 
			controller:'SearchController'
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

app.constant('CONFIG_SETTINGS', CONFIG_JSON);

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

// From http://stackoverflow.com/questions/17448100/how-to-split-a-string-with-angularjs
app.filter('split', function() {
	return function(input, splitChar, splitIndex) {
		// do some bounds checking here to ensure it has that index
		return input.split(splitChar)[splitIndex];
	}
});

// From http://aboutcode.net/2013/07/27/json-date-parsing-angularjs.html
function convertDateStringsToDates(input) {
	var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;
    // Ignore things that aren't objects.
    if (typeof input !== "object") return input;

    for (var key in input) {
        if (!input.hasOwnProperty(key)) continue;

        var value = input[key];
        var match;
        // Check for string properties which look like dates.
        if (typeof value === "string" && (match = value.match(regexIso8601))) {
            var milliseconds = Date.parse(match[0])
            if (!isNaN(milliseconds)) {
                input[key] = new Date(milliseconds);
            }
        } else if (typeof value === "object") {
            // Recurse into object
            convertDateStringsToDates(value);
        }
    }
}

app.config(["$httpProvider", function ($httpProvider) {
     $httpProvider.defaults.transformResponse.push(function(responseData){
        convertDateStringsToDates(responseData);
        return responseData;
    });
}]);
