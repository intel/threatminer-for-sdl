//controller for the threat detail page
angular.module('threat').controller('ThreatsController', function($http, $routeParams, $window, $base64, ModalService, identity) {
  var vm = this;
  vm.rowCollection = [];
  vm.threatCategories = [{Name:"", ID:null}];
  vm.adversaries = [{Name: "", ID: null}];
  vm.owners = [{Name: "", ID: null}];
  vm.statuses = ["", "-New-", "-Under Investigation-", "-Fixed-", "-Not an Issue-", "-Advisory-", "-N/A-"];
  vm.ratings = ["", "-Low-", "-Medium-", "-High-", "-Critical-"];
  //retrieves the threat ID from the url
  var threatID =$routeParams.threatID;
  var user;
  var name = "";
  try{
    user = identity.GetInfoFromJWT();
    name = user.displayName;
  }
  catch(err){
    user = null;
  }

  //checks to see if the user is an admin and determines whether they can edit a threat or not
  $http.get('http://127.0.0.1:5000/users/' + user.identity).then(function(response){
    if(response.data[0]['user_role'] === 'Admin'){
      vm.canEdit = true;
    }
  });

  //adds the ability to save a threat to the watchlist
  vm.saveThreat = function(){
    threatData = ({
      threat_id: vm.threatID
    });

    $http.post('http://127.0.0.1:5000/'+user.identity+'/savedThreats', threatData).then(function(response){
      alert("Added to Watchlist!");
    },  function errorCallback(response){
        alert("This threat is already in your watchlist!");
    });

  };

  //opens a modal to delete the particular threat
  vm.deleteThreatModal = function() {
       ModalService.showModal({
           templateUrl: 'ThreatDetail/deleteThreat.html',
           controller: 'DeletethreatController'
       }).then(function(modal) {
           modal.element.modal();
           modal.close.then(function() {
           });
       });
   };

   //updates the threat's category
  vm.updateCategory = function() {
    threatData = ({category_id : vm.selectedThreatCategory['ID'],
                  threat_editor:name});
    $http.put('http://127.0.0.1:5000/threats/'+ threatID + '/category', threatData).then(function(response){

    });
  };

  //updates a threat adversary
  vm.updateAdversary = function() {
    threatData = ({adv_id : vm.selectedAdversary['ID'],
                  threat_editor:name});
    $http.put('http://127.0.0.1:5000/threats/'+ threatID + '/adversary', threatData).then(function(response){

    });
  };

  //updates a threat's owner
  vm.updateOwner = function() {
    threatData = ({threat_owner : vm.selectedOwner['ID'],
                  threat_editor:name});
    $http.put('http://127.0.0.1:5000/threats/'+ threatID + '/owner', threatData).then(function(response){

    });
  };

  //updates a threat's status
  vm.updateStatus = function() {
    threatData = ({threat_status : vm.selectedStatus,
                  threat_editor:name});
    $http.put('http://127.0.0.1:5000/threats/'+ threatID + '/status', threatData).then(function(response){

    });
  };

  //updates a threat's rating
  vm.updateRating = function() {
    threatData = ({threat_rating : vm.selectedRating,
                  threat_editor:name});
    $http.put('http://127.0.0.1:5000/threats/'+ threatID + '/rating', threatData).then(function(response){

    });
  };

  //updates a threat's note
  vm.updateNote = function() {
    threatData = ({threat_note : vm.notes,
                  threat_editor:name});
    $http.put('http://127.0.0.1:5000/threats/'+ threatID + '/note', threatData).then(function(response){

    });
  };

  //updates a threat's category
  $http.get('http://127.0.0.1:5000/threatCategories').then(function(response){
    for(a = 0; a<response.data.length; a++){
      vm.threatCategories.push({ Name: response.data[a]['category_name'],
                                 ID: response.data[a]['category_id']
      });
    }
  });

  //gets all of the adversary types
  $http.get('http://127.0.0.1:5000/adversaries').then(function(response){
    for(b = 0; b<response.data.length; b++){
      vm.adversaries.push({ Name: response.data[b]['adv_name'],
                                 ID: response.data[b]['adv_id']
      });
    }
  });

  //gets all of the users
  $http.get('http://127.0.0.1:5000/users').then(function(response){
    for(c= 0; c<response.data.length; c++){
      vm.owners.push({ Name: response.data[c]['user_firstName'] + " " + response.data[c]['user_lastName'],
                                 ID: response.data[c]['user_id']
      });
    }
  });

  //gets the details of the threat
  $http.get('http://127.0.0.1:5000/threats/' + threatID).then(function(response){
    vm.threatID = response.data[0]['threat_id'];
    vm.title = response.data[0]['threat_title'];
    vm.desc =  response.data[0]['threat_desc'];
    vm.link  = response.data[0]['threat_link'];
    vm.status = response.data[0]['threat_status'];
    vm.date = response.data[0]['threat_date'];
    var feed_id = response.data[0]['feed_id'];
    vm.threat_rating = response.data[0]['threat_rating'];
    var owner_id =  response.data[0]['threat_owner'];
    vm.note = response.data[0]['threat_note'];
    var adv_id = response.data[0]['adv_id'];
    var category_id = response.data[0]['category_id'];
    var product_id = response.data[0]['product_id'];
    vm.editor = response.data[0]['threat_editor']


    getFeedName(feed_id);
    getOwnerName(owner_id);
    getAdversaryName(adv_id);
    getCategoryName(category_id);
    getProductName(product_id);

  });

  //gets all of the affected products
  $http.get('http://127.0.0.1:5000/threats/' + threatID + '/affected').then(function(response){
    for(i=0; i < response.data.length; i++){
      getCatName(response.data[i]['product_id'], response.data[i]['product_name'], response.data[i]['product_desc'], response.data[i]['catgory_id']);
    }
  });

  //gets the name of the category of the threat
  var getCatName = function(id, name, desc, cat_id){
    if(cat_id != null){
    $http.get('http://127.0.0.1:5000/productCategories/' + cat_id).then(function(response){
      var cat = response.data[0]['category_name'];
      vm.rowCollection.push({ID: id, Name: name, Desc: desc, category: cat});

    });
  } else {
    vm.rowCollection.push({ID: id,Name: name, Desc: desc, category: "None"});

  }

  }

  //gets the name of the feed this threat came from
  var getFeedName = function(id){
    if(id != null){
      $http.get('http://127.0.0.1:5000/feeds/' + id).then(function(response){
        vm.feedName = response.data[0]['feed_title']
      });
    } else {
      vm.feedName = "None";
    }
  };


  var getProductName = function(id){
    if(id != null){
      $http.get('http://127.0.0.1:5000/products/' + id).then(function(response){
        vm.productName = response.data[0]['product_name']
      });
    } else {
      vm.productName = "None";
    }
  };


  //gets the name of the owner of the threat
  var getOwnerName = function(id){
    if(id != null){
      $http.get('http://127.0.0.1:5000/users/' + id).then(function(response){
        vm.owner = response.data[0]['user_firstName'] + " " + response.data[0]['user_lastName']
      });
    } else {
        vm.owner = "No Owner";
    }
  };

  //gets the name of the adversary of the threat
  var getAdversaryName = function(id){
    if(id != null){
      $http.get('http://127.0.0.1:5000/adversaries/' + id).then(function(response){
        vm.adversaryName = response.data[0]['adv_name']
      });
    } else {
        vm.adversaryName = "None";
    }
  };

  //gets the name of the catefory of the threat
  var getCategoryName = function(id){
    if(id != null){
      $http.get('http://127.0.0.1:5000/threatCategories/' + id).then(function(response){
        vm.categoryName = response.data[0]['category_name']
      });
    } else {
      vm.categoryName = "None";
    }
  };
});
