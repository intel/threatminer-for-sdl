// controller for adding an adversary
angular.module('threat').controller('AddAdvController', function ($http, $window, $q, values) {
    const vm = this
    vm.desc = null

    vm.addAdversary = function () {
        const advData = ({
            adv_name: vm.name,
            adv_desc: vm.desc
        })
        // posts data to API
        $http.post(`${values.get('api')}/adversaries`, advData).then((response) => {
            $window.location.reload()
        }, (response) => {
            $window.alert("Looks like you're missing some important field(s)!")
        })
    }
})
