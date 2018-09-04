// controller for deleting a threat
angular.module('threat').controller('DeleteThreatController', function ($http, $window, $q, $routeParams, values) {
  const vm = this
  const threatID = $routeParams.threatID

  vm.confirmDelete = function () {
    console.log(threatID)
    $http.delete(`${values.get('api')}/threats/${threatID}`).then((response) => {
      $window('.modal-backdrop').hide()
      $window.location.href = '/products'
    })
  }
})
