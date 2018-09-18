// main controller for the product/ontology detail page
angular.module('threat').controller('ProductDetailController', function ($http, $routeParams, $window, $q, ModalService, identity, todelete, values) {
    const vm = this
    vm.id = $routeParams.productID
    vm.rowCollection = []
    vm.keywords = []
    vm.displayedCollection = []
    vm.adversaries = [{ Name: '', ID: null }]
    vm.productCategories = [{ Name: '', ID: null }]
    vm.severities = ['', '-Low-', '-Medium-', '-High- ', '-Critical-']
    vm.filterstatuses = ['', '-New-', '-New N/A-', '-Under Investigation-', '-Fixed-', '-Not an Issue-', '-Advisory-', '-N/A-']
    vm.statuses = ['', '-New-', '-Under Investigation-', '-Fixed-', '-Not an Issue-', '-Advisory-', '-N/A-']
    let user
    let name = ''

    try {
        user = identity.GetInfoFromJWT()
        // checks if the user is an admin and determines whether they can delete or not
        $http.get(`${values.get('api')}/users/${user.identity}`).then((response) => {
            if (response.data[0].user_role === 'Admin') {
                vm.canDelete = true
            }
            name = `${response.data[0].user_lastName}, ${response.data[0].user_firstName}`
        })
    } catch (err) {
        user = ''
    }
    vm.user = user

    // Convert values of the same key in an associative array to an indexed array
    vm.objArrToIndexedArrByKey = function (assocArray, key) {
        var indexedArray = []
        for (let x = 0; x < assocArray.length; x++) {
            indexedArray[x] = assocArray[x][key]
        }
        return indexedArray
    }

    vm.getSelectedThreatsLength = function () {
        return vm.displayedCollection.filter(threat => threat.isSelected).length
    }

    // retreive all threats for a product
    const threatPromise = $http.get(`${values.get('api')}/products/${vm.id}/threats`)

    // saves the product to the user's watchlist
    vm.saveProduct = function () {
        var productData = ({
            product_id: vm.id
        })
        $http.post(`${values.get('api')}/${user.identity}/savedProducts`, productData).then((response) => {
            $window.alert('Added to Watchlist!')
        }, (response) => {
            $window.alert('This product is already in your watchlist!')
        })
    }

    // opens the modal for editing multiple threats
    vm.editSelectionModal = function () {
        const threatIds = vm.objArrToIndexedArrByKey(vm.displayedCollection.filter(threat => threat.isSelected), 'ID')
        values.set('selectedThreatIds', threatIds)
        ModalService.showModal({
            templateUrl: 'ProductDetails/editSelectionModal.html',
            controller: 'EditSelectionController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then(() => {})
        })
    }

    // opens the modal for adding a threat
    vm.addThreatModal = function () {
        ModalService.showModal({
            templateUrl: 'ProductDetails/addThreatModal.html',
            controller: 'AddThreatController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then(() => {})
        })
    }

    vm.deleteThreatModal = function (id) {
        todelete.storeID(id)
        todelete.storeProductID(vm.id)
        ModalService.showModal({
            templateUrl: 'ProductDetails/deleteThreat.html',
            controller: 'DeleteThreatController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then(() => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens the delete product modal
    vm.deleteProductModal = function () {
        ModalService.showModal({
            templateUrl: 'ProductDetails/deleteProductModal.html',
            controller: 'DeleteProductController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then(() => {
                // vm.message = "You said " + result;
            })
        })
    }
    // opens the delete selecred threats modal
    vm.deleteSelected = function () {
        const toPush = []
        for (var i = 0; i < vm.displayedCollection.length; i++) {
            if (vm.displayedCollection[i].isSelected) {
                toPush.push(vm.displayedCollection[i].ID)
            }
        }
        todelete.storeID(toPush)
        todelete.storeProductID(vm.id)
        ModalService.showModal({
            templateUrl: 'ProductDetails/deleteSelectedThreats.html',
            controller: 'DeleteSelectedThreatsController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then(() => {
                // vm.message = "You said " + result;
            })
        })
    }

    vm.updateThreatStatus = function (id) {
        var threatData = ({
            threat_status: vm.newStatus,
            threat_editor: name
        })
        $http.put(`${values.get('api')}/threats/${id}/status`, threatData).then((response) => {
            $window.location.reload()
        })
    }

    vm.updateThreatSeverity = function (id) {
        $http.put(`${values.get('api')}/threats/${id}/rating`, { threat_rating: vm.newSeverity, threat_editor: name }).then((response) => {
            $window.location.reload()
        })
    }

    // updates the name of a product
    vm.updateName = function () {
        const productData = ({
            product_name: vm.productName,
            product_editor: name
        })
        $http.put(`${values.get('api')}/products/${vm.id}/name`, productData).then((response) => {
        })
    }

    // updates the description of the product
    vm.updateDesc = function () {
        const productData = ({
            product_desc: vm.productDesc,
            product_editor: name
        })
        $http.put(`${values.get('api')}/products/${vm.id}/desc`, productData).then((response) => {
        })
    }
    // updates the category of the product
    vm.updateCategory = function () {
        const productData = ({
            category_id: vm.category.ID,
            product_editor: name
        })
        $http.put(`${values.get('api')}/products/${vm.id}/category`, productData).then((response) => {
        })
    }
    // adds keywords for a product
    const addKeywords = function () {
        for (var q = 0; q < vm.keywords.length; q++) {
            const keywordData = ({
                keyword: vm.keywords[q].text,
                product_editor: name
            })
            $http.post(`${values.get('api')}/products/${vm.id}/keywords`, keywordData).then((response) => {
            })
        }
    }
    // updates the keywords for a product
    vm.updateKeywords = function () {
        $http.delete(`${values.get('api')}/products/${vm.id}/keywords`).then((response) => {
            addKeywords()
        })
    }

    // starts the train of adding threats to the table
    threatPromise.then((response) => {
        for (var c = 0; c < response.data.length; c++) {
            getCategoryName(response.data[c].threat_id, response.data[c].threat_title, response.data[c].threat_desc, response.data[c].threat_link,
                response.data[c].adv_id, response.data[c].threat_rating, response.data[c].threat_status, response.data[c].threat_date)
        }
    })

    vm.formatDateString = function (dateString) {
        const date = new Date(dateString)
        // If month or day is less than 10, place a "0" in front to match style of other tables
        const month = (date.getUTCMonth() + 1 < 10) ? `0${(date.getUTCMonth() + 1).toString()}` : date.getUTCMonth() + 1
        const day = (date.getUTCDate() < 10) ? `0${(date.getUTCDate()).toString()}` : date.getUTCDate()
        return `${month}/${day}/${date.getUTCFullYear().toString().slice(-2)}`
    }

    const getCategoryName = function (id, title, desc, link, advId, rating, status, date) {
        getAdversaryName(id, title, desc, link, advId, rating, status, date)
    }

    const getAdversaryName = function (id, title, desc, link, advId, rating, status, date) {
        let advName
        if (advId != null) {
            console.log(advId)
            $http.get(`${values.get('api')}/adversaries/${advId}`).then((response) => {
                advName = response.data[0].adv_name
                insertRow(id, title, desc, link, advName, rating, status, date)
            })
        } else {
            advName = ''
            insertRow(id, title, desc, link, advName, rating, status, date)
        }
    }

    const insertRow = function (id, title, desc, link, advName, rating, status, date) {
        if (rating === null) {
            rating = ''
        }
        if (status === null) {
            status = '-New-'
        }
        vm.rowCollection.push({
            ID: id, Title: title, Description: desc, Link: link, Adversary: angular.copy(advName), Severity: rating, Status: status, date: new Date(date)
        })
    }

    // gets all of the adversaries
    $http.get(`${values.get('api')}/adversaries`)
        .then((response) => {
            for (var a = 0; a < response.data.length; a++) {
                vm.adversaries.push({ Name: response.data[a].adv_name, ID: response.data[a].adv_id })
            }
        })
    // gets all of the product categories
    $http.get(`${values.get('api')}/productCategories`)
        .then((response) => {
            for (var b = 0; b < response.data.length; b++) {
                vm.productCategories.push({ Name: response.data[b].category_name, ID: response.data[b].category_id })
            }
        })
    // gets specific details about a product
    $http.get(`${values.get('api')}/products/${vm.id}`)
        .then((response) => {
            vm.category = response.data[0].category_name
            vm.productName = response.data[0].product_name
            vm.productDesc = response.data[0].product_desc
            vm.editor = response.data[0].product_editor
        })

    // gets all of the keywords for a product
    $http.get(`${values.get('api')}/products/${vm.id}/keywords`)
        .then((response) => {
            for (var i = 0; i < response.data.length; i++) {
                vm.keywords.push(response.data[i].keyword)
            }
        })
})
