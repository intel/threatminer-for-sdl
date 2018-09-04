// controller for adding an asset
angular.module('threat').controller('AddAssetController', function ($http, $window, $q, values) {
  const vm = this
  vm.desc = null

  vm.addAsset = function () {
    const data = ({
      asset_name: vm.name,
      asset_desc: vm.desc
    })
    // posts data to API
    $http.post(`${values.get('api')}/assets`, data).then((response) => {
      $window.location.reload()
    }, (response) => {
      $window.alert("Looks like you're missing some important field(s)!")
    })
  }
})
