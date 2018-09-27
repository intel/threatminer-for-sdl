// generic controller for adding items
angular.module('threat').controller('GenericAddModalController', function ($http, $window, $q, values) {
    const vm = this
    vm.desc = null
    vm.roles = ['Base', 'Admin']
    vm.email = null

    vm.addAdversary = function () {
        const advData = ({
            adv_name: vm.name,
            adv_desc: vm.desc
        })
        // posts data to API
        $http.post(`${values.get('api')}/adversaries`, advData).then((response) => {
            $window.location.reload()
        }, (response) => {
            $window.alert("Looks like you're missing some important field(s)!")
        })
    }
    vm.addAsset = function () {
        const data = ({
            asset_name: vm.name,
            asset_desc: vm.desc
        })
        // posts data to API
        $http.post(`${values.get('api')}/assets`, data).then((response) => {
            $window.location.reload()
        }, (response) => {
            $window.alert("Looks like you're missing some important field(s)!")
        })
    }
    vm.addAttackType = function () {
        const data = ({
            atktyp_name: vm.name,
            atktyp_desc: vm.desc
        })
        // posts data to API
        $http.post(`${values.get('api')}/attack_types`, data).then((response) => {
            $window.location.reload()
        }, (response) => {
            $window.alert("Looks like you're missing some important field(s)!")
        })
    }
    vm.addAttackVector = function () {
        const data = ({
            atkvtr_name: vm.name,
            atkvtr_desc: vm.desc
        })
        // posts data to API
        $http.post(`${values.get('api')}/attack_vectors`, data).then((response) => {
            $window.location.reload()
        }, (response) => {
            $window.alert("Looks like you're missing some important field(s)!")
        })
    }
    vm.addFeedType = function () {
        const feedData = ({
            type_name: vm.name,
            type_desc: vm.desc
        })
        // posting the data to the api
        $http.post(`${values.get('api')}/feedTypes`, feedData).then((response) => {
            $window.location.reload()
        }, (response) => {
            $window.alert("Looks like you're missing some important field(s)!")
        })
    }
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
    vm.addUser = function () {
    // data to send to the API
        const userData = ({
            user_username: vm.username,
            user_firstName: vm.firstName,
            user_lastName: vm.lastName,
            user_role: vm.selectedRole,
            user_email: vm.email,
            user_password: vm.password1
        })
        if (vm.password1 !== vm.password2) {
            return $window.alert('Your passwords do not match!')
        }
        // posting the data to the api
        if (vm.username) {
            $http.post(`${values.get('api')}/users`, userData).then((response) => {
                // reloads the page
                $window.location.reload()
            }, (response) => {
                $window.alert("Looks like you're missing some important field(s)!")
            })
        }
    }
    vm.addVulnerability = function () {
        const data = ({
            vuln_name: vm.name,
            vuln_desc: vm.desc
        })
        // posts data to API
        $http.post(`${values.get('api')}/vulnerabilities`, data).then((response) => {
            $window.location.reload()
        }, (response) => {
            $window.alert("Looks like you're missing some important field(s)!")
        })
    }
})
