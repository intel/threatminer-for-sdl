//controller for deleting a product modal
angular.module('threat').controller('DeleteproductmodalController', function($http, $window, $q, $routeParams, todelete, values) {
    var vm = this;
    var productID = todelete.getID();


    vm.confirmDelete = function(){
        console.log(productID)
        $http.delete(values.get('api') + '/products/' + productID).then(function(response){
          $(".modal-backdrop").hide();
          $window.location.href = '/ontologies';
        });
    };

  });
