// controller for deleting a selected amount of threats
angular.module('threat').controller('DeleteSelectedThreatsController', function ($http, $window, $q, $routeParams, todelete, values) {
    const vm = this
    const threatIds = todelete.getID()
    const productID = todelete.getProductID()
    var promiseArray = []
    vm.amount = threatIds.length

    vm.confirmDelete = function () {
        for (var t = 0; t < threatIds.length; t++) {
            promiseArray.push($http.delete(`${values.get('api')}/products/${productID}/threats/${threatIds[t]}`))
        }
        $q.all(promiseArray).then((dataArray) => {
            todelete.storeID(null)
            todelete.storeProductID(null)
            $window.location.reload()
        })
    }
})
