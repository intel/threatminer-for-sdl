// controller for the add product modal
angular.module('threat').controller('AddProductController', function ($http, $window, $q, identity, values) {
    const vm = this
    vm.categories = [{ Name: '', Id: null }]
    vm.product_desc = null
    vm.selectedCat = { Name: '', Id: null }
    vm.keywords = []
    const promiseArray = []
    let user
    let name = ''

    try {
        user = identity.GetInfoFromJWT()
        $http.get(`${values.get('api')}/users/${user.identity}`).then((response) => {
            name = `${response.data[0].user_lastName}, ${response.data[0].user_firstName}`
        })
    } catch (err) {
        user = null
        name = 'Unauthorized'
    }

    // gets all the product categories
    $http.get(`${values.get('api')}/productCategories`).then((response) => {
        for (var k = 0; k < response.data.length; k++) {
            vm.categories.push({
                Name: response.data[k].category_name,
                Id: response.data[k].category_id
            })
        }
    })

    // adds keywords
    var insertKeywords = function (id, keywords) {
        for (var k = 0; k < keywords.length; k++) {
            const keywordData = ({
                keyword: keywords[k].text,
                product_editor: name
            })
            promiseArray.push($http.post(`${values.get('api')}/products/${id}/keywords`, keywordData))
        }

        $q.all(promiseArray).then((dataArray) => {
            $window.location.reload()
        })
    }

    vm.formatDateString = function (dateObj) {
        const date = dateObj
        // If month or day is less than 10, place a "0" in front to match style of other tables
        const month = (date.getUTCMonth() + 1 < 10) ? `0${(date.getUTCMonth() + 1).toString()}` : date.getUTCMonth() + 1
        const day = (date.getUTCDate() < 10) ? `0${(date.getUTCDate()).toString()}` : date.getUTCDate()
        return `${month}/${day}/${date.getUTCFullYear().toString().slice(-2)}`
    }

    // adds a product
    vm.addProduct = function () {
        if (vm.selectedCat.Id != null) {
            var productData = ({
                product_name: vm.product_name,
                product_desc: vm.product_desc,
                category_id: vm.selectedCat.Id,
                product_editor: name,
                product_updated: vm.formatDateString(new Date())
            })
        }

        if (vm.selectedCat.Id == null) {
            productData = ({
                product_name: vm.product_name,
                product_desc: vm.product_desc,
                product_editor: name,
                product_updated: vm.formatDateString(new Date())
            })
        }

        const addProductPromise = $http.post(`${values.get('api')}/products`, productData)

        addProductPromise.then((response) => {
            var productId = angular.copy(response.data[0]['max(product_id)'])
            insertKeywords(productId, vm.keywords)
        }, (response) => {
            $window.alert("Looks like you're missing some important field(s)!")
        })
    }
})
