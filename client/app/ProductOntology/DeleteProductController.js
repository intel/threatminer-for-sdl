// controller for deleting a product modal
angular.module('threat').controller('DeleteProductController', function ($http, $window, $q, $routeParams, todelete, values) {
  const vm = this
  const productID = todelete.getID()

  vm.confirmDelete = function () {
    console.log(productID)
    $http.delete(`${values.get('api')}/products/${productID}`).then((response) => {
      $('.modal-backdrop').hide()
      $window.location.href = '/ontologies'
    })
  }
})
