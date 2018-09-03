// the controller for the delete feed modal
angular.module('threat').controller('DeleteFeedController', function ($http, $window, todelete, values) {
  const vm = this
  const id = todelete.getID()
  vm.confirmDelete = function () {
    $http.delete(`${values.get('api')}/feeds/${id}`).then((response) => {
      todelete.storeID(null)
      $window.location.reload()
    })
  }
})
