// controller for the unfollowing of a threat
angular.module('threat').controller('UnfollowThreatController', function ($http, $window, $q, identity, todelete, values) {
  const vm = this
  let user
  let id = null

  try {
    user = identity.GetInfoFromJWT()
    id = user.identity
  } catch (err) {
    user = null
  }

  vm.confirmDelete = function () {
    $http.delete(`${values.get('api')}/${id}/savedThreats/${todelete.getID()}`).then((respnse) => {
      todelete.storeID(null)
      $window.location.reload()
    })
  }
})
