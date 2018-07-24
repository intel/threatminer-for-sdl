//This is controller for the feeds page
angular.module('threat')
  .controller('FeedsController', function($http, ModalService, $window, $q, identity, todelete) {
    var vm = this;
    vm.rowCollection = [];
    vm.feedTypes = [""]
    var promiseArray = [];
    var user;
    try{
      user = identity.GetInfoFromJWT();
    }
    catch(err){
    }

    //opens a modal to delete any selected feeds
    vm.deleteSelectedFeeds = function() {
      toPush = [];
      for(t=0; t<vm.displayedCollection.length; t++){
        if(vm.displayedCollection[t].isSelected){
         toPush.push(vm.displayedCollection[t]['product_id']);
        }
      }
        todelete.storeID(toPush);
         ModalService.showModal({
             templateUrl: 'Feeds/deleteSelectedFeeds.html',
             controller: 'DeleteselectedfeedsController'
         }).then(function(modal) {
             modal.element.modal();
             modal.close.then(function(result) {
                 //vm.message = "You said " + result;
             });
         });
     };

    if (user != null) {
         //checks if the user is an admin to check whether they can add or not
        $http.get('http://127.0.0.1:5000/users/' + user.identity).then(function(response){
          if(response.data[0]['user_role'] === 'Admin'){
            vm.canAdd = true;
          }
        });
    }
    //retrives all feed types for filter
    $http.get('http://127.0.0.1:5000/feedTypes').then(function(response){
      for(j=0; j<response.data.length; j++){
        vm.feedTypes.push(response.data[j]['type_name']);
      }
    });


    //opens the modal to add a new feed
    vm.addFeedModal = function() {
         ModalService.showModal({
             templateUrl: 'Feeds/addFeedModal.html',
             controller: 'AddfeedController'
         }).then(function(modal) {
             modal.element.modal();
             modal.close.then(function(result) {
                 //vm.message = "You said " + result;
             });
         });
     };

     //opens the modal to confrim the deletion of a feed
     vm.deleteFeedModal = function(id) {

       todelete.storeID(id);

       ModalService.showModal({
           templateUrl: 'Feeds/deleteFeed.html',
           controller: 'DeletefeedController',
           inputs: {
             feed: id,
           }

       }).then(function(modal) {
           modal.element.modal();
           modal.close.then(function(result) {
               //vm.message = "You said " + result;
           });
       });
     };

    //loads all feeds into table
    $http.get('http://127.0.0.1:5000/feeds').
    then(function(response) {

      vm.rowCollection = response.data;
    });
    //retrives what feed category a feed is within the row of the table
    var getTypeName = function(title, link, desc, id, type_id){
      if(type_id != null){
      $http.get('http://127.0.0.1:5000/feedTypes/' + type_id).then(function(response){

          vm.rowCollection.push({Title: title, Link: link, Description: desc, ID:id, Type: response.data[0]['type_name']});
        });
      }
        else{
          vm.rowCollection.push({Title: title, Link: link, Description: desc, ID:id, Type:""});
        }
      };

 });



//the controller for the delete feed modal
 angular.module('threat') .controller('DeletefeedController', function($http, $window,  todelete) {
     var vm = this;
     var id = todelete.getID();
     vm.confirmDelete = function(){
       $http.delete('http://127.0.0.1:5000/feeds/' + id).then(function(response){
         todelete.storeID(null);
         $window.location.reload();
       });
     }


  });
