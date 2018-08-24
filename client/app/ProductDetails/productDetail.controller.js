//main controller for the product/ontology detail page
angular.module('threat').controller('ProductdetailController', function($http, $routeParams, $window, $q,  ModalService, identity, todelete, values) {
    var vm = this;
    vm.id = $routeParams.productID;
    vm.rowCollection = [];
    vm.keywords = [];
    vm.displayedCollection = [];
    vm.adversaries = [{Name:"", ID:null}];
    vm.productCategories = [{Name:"", ID:null}];
    vm.severities = ["", "-Low-", "-Medium-", "-High- ", "-Critical-"];
    vm.filterstatuses = ["", "-New-", "-New N/A-", "-Under Investigation-", "-Fixed-", "-Not an Issue-", "-Advisory-", "-N/A-"];
    vm.statuses = ["", "-New-", "-Under Investigation-", "-Fixed-", "-Not an Issue-", "-Advisory-", "-N/A-"];
    var promiseArray = [];
    var user;
    var name = "";

    try {
        user = identity.GetInfoFromJWT();
        //checks if the user is an admin and determines whether they can delete or not
        $http.get(values.get('api') + '/users/' + user.identity).then(function(response){
          if(response.data[0]['user_role'] === 'Admin'){
            vm.canDelete = true;
          }
          name = response.data[0]['user_lastName'] + ", " + response.data[0]['user_firstName']
        });
    }
    catch(err){
      user = "";
    }
    vm.user = user;

    // Convert values of the same key in an associative array to an indexed array
    vm.objArrToIndexedArrByKey = function(assocArray, key) {
      indexedArray = [];
      for (var x = 0; x < assocArray.length; x++) {
        indexedArray[x] = assocArray[x][key];
      }
      return indexedArray;
    };

    vm.getSelectedThreatsLength = function() {
      return vm.displayedCollection.filter(function(threat) {return threat.isSelected}).length;
    }

    //retreive all threats for a product
    var threatPromise = $http.get(values.get('api') + '/products/'+vm.id+'/threats');

    //saves the product to the user's watchlist
    vm.saveProduct = function() {
      productData = ({
        product_id: vm.id
      });
      $http.post(values.get('api') + '/'+user.identity+'/savedProducts', productData).then(function(response){
        alert("Added to Watchlist!")
      },  function errorCallback(response){
          alert("This product is already in your watchlist!")
      });
    };

    //opens the modal for editing multiple threats
    vm.editSelectionModal = function() {
      var threatIds = vm.objArrToIndexedArrByKey(vm.displayedCollection.filter(function(threat) {return threat.isSelected}), "ID");
      values.set("selectedThreatIds", threatIds);
      ModalService.showModal({
        templateUrl: 'ProductDetails/editSelectionModal.html',
        controller: 'EditSelectionController'
      }).then(function(modal) {
        modal.element.modal();
        modal.close.then(function() {});
      });
     };

    //opens the modal for adding a threat
    vm.addThreatModal = function() {
         ModalService.showModal({
             templateUrl: 'ProductDetails/addThreatModal.html',
             controller: 'AddthreatController'
         }).then(function(modal) {
             modal.element.modal();
             modal.close.then(function() {});
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
      $http.put(values.get('api') + '/threats/'+ id + '/status', threatData).then(function(response){
        $window.location.reload()
      });
    }


    vm.updateThreatSeverity = function(id) {
      $http.put(values.get('api') + '/threats/'+ id+ '/rating', {threat_rating : vm.newSeverity, threat_editor:name}).then(function(response){
        $window.location.reload()
      });
    };

    // updates the name of a product
     vm.updateName = function(){
       var productData = ({product_name: vm.productName,
       product_editor: name});
       $http.put(values.get('api') + '/products/'+vm.id+'/name', productData).then(function(response){
       });
     }

     //updates the description of the product
     vm.updateDesc = function(){
       var productData = ({product_desc: vm.productDesc,
       product_editor:name});
       $http.put(values.get('api') + '/products/'+vm.id+'/desc', productData).then(function(response){
       });
     }
     //updates the category of the product
     vm.updateCategory = function(){
       var productData = ({category_id: vm.category.ID,
       product_editor:name});
       $http.put(values.get('api') + '/products/'+vm.id+'/category', productData).then(function(response){
       });
     }
     //updates the keywords for a product
     vm.updateKeywords = function(){
       $http.delete(values.get('api') + '/products/'+vm.id+'/keywords').then(function(response){
         addKeywords();
       });
     };
     //adds keywords for a product
     addKeywords = function(){
       for(q=0; q<vm.keywords.length; q++){
         var keywordData = ({keyword: vm.keywords[q]['text'],
          product_editor: name});
         $http.post(values.get('api') + '/products/'+vm.id+'/keywords', keywordData).then(function(response){
         });
       }
     };

     //starts the train of adding threats to the table
    threatPromise.then(function(response){

      for(c=0; c<response.data.length; c++){
          getCategoryName(response.data[c]['threat_id'], response.data[c]['threat_title'], response.data[c]['threat_desc'], response.data[c]['threat_link'],
          response.data[c]['adv_id'], response.data[c]['threat_rating'], response.data[c]['threat_status'], response.data[c]['threat_date']);
        }

    });

    vm.formatDateString = function(dateString) {
      var date = new Date(dateString);
      // If month or day is less than 10, place a "0" in front to match style of other tables
      var month = (date.getUTCMonth()+1 < 10) ? "0" + (date.getUTCMonth()+1).toString() : date.getUTCMonth()+1;
      var day = (date.getUTCDate() < 10) ? "0" + (date.getUTCDate()).toString() : date.getUTCDate();
      return month + "/" + day + "/" + date.getUTCFullYear().toString().slice(-2);
    }

    getCategoryName = function(id, title, desc, link, adv_id, rating, status, date){
        getAdversaryName(id, title, desc, link, adv_id, rating, status, date);
    }

    getAdversaryName = function(id, title, desc, link, adv_id, rating, status, date){
      var advName;
      if(adv_id != null){
        console.log(adv_id);
        $http.get(values.get('api') + '/adversaries/'+adv_id).then(function(response){
        advName = response.data[0]['adv_name'];
        insertRow(id, title, desc, link, advName, rating, status, date)
      });
      }else{
        advName = "";
        insertRow(id, title, desc, link, advName, rating, status, date)
     }
    }

   insertRow = function(id, title, desc, link, advName, rating, status, date){
     if(rating === null){
       rating = ""
     }
     if(status === null){
       status = "-New-"
     }
     vm.rowCollection.push({ ID: id, Title:title, Description: desc, Link:link, Adversary: angular.copy(advName), Severity: rating, Status: status, date: new Date(date)})
   }

//gets all of the adversaries
    $http.get(values.get('api') + '/adversaries').
        then(function(response){
          for(a=0; a<response.data.length; a++){
            vm.adversaries.push({Name:response.data[a]['adv_name'], ID: response.data[a]['adv_id']});
          }
        });
        //gets all of the product categories
        $http.get(values.get('api') + '/productCategories').
        then(function(response){
          for(b=0; b<response.data.length; b++){
            vm.productCategories.push({Name:response.data[b]['category_name'], ID:response.data[b]['category_id']})
          }
        });
    //gets specific details about a product
    $http.get(values.get('api') + '/products/'+vm.id).
    then(function(response){
      vm.category = response.data[0]['category_name']
      vm.productName = response.data[0]['product_name'];
      vm.productDesc = response.data[0]['product_desc'];
      vm.editor = response.data[0]['product_editor'];
    });


    //gets all of the keywords for a product
    $http.get(values.get('api') + '/products/'+vm.id+"/keywords").
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
      $http.delete(values.get('api') + '/products/'+productID+ '/threats/' + threatID).then(function(response){
        todelete.storeID(null);
        $window.location.reload();
      });
    };

});
