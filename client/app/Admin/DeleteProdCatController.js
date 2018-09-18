angular.module('threat').controller('DeleteProdCatController', function ($http, $window, todelete, values) {
    const vm = this
    const id = todelete.getID()

    vm.confirmDelete = function () {
        $http.delete(`${values.get('api')}/productCategories/${id}`).then((response) => {
            todelete.storeID(null)
            $window.location.reload()
        })
    }
})
