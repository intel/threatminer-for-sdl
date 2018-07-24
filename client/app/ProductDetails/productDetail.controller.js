//main controller for the product/ontology detail page
angular.module('threat').controller('ProductdetailController', function($http, $routeParams, $window, $q,  ModalService, identity, todelete) {
    var vm = this;
    vm.id = $routeParams.productID;
    vm.rowCollection = [];
    vm.keywords = [];
    vm.cat_id;
    vm.categories = [{Name:"None", ID:null}];
    vm.adversaries = [{Name:"", ID:null}];
    vm.productCategories = [{Name:"", ID:null}];
    vm.severities = ["", "-Low-", "-Medium-", "-High- ", "-Critical-"];
    vm.filterstatuses = ["", "-New-", "-New N/A-", "-Under Investigation-", "-Fixed-", "-Not an Issue-", "-Advisory-", "-N/A-"];
    vm.statuses = ["", "-New-", "-Under Investigation-", "-Fixed-", "-Not an Issue-", "-Advisory-", "-N/A-"];
    var promiseArray = [];
    var user;
    var name = "";

    try{
        user = identity.GetInfoFromJWT();
        name = user.displayName;
    }
    catch(err){
      user = ""
    }

    //checks if the user is an admin and determines whether they can delete or not
    $http.get('http://127.0.0.1:5000/users/' + user.identity).then(function(response){
      if(response.data[0]['user_role'] === 'Admin'){
        vm.canDelete = true;
      }
    });

    //retreive all threats for a product
    var threatPromise = $http.get('http://127.0.0.1:5000/products/'+vm.id+'/threats');

    //saves the product to the user's watchlist
    vm.saveProduct = function() {
      productData = ({
        product_id: vm.id
      });
      $http.post('http://127.0.0.1:5000/'+user.identity+'/savedProducts', productData).then(function(response){
        alert("Added to Watchlist!")
      },  function errorCallback(response){
          alert("This product is already in your watchlist!")
      });
    };

    //opens the modal for adding a threat
    vm.addThreatModal = function() {
         ModalService.showModal({
             templateUrl: 'ProductDetails/addThreatModal.html',
             controller: 'AddthreatController'
         }).then(function(modal) {
             modal.element.modal();


             modal.close.then(function() {

             });
         });
     };


     vm.deleteThreatModal = function(id) {
        todelete.storeID(id);
        todelete.storeProductID(vm.id);
          ModalService.showModal({
              templateUrl: 'ProductDetails/deleteThreat.html',
              controller: 'DeletethreatmodalController'
          }).then(function(modal) {
              modal.element.modal();
              modal.close.then(function() {
                  //vm.message = "You said " + result;
              });
          });
      };

    //opens the delete product modal
     vm.deleteProductModal = function() {
          ModalService.showModal({
              templateUrl: 'ProductDetails/deleteProductModal.html',
              controller: 'DeleteproductController'
          }).then(function(modal) {
              modal.element.modal();
              modal.close.then(function() {
                  //vm.message = "You said " + result;
              });
          });
      };
      //opens the delete selecred threats modal
      vm.deleteSelected = function() {
        var toPush = [];
        for(i = 0; i<vm.displayedCollection.length; i++){
          if(vm.displayedCollection[i].isSelected){
           toPush.push(vm.displayedCollection[i]['ID']);
          }
        }
           todelete.storeID(toPush);
           todelete.storeProductID(vm.id);
           ModalService.showModal({
               templateUrl: 'ProductDetails/deleteSelectedThreats.html',
               controller: 'DeleteselectedthreatsController'
           }).then(function(modal) {
               modal.element.modal();
               modal.close.then(function() {
                   //vm.message = "You said " + result;
               });
           });
       };

    vm.updateThreatStatus = function(id){
      threatData = ({threat_status : vm.newStatus,
                    threat_editor:name});
      $http.put('http://127.0.0.1:5000/threats/'+ id + '/status', threatData).then(function(response){
        $window.location.reload()


      });

    }


    vm.updateThreatSeverity = function(id) {
      threatData = ({threat_rating : vm.newSeverity,
                    threat_editor:name});
      $http.put('http://127.0.0.1:5000/threats/'+ id+ '/rating', threatData).then(function(response){
        $window.location.reload()
      });
    };



    vm.updateThreatCategory = function(id){
      threatData = ({category_id : vm.newCategory['ID'],
                    threat_editor:name});
      $http.put('http://127.0.0.1:5000/threats/'+ id+ '/category', threatData).then(function(response){
        $window.location.reload()
      });
    }
    // updates the name of a product
     vm.updateName = function(){
       var productData = ({product_name: vm.productName,
       product_editor: name});
       $http.put('http://127.0.0.1:5000/products/'+vm.id+'/name', productData).then(function(response){
       });
     }

     //updates the description of the product
     vm.updateDesc = function(){
       var productData = ({product_desc: vm.productDesc,
       product_editor:name});
       $http.put('http://127.0.0.1:5000/products/'+vm.id+'/desc', productData).then(function(response){
       });
     }
     //updates the category of the product
     vm.updateCategory = function(){
       var productData = ({category_id: vm.category.ID,
       product_editor:name});
       $http.put('http://127.0.0.1:5000/products/'+vm.id+'/category', productData).then(function(response){
       });
     }
     //updates the keywords for a product
     vm.updateKeywords = function(){
       $http.delete('http://127.0.0.1:5000/products/'+vm.id+'/keywords').then(function(response){
         addKeywords();
       });
     };
     //adds keywords for a product
     addKeywords = function(){
       for(q=0; q<vm.keywords.length; q++){
         var keywordData = ({keyword: vm.keywords[q]['text'],
          product_editor: name});
         $http.post('http://127.0.0.1:5000/products/'+vm.id+'/keywords', keywordData).then(function(response){
         });
       }
     };

     //starts the train of adding threats to the table
    threatPromise.then(function(response){

      for(c=0; c<response.data.length; c++){
          getCategoryName(response.data[c]['threat_id'], response.data[c]['threat_title'], response.data[c]['threat_desc'], response.data[c]['threat_link'], response.data[c]['category_id'],
          response.data[c]['adv_id'], response.data[c]['threat_rating'], response.data[c]['threat_status'], response.data[c]['threat_date']);
        }

    });


    getCategoryName = function(id, title, desc, link, cat_id, adv_id, rating, status, date){
      var catName;
      if(cat_id !=null){
        $http.get('http://127.0.0.1:5000/threatCategories/'+cat_id).then(function(response){
          catName = response.data[0]['category_name'];
          getAdversaryName(id, title, desc, link, catName, adv_id, rating, status, date);
        })
      }else {
        catName = ""
        getAdversaryName(id, title, desc, link, catName, adv_id, rating, status, date);
      }
    }

    getAdversaryName = function(id, title, desc, link, catName, adv_id, rating, status, date){
      var advName;
      if(adv_id != null){
        $http.get('http://127.0.0.1:5000/adversaries/'+adv_id).then(function(response){
        advName = response.data[0]['adv_name'];
        insertRow(id, title, desc, link, catName, advName, rating, status, date)
      });
      }else{
        advName = "";
        insertRow(id, title, desc, link, catName, advName, rating, status, date)
     }
    }

   insertRow = function(id, title, desc, link, catName, advName, rating, status, date){
     if(rating === null){
       rating = ""
     }
     if(status === null){
       status = "-New-"
     }
     vm.rowCollection.push({ ID: id, Title:title, Description: desc, Link:link, Category: angular.copy(catName), Adversary: angular.copy(advName), Severity: rating, Status: status, date: date})
   }

//gets all of the adversaries
    $http.get('http://127.0.0.1:5000/adversaries').
        then(function(response){
          for(a=0; a<response.data.length; a++){
            vm.adversaries.push({Name:response.data[a]['adv_name'], ID: response.data[a]['adv_id']});
          }
        });
        //gets all of the product categories
        $http.get('http://127.0.0.1:5000/productCategories').
        then(function(response){
          for(b=0; b<response.data.length; b++){
            vm.productCategories.push({Name:response.data[b]['category_name'], ID:response.data[b]['category_id']})
          }
        });
        //gets all of the threat categories
        $http.get('http://127.0.0.1:5000/threatCategories').
        then(function(response){
          for(b=0; b<response.data.length; b++){
            vm.categories.push({Name:response.data[b]['category_name'], ID:response.data[b]['category_id']})
          }
        });
    //gets specific details about a product
    $http.get('http://127.0.0.1:5000/products/'+vm.id).
    then(function(response){

      vm.category = response.data[0]['category_name']
      vm.productName = response.data[0]['product_name'];
      vm.productDesc = response.data[0]['product_desc'];
      vm.cat_id = response.data[0]['category_id'];
      vm.editor = response.data[0]['product_editor'];
    });


    //gets all of the keywords for a product
    $http.get('http://127.0.0.1:5000/products/'+vm.id+"/keywords").
    then(function(response){
      for(i=0; i<response.data.length; i++){
        vm.keywords.push(response.data[i]['keyword'])
      }
    });
});

//controller for the delete threat modal
angular.module('threat').controller('DeletethreatmodalController', function($http, $routeParams, $window, ModalService, todelete) {
    var vm = this;
    var id;
    threatID = todelete.getID();
    productID = $routeParams.productID;
    vm.confirmDelete = function(){
      $http.delete('http://127.0.0.1:5000/products/'+productID+ '/threats/' + threatID).then(function(response){
        todelete.storeID(null);
        $window.location.reload();
      });
    };

});
