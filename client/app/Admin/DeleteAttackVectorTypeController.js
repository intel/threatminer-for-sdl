// controller to delete an attack vector type
angular.module('threat').controller('DeleteAttackVectorTypeController', function ($http, $window, todelete, values) {
  const vm = this
  const id = todelete.getID()

  vm.confirmDelete = function () {
    $http.delete(`${values.get('api')}/attack_vectors/${id}`).then((response) => {
      todelete.storeID(null)
      $window.location.reload()
    })
  }
})
