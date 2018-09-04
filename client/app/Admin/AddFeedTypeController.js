// controller for adding a new feed type
angular.module('threat').controller('AddFeedTypeController', function ($http, $window, $q, values) {
  const vm = this
  vm.desc = null

  vm.addfeedType = function () {
    const feedData = ({
      type_name: vm.name,
      type_desc: vm.desc
    })
    // posting the data to the api
    $http.post(`${values.get('api')}/feedTypes`, feedData).then((response) => {
      $window.location.reload()
    }, (response) => {
      $window.alert("Looks like you're missing some important field(s)!")
    })
  }
})
