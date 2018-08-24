//controller for deleting a selected amount of threats
angular.module('threat').controller('DeleteselectedthreatsController', function($http, $window, $q, $routeParams, todelete, values) {
    var vm = this;
    var threatIds = todelete.getID();
    var productID  = todelete.getProductID();
    promiseArray = [];
    vm.amount = threatIds.length;

    vm.confirmDelete  = function() {
      for(t=0; t<threatIds.length; t++){
         promiseArray.push( $http.delete(values.get('api') + '/products/' + productID + '/threats/' + threatIds[t]));
      }
         $q.all(promiseArray).then(function(dataArray){
           todelete.storeID(null);
           todelete.storeProductID(null);
           $window.location.reload();
         });
    };
});
