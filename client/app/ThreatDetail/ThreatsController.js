// controller for the threat detail page
angular.module('threat').controller('ThreatsController', function ($http, $routeParams, $window, $base64, ModalService, identity, todelete, values) {
    const vm = this
    vm.rowCollection = []
    vm.adversaries = [{ Name: '', ID: null }]
    vm.owners = [{ Name: '', ID: null }]
    vm.statuses = ['', '-New-', '-Under Investigation-', '-Fixed-', '-Not an Issue-', '-Advisory-', '-N/A-']
    vm.ratings = ['', '-Low-', '-Medium-', '-High-', '-Critical-']
    vm.adversaryTypes = []
    vm.assets = []
    vm.attackTypes = []
    vm.attackVectors = []
    vm.vulnerabilities = []
    // For sorting classification alphabetically before displaying
    let currentSortProp = ''

    // retrieves the threat ID from the url
    const threatID = $routeParams.threatID
    let user
    let name = ''
    try {
        user = identity.GetInfoFromJWT()
        // checks to see if the user is an admin and determines whether they can edit a threat or not
        $http.get(`${values.get('api')}/users/${user.identity}`).then((response) => {
            if (response.data[0].user_role === 'Admin') {
                vm.canEdit = true
            }
            name = `${response.data[0].user_lastName}, ${response.data[0].user_firstName}`
        })
    } catch (err) {
        user = null
    }
    vm.user = user

    // adds the ability to save a threat to the watchlist
    vm.saveThreat = function () {
        const threatData = ({
            threat_id: vm.threatID
        })

        $http.post(`${values.get('api')}/${user.identity}/savedThreats`, threatData).then((response) => {
            $window.alert('Added to Watchlist!')
        }, (response) => {
            $window.alert('This threat is already in your watchlist!')
        })
    }

    // opens modal for retraining the threat
    vm.trainModal = function (defaultClassificationType) {
        values.set('threatClassification', vm.classification)
        values.set('threatDescription', vm.desc)
        values.set('threatID', vm.threatID)
        values.set('name', name)
        if (defaultClassificationType) {
            values.set('defaultType', defaultClassificationType)
        }
        ModalService.showModal({
            templateUrl: 'ThreatDetail/train.html',
            controller: 'TrainingThreatController'
        }).then((modal) => {
            modal.element.modal({ backdrop: 'static' })
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens a modal to delete the particular threat
    vm.deleteThreatModal = function () {
        ModalService.showModal({
            templateUrl: 'ThreatDetail/deleteThreat.html',
            controller: 'DeleteThreatController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then(() => {
            })
        })
    }

    // updates a threat adversary
    vm.updateAdversary = function () {
        const threatData = ({
            adv_id: vm.selectedAdversary.ID,
            threat_editor: name
        })
        $http.put(`${values.get('api')}/threats/${threatID}/adversary`, threatData).then((response) => {

        })
    }

    // updates a threat's owner
    vm.updateOwner = function () {
        const threatData = ({
            threat_owner: vm.selectedOwner.ID,
            threat_editor: name
        })
        $http.put(`${values.get('api')}/threats/${threatID}/owner`, threatData).then((response) => {

        })
    }

    // updates a threat's status
    vm.updateStatus = function () {
        const threatData = ({
            threat_status: vm.selectedStatus,
            threat_editor: name
        })
        $http.put(`${values.get('api')}/threats/${threatID}/status`, threatData).then((response) => {

        })
    }

    // updates a threat's rating
    vm.updateRating = function () {
        const threatData = ({
            threat_rating: vm.selectedRating,
            threat_editor: name
        })
        $http.put(`${values.get('api')}/threats/${threatID}/rating`, threatData).then((response) => {

        })
    }

    // updates a threat's note
    vm.updateNote = function () {
        const threatData = ({
            threat_note: vm.notes,
            threat_editor: name
        })
        $http.put(`${values.get('api')}/threats/${threatID}/note`, threatData).then((response) => {

        })
    }

    // gets all of the adversary types
    $http.get(`${values.get('api')}/adversaries`).then((response) => {
        for (var b = 0; b < response.data.length; b++) {
            vm.adversaries.push({
                Name: response.data[b].adv_name,
                ID: response.data[b].adv_id
            })
        }
    })

    $http.get(`${values.get('api')}/threats/${threatID}/adversaries`).then((response) => {
        currentSortProp = 'adv_name'
        vm.adversaryTypes = response.data.sort(vm.sortAlphabetically)
    })

    $http.get(`${values.get('api')}/threats/${threatID}/assets`).then((response) => {
        currentSortProp = 'asset_name'
        vm.assets = response.data.sort(vm.sortAlphabetically)
    })

    $http.get(`${values.get('api')}/threats/${threatID}/attack_types`).then((response) => {
        currentSortProp = 'atktyp_name'
        vm.attackTypes = response.data.sort(vm.sortAlphabetically)
    })

    $http.get(`${values.get('api')}/threats/${threatID}/attack_vectors`).then((response) => {
        currentSortProp = 'atkvtr_name'
        vm.attackVectors = response.data.sort(vm.sortAlphabetically)
    })

    $http.get(`${values.get('api')}/threats/${threatID}/vulnerabilities`).then((response) => {
        currentSortProp = 'vuln_name'
        vm.vulnerabilities = response.data.sort(vm.sortAlphabetically)
    })

    vm.sortAlphabetically = function (a, b) {
        const nameA = a[currentSortProp].toUpperCase() // ignore upper and lowercase
        const nameB = b[currentSortProp].toUpperCase() // ignore upper and lowercase

        if (nameA < nameB) return -1
        if (nameA > nameB) return 1
        // names must be equal
        return 0
    }

    // Convert values of the same key in an associative array to an indexed array
    vm.objArrToIndexedArrByKey = function (assocArray, key) {
        var indexedArray = []
        for (let x = 0; x < assocArray.length; x++) {
            indexedArray[x] = assocArray[x][key]
        }
        return indexedArray
    }

    // gets all of the users
    $http.get(`${values.get('api')}/users`).then((response) => {
        for (var c = 0; c < response.data.length; c++) {
            vm.owners.push({
                Name: `${response.data[c].user_firstName} ${response.data[c].user_lastName}`,
                ID: response.data[c].user_id
            })
        }
    })

    // gets the details of the threat
    $http.get(`${values.get('api')}/threats/${threatID}`).then((response) => {
        vm.threatID = response.data[0].threat_id
        vm.title = response.data[0].threat_title
        vm.desc = response.data[0].threat_desc
        vm.classification = response.data[0].threat_classification
        vm.link = response.data[0].threat_link
        vm.status = response.data[0].threat_status
        vm.date = response.data[0].threat_date
        const feedId = response.data[0].feedId
        vm.threat_rating = response.data[0].threat_rating
        const ownerId = response.data[0].threat_owner
        vm.note = response.data[0].threat_note
        const advId = response.data[0].advId
        const productId = response.data[0].productId
        vm.editor = response.data[0].threat_editor

        getFeedName(feedId)
        getOwnerName(ownerId)
        getAdversaryName(advId)
        getProductName(productId)
    })

    // gets all of the affected products
    $http.get(`${values.get('api')}/threats/${threatID}/affected`).then((response) => {
        for (var i = 0; i < response.data.length; i++) {
            getCatName(response.data[i].product_id, response.data[i].product_name, response.data[i].product_desc, response.data[i].catgory_id)
        }
    })

    // gets the name of the category of the threat
    var getCatName = function (id, name, desc, catId) {
        if (catId != null) {
            $http.get(`${values.get('api')}/productCategories/${catId}`).then((response) => {
                const cat = response.data[0].category_name
                vm.rowCollection.push({
                    ID: id, Name: name, Desc: desc, category: cat
                })
            })
        } else {
            vm.rowCollection.push({
                ID: id, Name: name, Desc: desc, category: 'None'
            })
        }
    }

    // gets the name of the feed this threat came from
    var getFeedName = function (id) {
        if (id != null) {
            $http.get(`${values.get('api')}/feeds/${id}`).then((response) => {
                vm.feedName = response.data[0].feed_title
            })
        } else {
            vm.feedName = 'None'
        }
    }

    var getProductName = function (id) {
        if (id != null) {
            $http.get(`${values.get('api')}/products/${id}`).then((response) => {
                vm.productName = response.data[0].product_name
            })
        } else {
            vm.productName = 'None'
        }
    }

    // gets the name of the owner of the threat
    var getOwnerName = function (id) {
        if (id != null) {
            $http.get(`${values.get('api')}/users/${id}`).then((response) => {
                vm.owner = `${response.data[0].user_firstName} ${response.data[0].user_lastName}`
            })
        } else {
            vm.owner = 'No Owner'
        }
    }

    // gets the name of the adversary of the threat
    var getAdversaryName = function (id) {
        if (id != null) {
            $http.get(`${values.get('api')}/adversaries/${id}`).then((response) => {
                vm.adversaryName = response.data[0].adv_name
            })
        } else {
            vm.adversaryName = 'None'
        }
    }
})
