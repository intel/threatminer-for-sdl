//this file contains the controllers for deleting various entities on the admin page.
// each controller is for a different entitiy but they all function very similarly
angular.module('threat').controller('DeleteuserController', function($http, $window, todelete) {
  var vm = this;
  //uses the toDelete service to retrive the ID from the adnmin controller
  var id = todelete.getID();

  vm.confirmDelete = function(){
    //deletes the user with a specific id
    $http.delete('http://127.0.0.1:5000/users/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});

//controller for deleting a feed type
angular.module('threat').controller('DeletefeedtypeController', function($http, $window, todelete) {
  var vm = this;
  var id = todelete.getID();

  vm.confirmDelete = function(){
    $http.delete('http://127.0.0.1:5000/feedTypes/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});

//controller for deleting a threat category
angular.module('threat').controller('DeletethreatcatController', function($http, $window, todelete) {
  var vm = this;
  var id = todelete.getID();

  vm.confirmDelete = function(){
    $http.delete('http://127.0.0.1:5000/threatCategories/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});

//controller for delete an adversary type
angular.module('threat').controller('DeleteadvtypesController', function($http, $window, todelete) {
  var vm = this;
  var id = todelete.getID();

  vm.confirmDelete = function(){
    $http.delete('http://127.0.0.1:5000/adversaries/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});


angular.module('threat').controller('DeleteprodcatController', function($http, $window, todelete) {
  var vm = this;
  var id = todelete.getID();

  vm.confirmDelete = function(){
    $http.delete('http://127.0.0.1:5000/productCategories/'+ id).then(function(response){
      todelete.storeID(null);
      $window.location.reload();
    });
  }
});
