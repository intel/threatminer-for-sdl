//controller for deleting a selected amount of threats
angular.module('threat').controller('DeleteselectedthreatsController', function($http, $window, $q, $routeParams, todelete) {
    var vm = this;
    var threatIds = todelete.getID();
    var productID  = todelete.getProductID();
    promiseArray = [];
    vm.amount = threatIds.length;

    vm.confirmDelete  = function() {
      for(t=0; t<threatIds.length; t++){
         promiseArray.push( $http.delete('http://127.0.0.1:5000/products/' + productID + '/threats/' + threatIds[t]));
      }
         $q.all(promiseArray).then(function(dataArray){
           todelete.storeID(null);
           todelete.storeProductID(null);
           $window.location.reload();
         });
    };
});
