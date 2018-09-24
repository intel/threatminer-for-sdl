// controller for the watchlist page
angular.module('threat').controller('WatchlistController', function ($http, $window, $q, identity, todelete, ModalService, values) {
    const vm = this
    let user
    let id = null
    vm.ProductRowCollection = []
    vm.ThreatRowCollection = []

    try {
        user = identity.GetInfoFromJWT()
        id = user.identity
    } catch (err) {
        user = null
    }

    // gets all of the saved threats
    $http.get(`${values.get('api')}/${id}/savedThreats`).then((response) => {
        for (let i = 0; i < response.data.length; i++) {
            vm.ThreatRowCollection.push({
                ID: response.data[i].threat_id,
                Title: response.data[i].threat_title,
                Description: response.data[i].threat_desc,
                Severity: response.data[i].threat_rating,
                Status: response.data[i].threat_status
            })
        }
    })
    // gets the category name and pushes a row to the table
    const getCatName = function (id, name, desc, cat) {
        if (cat != null) {
            $http.get(`${values.get('api')}/productCategories/${cat}`).then((response) => {
                const categoryName = response.data[0].categoryName
                vm.ProductRowCollection.push({
                    Name: name,
                    Description: desc,
                    ID: id,
                    Category: categoryName
                })
            })
        } else {
            vm.ProductRowCollection.push({
                Name: name,
                Description: desc,
                ID: id,
                Category: 'None'
            })
        }
    }
    // gets all of the saved products
    $http.get(`${values.get('api')}/${id}/savedProducts`).then((response) => {
        for (let i = 0; i < response.data.length; i++) {
            getCatName(response.data[i].product_id,
                response.data[i].product_name,
                response.data[i].product_desc, response.data[i].category_id)
        }
    })

    // opens the modal to unfollow a threat
    vm.unfollowThreatModal = function (id) {
        todelete.storeID(id)
        ModalService.showModal({
            templateUrl: 'Watchlist/unfollowThreat.html',
            controller: 'UnfollowThreatController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then(() => {
            })
        })
    }

    // opens the modal to unfollow a product
    vm.unfollowProductModal = function (id) {
        todelete.storeID(id)
        ModalService.showModal({
            templateUrl: 'Watchlist/unfollowProduct.html',
            controller: 'UnfollowProductController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then(() => {
            })
        })
    }
})
