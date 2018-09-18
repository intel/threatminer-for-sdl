// controller for deleting a feed type
angular.module('threat').controller('DeleteFeedTypeController', function ($http, $window, todelete, values) {
    const vm = this
    const id = todelete.getID()

    vm.confirmDelete = function () {
        $http.delete(`${values.get('api')}/feedTypes/${id}`).then((response) => {
            todelete.storeID(null)
            $window.location.reload()
        })
    }
})
