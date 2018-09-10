// controller to delete an adversary type
angular.module('threat').controller('DeleteAdvTypesController', function ($http, $window, todelete, values) {
  const vm = this
  const id = todelete.getID()

  vm.confirmDelete = function () {
    $http.delete(`${values.get('api')}/adversaries/${id}`).then((response) => {
      todelete.storeID(null)
      $window.location.reload()
    })
  }
})
