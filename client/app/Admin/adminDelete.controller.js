//this file contains the controllers for deleting various entities on the admin page.
// each controller is for a different entitiy but they all function very similarly
angular.module('threat').controller('DeleteuserController', function($http, $window, todelete, values) {
  var vm = this;
  //uses the toDelete service to retrive the ID from the adnmin controller
  var id = todelete.getID();

  vm.confirmDelete = function(){
    //deletes the user with a specific id
    $http.delete(values.get('api') + '/users/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});

//controller for deleting a feed type
angular.module('threat').controller('DeletefeedtypeController', function($http, $window, todelete, values) {
  var vm = this;
  var id = todelete.getID();

  vm.confirmDelete = function(){
    $http.delete(values.get('api') + '/feedTypes/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});

//controller to delete an adversary type
angular.module('threat').controller('DeleteadvtypesController', function($http, $window, todelete, values) {
  var vm = this;
  var id = todelete.getID();

  vm.confirmDelete = function(){
    $http.delete(values.get('api') + '/adversaries/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});

//controller to delete an asset type
angular.module('threat').controller('DeleteAssetTypeController', function($http, $window, todelete, values) {
  var vm = this;
  var id = todelete.getID();

  vm.confirmDelete = function(){
    $http.delete(values.get('api') + '/assets/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});

//controller to delete an attack type
angular.module('threat').controller('DeleteAttackTypeController', function($http, $window, todelete, values) {
  var vm = this;
  var id = todelete.getID();

  vm.confirmDelete = function(){
    $http.delete(values.get('api') + '/attack_types/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});

//controller to delete an attack vector type
angular.module('threat').controller('DeleteAttackVectorTypeController', function($http, $window, todelete, values) {
  var vm = this;
  var id = todelete.getID();

  vm.confirmDelete = function(){
    $http.delete(values.get('api') + '/attack_vectors/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});

//controller to delete a vulnerability type
angular.module('threat').controller('DeleteVulnerabilityTypeController', function($http, $window, todelete, values) {
  var vm = this;
  var id = todelete.getID();

  vm.confirmDelete = function(){
    $http.delete(values.get('api') + '/vulnerabilities/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});


angular.module('threat').controller('DeleteprodcatController', function($http, $window, todelete, values) {
  var vm = this;
  var id = todelete.getID();

  vm.confirmDelete = function(){
    $http.delete(values.get('api') + '/productCategories/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});
