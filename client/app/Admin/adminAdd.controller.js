//controller for adding a user
angular.module('threat').controller('AdduserController', function($http, $window, $q, values) {
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
		if (vm.username) {
			$http.post(values.get('api') + '/users', userData).then(function(response){
				//reloads the page
				$window.location.reload();
			}, function errorCallback(response){
					alert("Looks like you're missing some important field(s)!")
			});
		}
  }
});

//controller for adding an adversary
angular.module('threat').controller('AddadvController', function($http, $window, $q, values) {
  var vm = this;
  vm.desc = null;

  vm.addAdversary = function(){
      var advData = ({
        adv_name : vm.name,
        adv_desc: vm.desc
      });
      //posts data to API
      $http.post(values.get('api') + '/adversaries', advData).then(function(response){
        $window.location.reload();
      }, function errorCallback(response){
          alert("Looks like you're missing some important field(s)!")
      });
    }
});

//controller for adding an asset
angular.module('threat').controller('AddAssetController', function($http, $window, $q, values) {
  var vm = this;
  vm.desc = null;

  vm.addAsset = function(){
      var data = ({
        asset_name : vm.name,
        asset_desc: vm.desc
      });
      //posts data to API
      $http.post(values.get('api') + '/assets', data).then(function(response){
        $window.location.reload();
      }, function errorCallback(response){
          alert("Looks like you're missing some important field(s)!")
      });
    }
});

//controller for adding an attack type
angular.module('threat').controller('AddAttackTypeController', function($http, $window, $q, values) {
  var vm = this;
  vm.desc = null;

  vm.addAttackType = function(){
      var data = ({
        atktyp_name : vm.name,
        atktyp_desc: vm.desc
      });
      //posts data to API
      $http.post(values.get('api') + '/attack_types', data).then(function(response){
        $window.location.reload();
      }, function errorCallback(response){
          alert("Looks like you're missing some important field(s)!")
      });
    }
});

//controller for adding an attack vector
angular.module('threat').controller('AddAttackVectorController', function($http, $window, $q, values) {
  var vm = this;
  vm.desc = null;

  vm.addAttackVector = function(){
      var data = ({
        atkvtr_name : vm.name,
        atkvtr_desc: vm.desc
      });
      //posts data to API
      $http.post(values.get('api') + '/attack_vectors', data).then(function(response){
        $window.location.reload();
      }, function errorCallback(response){
          alert("Looks like you're missing some important field(s)!")
      });
    }
});

//controller for adding a vulnerability
angular.module('threat').controller('AddVulnerabilityController', function($http, $window, $q, values) {
  var vm = this;
  vm.desc = null;

  vm.addVulnerability = function(){
      var data = ({
        vuln_name : vm.name,
        vuln_desc: vm.desc
      });
      //posts data to API
      $http.post(values.get('api') + '/vulnerabilities', data).then(function(response){
        $window.location.reload();
      }, function errorCallback(response){
          alert("Looks like you're missing some important field(s)!")
      });
    }
});

//controller for adding a new product category
angular.module('threat').controller('AddprodcatController', function($http, $window, $q, values) {
  var vm = this;
  vm.desc = null;

  vm.addProductCategory = function(){
    var productData = ({
      category_name : vm.name,
      category_desc: vm.desc
    });
    //posts data to api
    $http.post(values.get('api') + '/productCategories', productData).then(function(response){
      $window.location.reload();
    }, function errorCallback(response){
        alert("Looks like you're missing some important field(s)!")
    });
  }

});

//controller for adding a new feed type
angular.module('threat').controller('AddfeedtypeController', function($http, $window, $q, values) {
  var vm = this;
  vm.desc = null;

  vm.addfeedType = function(){
    var feedData = ({
      type_name : vm.name,
      type_desc: vm.desc
    });
    //posting the data to the api
    $http.post(values.get('api') + '/feedTypes', feedData).then(function(response){
      $window.location.reload();
    }, function errorCallback(response){
        alert("Looks like you're missing some important field(s)!")
    });
  }

});

//controller for adding a new feed type
angular.module('threat').controller('addTraininginfoController', function($http, $window, $q) {
  var vm = this;


});
