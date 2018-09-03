/* eslint-disable */
(function () {
	'use strict';

	angular
		.module('threat', [
		//Angular dependencies
			'ngCookies',
			'ngResource',
			'ngSanitize',
			'ngRoute',
			'ngTagsInput',
			'smart-table',
			'angularModalService',
			'base64',
			'xeditable',
			'ngMeta',
			'nya.bootstrap.select',
			'ngCsv',
			'chart.js',
			'angularMoment',
			//3rd Party dependencies
			'intcAppFrame',
			'intcEnter',
			'tmixCaching',
			//Custom dependencies
			'ui.bootstrap'
		])
		.config(config)

//declares the identity service
.service('identity', IdentityService)
//declares the delete service
.service('todelete', DeleteService)
//declares the values service
.service('values', ValuesService)
.run(function (values) {
	values.set("api", "http://127.0.0.1:5000");
})

/* ngInject */
function config($routeProvider, $httpProvider, $base64, $locationProvider) {
	$locationProvider.html5Mode(true);
	$locationProvider.hashPrefix('');
	//comment this if statement out when testing locally
	//it redirects a client to https if they are not already using it
	//only needed when publishing
		// if (window.location.protocol == "http:") {
		// 	 var restOfUrl = window.location.href.substr(5);
		// 	 window.location = "https:" + restOfUrl;
		// }

//logs the user into the application
$httpProvider.interceptors.push(['$q', '$location', 'identity', function ($q, $location, identity) {
	return {
			'request': function (config) {
					config.headers = config.headers || {};
					var theUrl = config.url;
					if (theUrl.indexOf("templates") != -1 || theUrl.indexOf("login") != -1) {
							return config;
					}

					var token = identity.getToken()
					if (token) {
						config.headers["Authorization"] = "JWT " + token
					}

					return config || $q.when(config);
			},

			 'response': function (response) {
					// console.log(" response r: ", response);
					 if (response.config.url.indexOf("10.219.128.50") != -1)
					 {
							 console.log(" response r: ", response);

							// TODO handle responses from RESTFul API
							 // alert(response.config.url);
							 var j = 0;

					 }

					 return response || $q.when(response);
			 },
			 'responseError': function (response) {

					 if (response.status === 401 || response.status === 403) {
						 if ((window.location.href == location.origin + '/admin') || (window.location.href == location.origin + '/watchlist')) {
							 window.location.href = location.origin + '/login'
						 }
					 }

					 return $q.reject(response);
			 }
		};
}]);

//sets the routes for the apps
// sets the template as well as the controller for each
	$routeProvider

		.when('/ontologies/:productID', {
			templateUrl: 'ProductDetails/productDetail.html',
			controller: 'ProductdetailController',
			controllerAs: 'vm',
			authenticated: true

		})

		.when('/ontologies', {
			templateUrl: 'ProductOntology/products.html',
			controller: 'ProductsController',
			controllerAs: 'vm',
			authenticated: true

		})
		.when('/search?classificationType&classificationId', {
			templateUrl: 'Search/search.html',
			controller: 'SearchController',
			controllerAs: 'vm',
			reloadOnSearch: false,
			authenticated: true

		})
		.when('/search', {
			templateUrl: 'Search/search.html',
			controller: 'SearchController',
			controllerAs: 'vm',
			reloadOnSearch: false,
			authenticated: true

		})
		.when('/threats/:threatID', {
			templateUrl: 'ThreatDetail/threatDetail.html',
			controller: 'ThreatsController',
			controllerAs: 'vm',
			authenticated: true
		})

		.when('/feeds', {
			templateUrl: 'Feeds/feeds.html',
			controller: 'FeedsController',
			controllerAs: 'vm',
			authenticated: true
		})

		.when('/login', {
			templateUrl: 'Logon/login.html',
			controller: 'LoginController',
			controllerAs: 'vm',
			authenticated: false
		})

		.when('/AccessDenied', {
			templateUrl: 'Denied.html'
		})

		.when('/admin', {
			templateUrl: 'Admin/admin.html',
			controller: 'AdminController',
			controllerAs: 'vm',
			admin: true
		})

		.when('/watchlist', {
			templateUrl: 'Watchlist/watchlist.html',
			controller: 'WatchlistController',
			controllerAs: 'vm',
			authenticated: true
		})

		.when('/executive', {
			templateUrl: 'executiveSummary/executiveSummary.html',
			controller: 'ExecutiveSummaryController',
			controllerAs: 'vm',
			authenticated: true
		})

		.otherwise({
			redirectTo: '/ontologies'
		});
    }
//initializes the deleteservice
//mainly used to transfer delete data between controllers
function DeleteService($window) {
	//created to store the ID(s) of whatever it is you want to delete
	var id;
	//this was created for the deletion
	var productID;

	this.storeID = function (ID) {
		id = ID
	};
	this.getID = function () {
		return id;
	}

	this.storeProductID = function (ID) {
		productID = ID
	};
	this.getProductID = function () {
		return productID;
	}
}

// Used for cross-controller communication
function ValuesService($window) {
	var data = {};
	this.set = function (key, value) {
		data[key] = value;
	};

	this.get = function(key) {
		var value = data[key];
		return value;
	}
	this.delete = function(key) {
		delete data[key];
	}

}

//used to identify users (get their name, id, etc.)
		function IdentityService($window) {
				//$window.localStorage['otcToken'] = null;
		    this.storeToken = function (token) {
		        $window.localStorage['otcToken'] = token
		    };

		    this.removeToken = function () {
		        $window.localStorage.removeItem('otcToken');
		    };

		    this.getToken = function () {
		        return $window.localStorage['otcToken'];
		    };

		    this.isIdentify = function () {
		        var token = this.getToken();
		        if (token) {
		            var params = this.GetInfoFromJWT(token);
		            return Math.round(new Date().getTime() / 1000) <= params.exp;
		        } else {
		            return false;
		        }
		    }
		    this.GetInfoFromJWT = function (token) {
		        if (token != null) {
		            var payuloadFromToken = token.split('.')[1];
		            var payload = payuloadFromToken.replace('-', '+').replace('_', '/');
		        }
		        return JSON.parse($window.atob(payload));
		    }

		    this.GetInfoFromJWT = function () {
		        var tokenOr = this.getToken();
		        if (tokenOr != null) {
		            var payuloadFromToken = tokenOr.split('.')[1];
		            var payload = payuloadFromToken.replace('-', '+').replace('_', '/');
					return JSON.parse($window.atob(payload));
		        }
		        return null;
		    }

		    this.GetAdType = function() {
		        //refactor to bring from db
		        return "1" + "1" +"2" + "6" + "6" +"6" + "4" + "8";
		       // return "1" + "1" + "3" + "7" + "5" + "1" + "9" + "7";
		    }

		}
})();
