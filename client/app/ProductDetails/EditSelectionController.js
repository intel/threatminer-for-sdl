// controller for adding a new threat
angular.module('threat').controller('EditSelectionController', function ($http, $window, values, identity) {
    const vm = this
    vm.ratings = ["Don't update Severity", '', '-Low-', '-Medium-', '-High- ', '-Critical-']
    vm.statuses = ["Don't update Status", '', '-New-', '-New N/A-', '-Under Investigation-', '-Fixed-', '-Not an Issue-', '-Advisory-', '-N/A-']
    vm.selectedRating = vm.ratings[0]
    vm.selectedStatus = vm.statuses[0]
    vm.selectedThreatIds = values.get('selectedThreatIds')

    let user
    let name = ''
    try {
        user = identity.GetInfoFromJWT()
    } catch (err) {
        user = null
    }

    // checks to see if the user is an admin and determines whether they can edit a threat or not
    $http.get(`${values.get('api')}/users/${user.identity}`).then((response) => {
        name = `${response.data[0].user_lastName}, ${response.data[0].user_firstName}`
    })

    // updates multiple threats' ratings
    vm.updateRatings = function () {
        return $http.put(`${values.get('api')}/threats/ratings`, { threat_rating: vm.selectedRating, threat_editor: name, threat_ids: vm.selectedThreatIds })
    }

    // updates a threats' statuses
    vm.updateStatuses = function () {
        return $http.put(`${values.get('api')}/threats/statuses`, { threat_status: vm.selectedStatus, threat_editor: name, threat_ids: vm.selectedThreatIds })
    }

    vm.updateThreats = function () {
        const promises = []
        if (vm.selectedRating !== vm.ratings[0]) {
            promises.push(vm.updateRatings())
        }
        if (vm.selectedStatus !== vm.statuses[0]) {
            promises.push(vm.updateStatuses())
        }
        // Once we update ratings and statuses, refresh the page
        Promise.all(promises).then(() => {
            console.log('this is a test')
            $window.location.reload()
        })
    }
})
