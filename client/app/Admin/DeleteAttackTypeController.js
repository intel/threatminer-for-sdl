// controller to delete an attack type
angular.module('threat').controller('DeleteAttackTypeController', function ($http, $window, todelete, values) {
    const vm = this
    const id = todelete.getID()

    vm.confirmDelete = function () {
        $http.delete(`${values.get('api')}/attack_types/${id}`).then((response) => {
            todelete.storeID(null)
            $window.location.reload()
        })
    }
})
