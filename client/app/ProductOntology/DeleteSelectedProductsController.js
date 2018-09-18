// controller that deletes a selected number of products
angular.module('threat').controller('DeleteSelectedProductsController', function ($http, $window, $q, $routeParams, todelete, values) {
    const vm = this
    const productIds = todelete.getID()
    var promiseArray = []
    vm.amount = productIds.length

    vm.confirmDelete = function () {
        for (var t = 0; t < productIds.length; t++) {
            promiseArray.push($http.delete(`${values.get('api')}/products/${productIds[t]}`))
        }
        $q.all(promiseArray).then((dataArray) => {
            todelete.storeID(null)
            $window.location.reload()
        })
    }
})
