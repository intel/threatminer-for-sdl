//controller for deleting a product modal
angular.module('threat').controller('DeleteproductController', function($http, $window, $q, $routeParams) {
    var vm = this;
    var productID = $routeParams.productID;


    vm.confirmDelete = function(){
        console.log(productID)
        $http.delete('http://127.0.0.1:5000/products/' + productID).then(function(response){
          $(".modal-backdrop").hide();
          $window.location.href = '/ontologies';
        });
    };

  });
