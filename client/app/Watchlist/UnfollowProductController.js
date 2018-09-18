// controller for the unfollowing of a product
angular.module('threat').controller('UnfollowProductController', function ($http, $window, $q, identity, todelete, values) {
    const vm = this
    let user
    var id = null
    id = todelete.getID()

    try {
        user = identity.GetInfoFromJWT()
        id = user.identity
    } catch (err) {
        user = null
    }

    vm.confirmDelete = function () {
        $http.delete(`${values.get('api')}/${id}/savedProducts/${todelete.getID()}`).then((respnse) => {
            todelete.storeID(null)
            $window.location.reload()
        })
    }
})
