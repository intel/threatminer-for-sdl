//controller for deleting a threat
angular.module('threat').controller('DeletethreatController', function($http, $window, $q, $routeParams) {
    var vm = this;
    var threatID = $routeParams.threatID;


    vm.confirmDelete = function(){
        console.log(threatID)
        $http.delete('http://127.0.0.1:5000/threats/' + threatID).then(function(response){
          $(".modal-backdrop").hide();
          $window.location.href = '/products';
        });
    };

  });
