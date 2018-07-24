//controller for the modal that deletes selected feeds rather than just one
angular.module('threat').controller('DeleteselectedfeedsController', function($http, $window, $q, $routeParams, todelete) {
    var vm = this;
    var feedIds = todelete.getID();
    promiseArray = [];
    vm.amount = feedIds.length;

    vm.confirmDelete  = function() {
      for(t=0; t<feedIds.length; t++){
         promiseArray.push( $http.delete('http://127.0.0.1:5000/feeds/' + feedIds[t]));
      }
         $q.all(promiseArray).then(function(dataArray){
           todelete.storeID(null);
           $window.location.reload();
         });
    };
});
