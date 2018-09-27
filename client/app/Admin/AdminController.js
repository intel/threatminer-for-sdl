// main controller for the admin console page
angular.module('threat').controller('AdminController', function ($http, values, $routeParams, $window, $base64, ModalService, todelete, identity) {
    const vm = this
    vm.users = []
    vm.threatAdversaries = []
    vm.threatAssets = []
    vm.threatAttackTypes = []
    vm.threatAttackVectors = []
    vm.threatVulnerabilities = []
    vm.productCategories = []
    vm.roles = ['Admin', 'Base']
    vm.feedTypes = []
    vm.newRole = ''

    // edit a row on a table
    vm.editEntry = function (tableName, idFieldName, id, objArray) {
        values.set('tableName', tableName)
        values.set('idFieldname', idFieldName)
        values.set('id', id)
        values.set('objArray', objArray)
        ModalService.showModal({
            templateUrl: 'Admin/editElementModal.html',
            controller: 'EditElementController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens the modal for adding a user
    vm.trainModal = function () {
        ModalService.showModal({
            templateUrl: 'Admin/train.html',
            controller: 'TrainingInfoController'
        }).then((modal) => {
            modal.element.modal({ backdrop: 'static' })
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens the modal for adding a user
    vm.addUserModal = function () {
        ModalService.showModal({
            templateUrl: 'Admin/addUser.html',
            controller: 'GenericAddModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens the modal for adding an adversary type
    vm.addAdversaryModal = function () {
        values.set('typeName', 'addAdversary')
        ModalService.showModal({
            templateUrl: 'Admin/genericAddModal.html',
            controller: 'GenericAddModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens the modal for adding an asset type
    vm.addAssetModal = function () {
        values.set('typeName', 'addAsset')
        ModalService.showModal({
            templateUrl: 'Admin/genericAddModal.html',
            controller: 'GenericAddModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens the modal for adding an attack type
    vm.addAttackTypeModal = function () {
        values.set('typeName', 'addAttackType')
        ModalService.showModal({
            templateUrl: 'Admin/genericAddModal.html',
            controller: 'GenericAddModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens the modal for adding an attack vector
    vm.addAttackVectorModal = function () {
        values.set('typeName', 'addAttackVector')
        ModalService.showModal({
            templateUrl: 'Admin/genericAddModal.html',
            controller: 'GenericAddModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens the modal for adding a vulnerability type
    vm.addVulnerabilityModal = function () {
        values.set('typeName', 'addVulnerability')
        ModalService.showModal({
            templateUrl: 'Admin/genericAddModal.html',
            controller: 'GenericAddModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens the modal for adding a product category
    vm.addProductCategoryModal = function () {
        values.set('typeName', 'addProductCategory')
        ModalService.showModal({
            templateUrl: 'Admin/genericAddModal.html',
            controller: 'GenericAddModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens the modal for adding a new feed type
    vm.addFeedTypeModal = function () {
        values.set('typeName', 'addFeedType')
        ModalService.showModal({
            templateUrl: 'Admin/genericAddModal.html',
            controller: 'GenericAddModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens the modal for confirming the deletion of a user
    vm.deleteUser = function (id) {
        values.set('typeName', 'user')
        values.set('message', 'Are you sure you want to delete this user?')
        todelete.storeID(id)
        ModalService.showModal({
            templateUrl: 'Admin/genericDeleteModal.html',
            controller: 'GenericDeleteModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    vm.updateRole = function (id) {
        var newRole = ({ user_role: vm.newRole })
        $http.put(`${values.get('api')}/users/${id}/role`, newRole).then((respose) => {
            $window.location.reload()
        })
    }

    // opens a modal for the deletion of a threat adversary
    vm.deleteThreatAdversary = function (id) {
        values.set('typeName', 'advType')
        values.set('message', 'Are you sure you want to delete this adversary type?')
        todelete.storeID(id)
        ModalService.showModal({
            templateUrl: 'Admin/genericDeleteModal.html',
            controller: 'GenericDeleteModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens a modal for the deletion of a threat asset
    vm.deleteThreatAsset = function (id) {
        values.set('typeName', 'assetType')
        values.set('message', 'Are you sure you want to delete this asset type?')
        todelete.storeID(id)
        ModalService.showModal({
            templateUrl: 'Admin/genericDeleteModal.html',
            controller: 'GenericDeleteModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens a modal for the deletion of a threat attack type
    vm.deleteThreatAttackType = function (id) {
        values.set('typeName', 'attackType')
        values.set('message', 'Are you sure you want to delete this attack type?')
        todelete.storeID(id)
        ModalService.showModal({
            templateUrl: 'Admin/genericDeleteModal.html',
            controller: 'GenericDeleteModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens a modal for the deletion of a threat attack vector
    vm.deleteThreatAttackVector = function (id) {
        values.set('typeName', 'attackVectorType')
        values.set('message', 'Are you sure you want to delete this attack vector type?')
        todelete.storeID(id)
        ModalService.showModal({
            templateUrl: 'Admin/genericDeleteModal.html',
            controller: 'GenericDeleteModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens a modal for the deletion of a threat vulnerability
    vm.deleteThreatVulnerability = function (id) {
        values.set('typeName', 'vulnerabilityType')
        values.set('message', 'Are you sure you want to delete this vulnerability type?')
        todelete.storeID(id)
        ModalService.showModal({
            templateUrl: 'Admin/genericDeleteModal.html',
            controller: 'GenericDeleteModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // opens a modal for the deletetion of a product category
    vm.deleteProductCategory = function (id) {
        values.set('typeName', 'productCat')
        values.set('message', 'Are you sure you want to delete this ontology category?')
        todelete.storeID(id)
        ModalService.showModal({
            templateUrl: 'Admin/genericDeleteModal.html',
            controller: 'GenericDeleteModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }
    // opens a modal for conifirming the deletion of a threat feed type
    vm.deleteThreatFeed = function (id) {
        values.set('typeName', 'feedType')
        values.set('message', 'Are you sure you want to delete this feed type?')
        todelete.storeID(id)
        ModalService.showModal({
            templateUrl: 'Admin/genericDeleteModal.html',
            controller: 'GenericDeleteModalController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    // retrieves all users from the API
    $http.get(`${values.get('api')}/users`).then((response) => {
        for (var a = 0; a < response.data.length; a++) {
            vm.users.push({
                Name: `${response.data[a].user_firstName} ${response.data[a].user_lastName}`,
                WWID: response.data[a].user_id,
                Email: response.data[a].user_email,
                ID: response.data[a].user_id,
                Role: response.data[a].user_role
            })
        }
    })

    // retrieves all feed types from the API
    $http.get(`${values.get('api')}/feedTypes`).then((response) => {
        for (var e = 0; e < response.data.length; e++) {
            vm.feedTypes.push({
                Title: response.data[e].type_name,
                Desc: response.data[e].type_desc,
                ID: response.data[e].type_id
            })
        }
    })

    // retrieves all adversaries from the API
    $http.get(`${values.get('api')}/adversaries`).then((response) => {
        for (var c = 0; c < response.data.length; c++) {
            vm.threatAdversaries.push({
                Name: response.data[c].adv_name,
                Desc: response.data[c].adv_desc,
                ID: response.data[c].adv_id
            })
        }
    })

    // retrieves all assets from the API
    $http.get(`${values.get('api')}/assets`).then((response) => {
        for (var c = 0; c < response.data.length; c++) {
            vm.threatAssets.push({
                Name: response.data[c].asset_name,
                Desc: response.data[c].asset_desc,
                ID: response.data[c].asset_id
            })
        }
    })

    // retrieves all attack types from the API
    $http.get(`${values.get('api')}/attack_types`).then((response) => {
        for (var c = 0; c < response.data.length; c++) {
            vm.threatAttackTypes.push({
                Name: response.data[c].atktyp_name,
                Desc: response.data[c].atktyp_desc,
                ID: response.data[c].atktyp_id
            })
        }
    })

    // retrieves all attack vectors from the API
    $http.get(`${values.get('api')}/attack_vectors`).then((response) => {
        for (var c = 0; c < response.data.length; c++) {
            vm.threatAttackVectors.push({
                Name: response.data[c].atkvtr_name,
                Desc: response.data[c].atkvtr_desc,
                ID: response.data[c].atkvtr_id
            })
        }
    })

    // retrieves all vulnerabilities from the API
    $http.get(`${values.get('api')}/vulnerabilities`).then((response) => {
        for (var c = 0; c < response.data.length; c++) {
            vm.threatVulnerabilities.push({
                Name: response.data[c].vuln_name,
                Desc: response.data[c].vuln_desc,
                ID: response.data[c].vuln_id
            })
        }
    })

    // //retrieves all product categories
    $http.get(`${values.get('api')}/productCategories`).then((response) => {
        for (var d = 0; d < response.data.length; d++) {
            vm.productCategories.push({
                Name: response.data[d].category_name,
                Desc: response.data[d].category_desc,
                ID: response.data[d].category_id
            })
        }
    })
})
