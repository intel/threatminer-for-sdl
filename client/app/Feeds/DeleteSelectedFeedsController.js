// controller for the modal that deletes selected feeds rather than just one
angular.module('threat').controller('DeleteSelectedFeedsController', function ($http, $window, $q, $routeParams, todelete, values) {
    const vm = this
    const feedIds = todelete.getID()
    var promiseArray = []
    vm.amount = feedIds.length

    vm.confirmDelete = function () {
        for (var t = 0; t < feedIds.length; t++) {
            promiseArray.push($http.delete(`${values.get('api')}/feeds/${feedIds[t]}`))
        }
        $q.all(promiseArray).then((dataArray) => {
            todelete.storeID(null)
            $window.location.reload()
        })
    }
})
