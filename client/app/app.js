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
			//3rd Party dependencies
			'intcAppFrame',
			'intcEnter',
			'tmixCaching'
			//Custom dependencies
		])
		.config(config)

//declares the identity service
.service('identity', IdentityService)
//declares the delete service
.service('todelete', DeleteService)

/* ngInject */
function config($routeProvider, $httpProvider, $base64, $locationProvider) {
	$locationProvider.html5Mode(true);
	$locationProvider.hashPrefix('');
	//comment this if statement out when testing locally
	//it redirects a client to https if they are not already using it
	//only needed when publishing

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
							return response || $q.when(response);
					},
					'responseError': function (response) {

							if (response.status === 401 || response.status === 403) {
								if (window.location.href != location.origin + '/login') {
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
			authenticated: false

		})

		.when('/ontologies', {
			templateUrl: 'ProductOntology/products.html',
			controller: 'ProductsController',
			controllerAs: 'vm',
			authenticated: false

		})
		.when('/search', {
			templateUrl: 'Search/search.html',
			controller: 'SearchController',
			controllerAs: 'vm',
			authenticated: false

		})
		.when('/threats/:threatID', {
			templateUrl: 'ThreatDetail/threatDetail.html',
			controller: 'ThreatsController',
			controllerAs: 'vm',
			authenticated: false
		})

		.when('/feeds', {
			templateUrl: 'Feeds/feeds.html',
			controller: 'FeedsController',
			controllerAs: 'vm',
			authenticated: false
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
			authenticated: false
		})

		.when('/pentest-arsenal', {
			templateUrl: 'Pentest/pentest.html',
			controller: 'PentestController',
			controllerAs: 'vm',
			authenticated: false
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
		console.log(ID);
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
