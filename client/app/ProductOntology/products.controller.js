// controller for the product's page
angular.module('threat')
  .controller('ProductsController', function($http,$q, $window, ModalService, identity, todelete) {
    var vm = this;
    vm.rowCollection = [];
    vm.categories = [{Name: ""}, {Name: "None"}];
    var promiseArray = [];
    var productsCallPromise = $http.get('http://127.0.0.1:5000/products');
    var user;
    try{
      user = identity.GetInfoFromJWT();
    }
    catch(err){
      user = null;
    }

    if (user != null) {
        //checks if user is an admin and determines if they have editing capabilities
        $http.get('http://127.0.0.1:5000/users/' + user.identity).then(function(response){
          if(response.data[0]['user_role'] === 'Admin'){
            vm.canEdit = true;
          }
        });
    }

    //opens the mdal to delete selected threats
    vm.deleteSelectedProducts = function(){
      var toPush = [];
      for(u=0; u<vm.displayedCollection.length; u++){
        if(vm.displayedCollection[u].isSelected){
         toPush.push(vm.displayedCollection[u]['product_id'])
      }
    }
      todelete.storeID(toPush);
      ModalService.showModal({
          templateUrl: 'ProductOntology/deleteSelectedProducts.html',
          controller: 'DeleteselectedproductsController'
      }).then(function(modal) {
          modal.element.modal();
          modal.close.then(function() {
              //vm.message = "You said " + result;
          });
      });
  }


    //gets all of the product categories for filtering
    $http.get('http://127.0.0.1:5000/productCategories')
    .success(function(response){
      for(j=0; j<response.length; j++){
        vm.categories.push({Name:response[j]['category_name']})
      }
    });

    productsCallPromise.then(function(response){
      vm.rowCollection = response.data;

    });

    //opens the add product modal
      vm.addProductModal = function() {
           ModalService.showModal({
               templateUrl: 'ProductOntology/addProduct.html',
               controller: 'AddproductController'
           }).then(function(modal) {
               modal.element.modal();
               modal.close.then(function() {
                   //vm.message = "You said " + result;
               });
           });
       };



       vm.deleteProductModal = function(id) {
            todelete.storeID(id)
            ModalService.showModal({
                templateUrl: 'ProductOntology/deleteProduct.html',
                controller: 'DeleteproductmodalController'
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function() {
                    //vm.message = "You said " + result;
                });
            });
        };
 });
