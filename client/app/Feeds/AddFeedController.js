// controller to add a new feed to the system
angular.module('threat').controller('AddFeedController', function ($http, $window, $q, values) {
    const vm = this
    vm.feedTypes = [{ Name: '', ID: null }]
    vm.feed_desc = null
    vm.selectedType = [{ Name: '', ID: null }]

    // fills the drop down for selecting a feed type
    $http.get(`${values.get('api')}/feedTypes`).then((response) => {
        for (var l = 0; l < response.data.length; l++) {
            vm.feedTypes.push({
                Name: response.data[l].type_name,
                ID: response.data[l].type_id
            })
        }
    })
    // starts up the modal for adding a new feed
    vm.addFeed = function () {
        if (vm.selectedType.ID != null) {
            var feedData = ({
                feed_title: vm.feed_title,
                feed_link: vm.feed_link,
                feed_desc: vm.feed_desc,
                feed_type: vm.selectedType.ID
            })
        }
        if (vm.selectedType.ID == null) {
            feedData = ({
                feed_title: vm.feed_title,
                feed_link: vm.feed_link,
                feed_desc: vm.feed_desc
            })
        }

        const addFeedPromise = $http.post(`${values.get('api')}/feeds`, feedData)

        addFeedPromise.then((response) => {
            $window.location.reload()
        }, (response) => {
            $window.alert("Looks like you're missing some important field(s)!")
        })
    }
})
