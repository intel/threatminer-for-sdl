// this file contains the controllers for deleting various entities on the admin page.
// each controller is for a different entitiy but they all function very similarly
angular.module('threat').controller('DeleteUserController', function ($http, $window, todelete, values) {
  const vm = this
  // uses the toDelete service to retrive the ID from the adnmin controller
  const id = todelete.getID()

  vm.confirmDelete = function () {
    // deletes the user with a specific id
    $http.delete(`${values.get('api')}/users/${id}`).then((response) => {
      todelete.storeID(null)
      $window.location.reload()
    })
  }
})
