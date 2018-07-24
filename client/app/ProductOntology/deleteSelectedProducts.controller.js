//controller that deletes a selected number of products
angular.module('threat').controller('DeleteselectedproductsController', function($http, $window, $q, $routeParams, todelete) {
    var vm = this;
    var productIds = todelete.getID();
    promiseArray = [];
    vm.amount = productIds.length;

    vm.confirmDelete  = function() {
      for(t=0; t<productIds.length; t++){
         promiseArray.push( $http.delete('http://127.0.0.1:5000/products/' + productIds[t]));
      }
         $q.all(promiseArray).then(function(dataArray){
           todelete.storeID(null);
           $window.location.reload();
         });
    };
});
