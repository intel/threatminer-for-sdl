// controller for the login page
angular.module('threat').controller('LoginController', function ($http, $routeParams, $window, $location, ModalService, identity, values) {
    const vm = this
    vm.hasUsers = false
    vm.name = ''
    vm.isLoggedIn = false
    vm.logOut = function () {
        identity.removeToken()
        $window.location.href = `${$location.origin}/login`
    }

    if (identity.isIdentify() !== false) {
        vm.isLoggedIn = true
        var user = identity.GetInfoFromJWT()
        var id = user.identity
        $http.get(`${values.get('api')}/users/${id}`).then((response) => {
            vm.name = `${response.data[0].user_firstName} ${response.data[0].user_lastName}`
        })
    }

    // opens the modal for adding a user
    vm.addUserModal = function () {
        ModalService.showModal({
            templateUrl: 'Logon/addUser.html',
            controller: 'AddFirstUserController'
        }).then((modal) => {
            modal.element.modal()
            modal.close.then((result) => {
                // vm.message = "You said " + result;
            })
        })
    }

    $http.get(`${values.get('api')}/users/hasUsers`).then((response) => {
        console.log(response)
        if (response.data === 'False') {
            vm.addUserModal()
        }
    })
    // vm.login = login;
    vm.login = function () {
        const userData = ({
            username: vm.username,
            password: vm.password
        })
        $http.post(`${values.get('api')}/auth`, userData).then((response) => {
            identity.storeToken(response.data.access_token)
            $window.location.href = $location.origin
        }, (response) => {
            $window.alert('Either your username or password is incorrect.')
        })
    }
})
