//controller for deleting a product modal
angular.module('threat').controller('DeleteproductController', function($http, $window, $q, $routeParams, values) {
    var vm = this;
    var productID = $routeParams.productID;


    vm.confirmDelete = function(){
        console.log(productID)
        $http.delete(values.get('api') + '/products/' + productID).then(function(response){
          $(".modal-backdrop").hide();
          $window.location.href = '/ontologies';
        });
    };

  });
