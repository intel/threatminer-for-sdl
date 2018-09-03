// controller to delete an asset type
angular.module('threat').controller('DeleteAssetTypeController', function ($http, $window, todelete, values) {
  const vm = this
  const id = todelete.getID()

  vm.confirmDelete = function () {
    $http.delete(`${values.get('api')}/assets/${id}`).then((response) => {
      todelete.storeID(null)
      $window.location.reload()
    })
  }
})
