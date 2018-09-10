// controller for adding an attack vector
angular.module('threat').controller('AddAttackVectorController', function ($http, $window, $q, values) {
  const vm = this
  vm.desc = null

  vm.addAttackVector = function () {
    const data = ({
      atkvtr_name: vm.name,
      atkvtr_desc: vm.desc
    })
    // posts data to API
    $http.post(`${values.get('api')}/attack_vectors`, data).then((response) => {
      $window.location.reload()
    }, (response) => {
      $window.alert("Looks like you're missing some important field(s)!")
    })
  }
})
