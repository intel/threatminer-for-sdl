// controller for the product's page
angular.module('threat')
  .controller('ProductsController', function ($http, $q, $window, ModalService, identity, todelete, values) {
    const vm = this
    vm.rowCollection = []
    vm.categories = [{ Name: '' }, { Name: 'None' }]
    const productsCallPromise = $http.get(`${values.get('api')}/products`)
    let user
    try {
      user = identity.GetInfoFromJWT()
    } catch (err) {
      user = null
    }

    if (user != null) {
      // checks if user is an admin and determines if they have editing capabilities
      $http.get(`${values.get('api')}/users/${user.identity}`).then((response) => {
        if (response.data[0].user_role === 'Admin') {
          vm.canEdit = true
        }
      })
    }

    // opens the mdal to delete selected threats
    vm.deleteSelectedProducts = function () {
      const toPush = []
      for (var u = 0; u < vm.displayedCollection.length; u++) {
        if (vm.displayedCollection[u].isSelected) {
          toPush.push(vm.displayedCollection[u].product_id)
        }
      }
      todelete.storeID(toPush)
      ModalService.showModal({
        templateUrl: 'ProductOntology/deleteSelectedProducts.html',
        controller: 'DeleteselectedproductsController'
      }).then((modal) => {
        modal.element.modal()
        modal.close.then(() => {
          // vm.message = "You said " + result;
        })
      })
    }

    // gets all of the product categories for filtering
    $http.get(`${values.get('api')}/productCategories`)
      .success((response) => {
        for (var j = 0; j < response.length; j++) {
          vm.categories.push({ Name: response[j].category_name })
        }
      })

    productsCallPromise.then((response) => {
      vm.rowCollection = response.data
      for (let x = 0; x < vm.rowCollection.length; x++) {
        if ((vm.rowCollection[x].product_updated !== ' ') && (vm.rowCollection[x].product_updated !== '')) {
          vm.rowCollection[x].product_updated = new Date(vm.rowCollection[x].product_updated)
        } else {
          vm.rowCollection[x].product_updated = new Date(1970, 1, 1)
        }
      }
    })

    vm.formatDateString = function (dateObj) {
      const date = dateObj
      if (date.getUTCFullYear() > 1975) {
        // If month or day is less than 10, place a "0" in front to match style of other tables
        const month = (date.getUTCMonth() + 1 < 10) ? `0${(date.getUTCMonth() + 1).toString()}` : date.getUTCMonth() + 1
        const day = (date.getUTCDate() < 10) ? `0${(date.getUTCDate()).toString()}` : date.getUTCDate()
        if (isNaN(month)) {
          return ''
        }
        return `${month}/${day}/${date.getUTCFullYear().toString().slice(-2)}`
      }
      return ''
    }

    // opens the add product modal
    vm.addProductModal = function () {
      ModalService.showModal({
        templateUrl: 'ProductOntology/addProduct.html',
        controller: 'AddproductController'
      }).then((modal) => {
        modal.element.modal()
        modal.close.then(() => {
          // vm.message = "You said " + result;
        })
      })
    }

    vm.deleteProductModal = function (id) {
      todelete.storeID(id)
      ModalService.showModal({
        templateUrl: 'ProductOntology/deleteProduct.html',
        controller: 'DeleteproductmodalController'
      }).then((modal) => {
        modal.element.modal()
        modal.close.then(() => {
          // vm.message = "You said " + result;
        })
      })
    }
  })
