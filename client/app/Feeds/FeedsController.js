// This is controller for the feeds page
angular.module('threat')
    .controller('FeedsController', function ($http, ModalService, $window, $q, identity, todelete, values) {
        const vm = this
        vm.rowCollection = []
        vm.feedTypes = ['']
        let user
        try {
            user = identity.GetInfoFromJWT()
        } catch (err) {
        }

        // edit a row on a table
        vm.editEntry = function (tableName, idFieldName, id, objArray) {
            values.set('tableName', tableName)
            values.set('idFieldname', idFieldName)
            values.set('id', id)
            values.set('objArray', objArray)
            ModalService.showModal({
                templateUrl: 'Feeds/editElementModal.html',
                controller: 'EditElementController'
            }).then((modal) => {
                modal.element.modal()
                modal.close.then((result) => {
                    // vm.message = "You said " + result;
                })
            })
        }

        // opens a modal to delete any selected feeds
        vm.deleteSelectedFeeds = function () {
            var toPush = []
            console.log(vm.displayedCollection)
            for (var t = 0; t < vm.displayedCollection.length; t++) {
                if (vm.displayedCollection[t].isSelected) {
                    toPush.push(vm.displayedCollection[t].feed_id)
                }
            }
            console.log(toPush)
            todelete.storeID(toPush)
            ModalService.showModal({
                templateUrl: 'Feeds/deleteSelectedFeeds.html',
                controller: 'DeleteSelectedFeedsController'
            }).then((modal) => {
                modal.element.modal()
                modal.close.then((result) => {
                    // vm.message = "You said " + result;
                })
            })
        }

        if (user != null) {
            // checks if the user is an admin to check whether they can add or not
            $http.get(`${values.get('api')}/users/${user.identity}`).then((response) => {
                if (response.data[0].user_role === 'Admin') {
                    vm.canAdd = true
                }
            })
        }
        // retrives all feed types for filter
        $http.get(`${values.get('api')}/feedTypes`).then((response) => {
            for (var j = 0; j < response.data.length; j++) {
                vm.feedTypes.push(response.data[j].type_name)
            }
        })

        // opens the modal to add a new feed
        vm.addFeedModal = function () {
            ModalService.showModal({
                templateUrl: 'Feeds/addFeedModal.html',
                controller: 'AddFeedController'
            }).then((modal) => {
                modal.element.modal()
                modal.close.then((result) => {
                    // vm.message = "You said " + result;
                })
            })
        }

        // opens the modal to confrim the deletion of a feed
        vm.deleteFeedModal = function (id) {
            todelete.storeID(id)

            ModalService.showModal({
                templateUrl: 'Feeds/deleteFeed.html',
                controller: 'DeleteFeedController',
                inputs: {
                    feed: id
                }

            }).then((modal) => {
                modal.element.modal()
                modal.close.then((result) => {
                    // vm.message = "You said " + result;
                })
            })
        }

        // loads all feeds into table
        $http.get(`${values.get('api')}/feeds`)
            .then((response) => {
                vm.rowCollection = response.data
            })
    // retrives what feed category a feed is within the row of the table
    // const getTypeName = function (title, link, desc, id, typeId) {
    //   if (typeId != null) {
    //     $http.get(`${values.get('api')}/feedTypes/${typeId}`).then((response) => {
    //       vm.rowCollection.push({
    //         Title: title, Link: link, Description: desc, ID: id, Type: response.data[0].type_name
    //       })
    //     })
    //   } else {
    //     vm.rowCollection.push({
    //       Title: title, Link: link, Description: desc, ID: id, Type: ''
    //     })
    //   }
    // }
    })
