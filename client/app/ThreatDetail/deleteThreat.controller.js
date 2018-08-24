//controller for deleting a threat
angular.module('threat').controller('DeletethreatController', function($http, $window, $q, $routeParams, values) {
    var vm = this;
    var threatID = $routeParams.threatID;


    vm.confirmDelete = function(){
        console.log(threatID)
        $http.delete(values.get('api') + '/threats/' + threatID).then(function(response){
          $(".modal-backdrop").hide();
          $window.location.href = '/products';
        });
    };

  });
