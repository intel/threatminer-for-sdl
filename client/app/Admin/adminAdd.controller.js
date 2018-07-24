//controller for adding a user
angular.module('threat').controller('AdduserController', function($http, $window, $q) {
  var vm = this;
  vm.roles = ["Base", "Admin"];
  vm.email = null;

  vm.addUser = function(){
    //data to send to the API
    var userData = ({
      user_username : vm.username,
      user_firstName: vm.firstName,
      user_lastName: vm.lastName,
      user_role: vm.selectedRole,
      user_email: vm.email,
      user_password: vm.password1
    });
    if (vm.password1 != vm.password2) {
        return alert("Your passwords do not match!")
    }
    //posting the data to the api
    $http.post('http://127.0.0.1:5000/users', userData).then(function(response){
      //reloads the page
      $window.location.reload();
    }, function errorCallback(response){
        alert("Looks like you're missing some important field(s)!")
    });
  }
});

//controller for adding a user
angular.module('threat').controller('AddthreatcatController', function($http, $window, $q) {
  var vm = this;
  vm.desc = null;

  vm.addThreatCategory = function(){
    var threatData = ({
      category_name : vm.name,
      category_desc: vm.desc
    });
    //posts data to API
    $http.post('http://127.0.0.1:5000/threatCategories', threatData).then(function(response){
      $window.location.reload();
    }, function errorCallback(response){
        alert("Looks like you're missing some important field(s)!")
    });
  }
});

//controler for adding an adversary
angular.module('threat').controller('AddadvController', function($http, $window, $q) {
  var vm = this;
  vm.desc = null;

  vm.addAdversary = function(){
      var advData = ({
        adv_name : vm.name,
        adv_desc: vm.desc
      });
      //posts data to API
      $http.post('http://127.0.0.1:5000/adversaries', advData).then(function(response){
        $window.location.reload();
      }, function errorCallback(response){
          alert("Looks like you're missing some important field(s)!")
      });
    }
});

//controller for adding a new product category
angular.module('threat').controller('AddprodcatController', function($http, $window, $q) {
  var vm = this;
  vm.desc = null;

  vm.addProductCategory = function(){
    var productData = ({
      category_name : vm.name,
      category_desc: vm.desc
    });
    //posts data to api
    $http.post('http://127.0.0.1:5000/productCategories', productData).then(function(response){
      $window.location.reload();
    }, function errorCallback(response){
        alert("Looks like you're missing some important field(s)!")
    });
  }

});

//controller for adding a new feed type
angular.module('threat').controller('AddfeedtypeController', function($http, $window, $q) {
  var vm = this;
  vm.desc = null;

  vm.addfeedType = function(){
    var feedData = ({
      type_name : vm.name,
      type_desc: vm.desc
    });
    //posting the data to the api
    $http.post('http://127.0.0.1:5000/feedTypes', feedData).then(function(response){
      $window.location.reload();
    }, function errorCallback(response){
        alert("Looks like you're missing some important field(s)!")
    });
  }

});
