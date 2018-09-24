// controller for adding a new product category
angular.module('threat').controller('AddProdCatController', function ($http, $window, $q, values) {
    const vm = this
    vm.desc = null

    vm.addProductCategory = function () {
        const productData = ({
            category_name: vm.name,
            category_desc: vm.desc
        })
        // posts data to api
        $http.post(`${values.get('api')}/productCategories`, productData).then((response) => {
            $window.location.reload()
        }, (response) => {
            $window.alert("Looks like you're missing some important field(s)!")
        })
    }
})
