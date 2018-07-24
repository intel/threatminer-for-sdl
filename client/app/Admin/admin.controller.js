//main controller for the admin console page
angular.module('threat').controller('AdminController', function($http, $routeParams, $window, $base64, ModalService, todelete, identity) {
var vm = this;
vm.users = [];
vm.threatCategories = [];
vm.threatAdversaries = [];
vm.productCategories= [];
vm.roles = ["Admin", "Base"]
vm.feedTypes = [];
vm.string = "Hello";
vm.newRole = "";
vm.logOut = function() {
    identity.removeToken();
    window.location.href = location.origin + '/login'
}

//opens the modal for adding a user
vm.addUserModal = function() {
     ModalService.showModal({
         templateUrl: 'Admin/addUser.html',
         controller: 'AdduserController'
     }).then(function(modal) {
         modal.element.modal();
         modal.close.then(function(result) {
             //vm.message = "You said " + result;
         });
     });
 };
//opens the modal for adding a threat category
 vm.addThreatCatModal = function() {
      ModalService.showModal({
          templateUrl: 'Admin/addThreatCat.html',
          controller: 'AddthreatcatController'
      }).then(function(modal) {
          modal.element.modal();
          modal.close.then(function(result) {
              //vm.message = "You said " + result;
          });
      });
  };
//opens the modal for adding an adversary type
  vm.addAdversaryModal = function() {
       ModalService.showModal({
           templateUrl: 'Admin/addAdversary.html',
           controller: 'AddadvController'
       }).then(function(modal) {
           modal.element.modal();
           modal.close.then(function(result) {
               //vm.message = "You said " + result;
           });
       });
   };
//opens the modal for adding a product category
   vm.addProductCategoryModal = function() {
        ModalService.showModal({
            templateUrl: 'Admin/addProductCat.html',
            controller: 'AddadvController'
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                //vm.message = "You said " + result;
            });
        });
    };

//opens the modal for adding a new feed type
    vm.addFeedTypeModal = function() {
         ModalService.showModal({
             templateUrl: 'Admin/AddFeedType.html',
             controller: 'AddfeedtypeController'
         }).then(function(modal) {
             modal.element.modal();
             modal.close.then(function(result) {
                 //vm.message = "You said " + result;
             });
         });
     };

//opens the modal for confirming the deletion of a user
     vm.deleteUser = function(id) {
          todelete.storeID(id);
          ModalService.showModal({
              templateUrl: 'Admin/deleteUser.html',
              controller: 'DeleteuserController'
          }).then(function(modal) {
              modal.element.modal();
              modal.close.then(function(result) {
                  //vm.message = "You said " + result;
              });
          });
      };

      vm.updateRole = function(id){
        new_role = ({"user_role" : vm.newRole})
        $http.put('http://127.0.0.1:5000/users/' + id + '/role', new_role).then(function(respose){
          $window.location.reload();
        });

      }
//opens the modal for confirming the deletiong of a threat category
      vm.deleteThreatCategory = function(id) {
           todelete.storeID(id);
           ModalService.showModal({
               templateUrl: 'Admin/deleteThreatCat.html',
               controller: 'DeletethreatcatController'
           }).then(function(modal) {
               modal.element.modal();
               modal.close.then(function(result) {
                   //vm.message = "You said " + result;
               });
           });
       };
//opens a modal for the deletion of a threat adversary
       vm.deleteThreatAdversary = function(id) {
            todelete.storeID(id);
            ModalService.showModal({
                templateUrl: 'Admin/deleteAdversaryType.html',
                controller: 'DeleteadvtypesController'
            }).then(function(modal) {
                modal.element.modal();
                modal.close.then(function(result) {
                    //vm.message = "You said " + result;
                });
            });
        };
//opens a modal for the deletetion of a product category
        vm.deleteProductCategory = function(id) {
             todelete.storeID(id);
             ModalService.showModal({
                 templateUrl: 'Admin/deleteProductCategory.html',
                 controller: 'DeleteprodcatController'
             }).then(function(modal) {
                 modal.element.modal();
                 modal.close.then(function(result) {
                     //vm.message = "You said " + result;
                 });
             });
         };
//opens a modal for conifirming the deletion of a threat feed type
         vm.deleteThreatFeed = function(id) {
              todelete.storeID(id);
              ModalService.showModal({
                  templateUrl: 'Admin/deleteFeedType.html',
                  controller: 'DeletefeedtypeController'
              }).then(function(modal) {
                  modal.element.modal();
                  modal.close.then(function(result) {
                      //vm.message = "You said " + result;
                  });
              });
          };


//retrieves all users from the API
$http.get('http://127.0.0.1:5000/users').then(function(response){
  for(a=0; a<response.data.length; a++){

    vm.users.push({ Name: response.data[a]['user_firstName'] + " " +response.data[a]['user_lastName'],
                               Username: response.data[a]['user_username'], Email: response.data[a]['user_email'],
                               ID: response.data[a]['user_id'], Role: response.data[a]['user_role']});
  }
});

//retrieves all threat categories from the API
$http.get('http://127.0.0.1:5000/threatCategories').then(function(response){
  for(b=0; b<response.data.length; b++){

    vm.threatCategories.push({ Name: response.data[b]['category_name'],
                               Desc: response.data[b]['category_desc'],
                             ID: response.data[b]['category_id']});
  }
});

//retrieves all feed types from the API
$http.get('http://127.0.0.1:5000/feedTypes').then(function(response){
  for(e=0; e<response.data.length; e++){

    vm.feedTypes.push({Title: response.data[e]['type_name'],
                               Desc: response.data[e]['type_desc'],
                             ID: response.data[e]['type_id']});
  }
});

//retrieves all adversaries from the API
$http.get('http://127.0.0.1:5000/adversaries').then(function(response){
  for(c=0; c<response.data.length; c++){

    vm.threatAdversaries.push({ Name: response.data[c]['adv_name'],
                               Desc: response.data[c]['adv_desc'],
                             ID: response.data[c]['adv_id']});
  }
});

////retrieves all product categories
$http.get('http://127.0.0.1:5000/productCategories').then(function(response){
  for(d=0; d<response.data.length; d++){

   vm.productCategories.push({ Name: response.data[d]['category_name'],
                               Desc: response.data[d]['category_desc'],
                             ID: response.data[d]['category_id']});
  }
});


});
