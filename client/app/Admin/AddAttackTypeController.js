// controller for adding an attack type
angular.module('threat').controller('AddAttackTypeController', function ($http, $window, $q, values) {
  const vm = this
  vm.desc = null

  vm.addAttackType = function () {
    const data = ({
      atktyp_name: vm.name,
      atktyp_desc: vm.desc
    })
    // posts data to API
    $http.post(`${values.get('api')}/attack_types`, data).then((response) => {
      $window.location.reload()
    }, (response) => {
      $window.alert("Looks like you're missing some important field(s)!")
    })
  }
})
