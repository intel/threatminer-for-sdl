//controller for the unfollowing of a threat
angular.module('threat').controller('UnfollowthreatController', function($http, $window, $q, identity, todelete, values) {
  var vm = this;
  var user;
  var id = null;

  try{
   user = identity.GetInfoFromJWT();
   id = user.identity;
 } catch(err) {
   user = null
 }

vm.confirmDelete = function(){

  $http.delete(values.get('api') + '/'+id+'/savedThreats/'+ todelete.getID()).then(function(respnse){
    todelete.storeID(null);
    $window.location.reload();
  });

};

});

//controller for the unfollowing of a product
angular.module('threat').controller('UnfollowproductController', function($http, $window, $q, identity, todelete) {
  var vm = this;
  var user;
  var id = null;
  var id = todelete.getID();

  try{
   user = identity.GetInfoFromJWT();
   id = user.identity;
 } catch(err) {
   user = null
 }


vm.confirmDelete = function(){

  $http.delete(values.get('api') + '/'+id+'/savedProducts/'+todelete.getID()).then(function(respnse){
    todelete.storeID(null);
    $window.location.reload();
  });

}

});
