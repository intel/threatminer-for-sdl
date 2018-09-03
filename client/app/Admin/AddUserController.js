// controller for adding a user
angular.module('threat').controller('AddUserController', function ($http, $window, $q, values) {
  const vm = this
  vm.roles = ['Base', 'Admin']
  vm.email = null

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
      return alert('Your passwords do not match!')
    }
    // posting the data to the api
    if (vm.username) {
      $http.post(`${values.get('api')}/users`, userData).then((response) => {
        // reloads the page
        $window.location.reload()
      }, (response) => {
        alert("Looks like you're missing some important field(s)!")
      })
    }
  }
})
