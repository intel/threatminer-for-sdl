//controller for the login page
angular.module('threat').controller('LoginController', function ($http, $routeParams, $window, $location, ModalService, identity) {
        var vm = this;
        vm.hasUsers = false;
        vm.name = "";
        vm.isLoggedIn = false;
        vm.logOut = function() {
            identity.removeToken();
            window.location.href = location.origin + '/login'
        }
        
        if (identity.isIdentify() != false) {
            vm.isLoggedIn = true;
            user = identity.GetInfoFromJWT();
            id = user.identity;
            $http.get('http://127.0.0.1:5000/users/'+id).then(function(response){
                vm.name = response.data[0]["user_firstName"] + " " + response.data[0]["user_lastName"];
            });
        }

        //opens the modal for adding a user
        vm.addUserModal = function() {
             ModalService.showModal({
                 templateUrl: 'Logon/addUser.html',
                 controller: 'AddFirstuserController'
             }).then(function(modal) {
                 modal.element.modal();
                 modal.close.then(function(result) {
                     //vm.message = "You said " + result;
                 });
             });
         };

        $http.get('http://127.0.0.1:5000/users/hasUsers').then(function(response){
            if (response.data == "False") {
                vm.addUserModal()
            }
        });
        //vm.login = login;
        vm.login = function(){
            var userData = ({
              username: vm.username,
              password: vm.password
            });
            $http.post('http://127.0.0.1:5000/auth', userData).then(function(response){
                identity.storeToken(response.data["access_token"])
                $window.location.href = location.origin
            }, function errorCallback(response){
                alert("Either your username or password is incorrect.")
            });
        }
});

angular.module('threat').controller('AddFirstuserController', function($http, $window, $q) {
  var vm = this;
  vm.role = "Admin";
  vm.email = null;

  vm.addUser = function(){
    //data to send to the API
    var userData = ({
      user_username : vm.username,
      user_firstName: vm.firstName,
      user_lastName: vm.lastName,
      user_role: vm.role,
      user_email: vm.email,
      user_password: vm.password1
    });
    if (vm.password1 != vm.password2) {
        return alert("Your passwords do not match!")
    }
    //posting the data to the api
    $http.post('http://127.0.0.1:5000/users/firstUser', userData).then(function(response){
      //reloads the page
      $window.location.reload();
    }, function errorCallback(response){
        alert("Looks like you're missing some important field(s)!")
    });
  }
});
