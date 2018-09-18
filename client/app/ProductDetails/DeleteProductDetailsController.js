// controller for deleting a product modal
angular.module('threat').controller('DeleteProductDetailsController', function ($http, $window, $q, $routeParams, values) {
    const vm = this
    const productID = $routeParams.productID

    vm.confirmDelete = function () {
        $http.delete(`${values.get('api')}/products/${productID}`).then((response) => {
            $window.location.href = '/ontologies'
        })
    }
})
