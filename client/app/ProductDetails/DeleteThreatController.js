// controller for the delete threat modal
angular.module('threat').controller('DeleteThreatController', function ($http, $routeParams, $window, ModalService, todelete, values) {
  const vm = this
  const threatID = todelete.getID()
  const productID = $routeParams.productID
  vm.confirmDelete = function () {
    $http.delete(`${values.get('api')}/products/${productID}/threats/${threatID}`).then((response) => {
      todelete.storeID(null)
      $window.location.reload()
    })
  }
})
