//controller for the threat detail page
angular.module('threat').controller('ThreatsController', function($http, $routeParams, $window, $base64, ModalService, identity, todelete, values) {
  var vm = this;
  vm.rowCollection = [];
  vm.adversaries = [{Name: "", ID: null}];
  vm.owners = [{Name: "", ID: null}];
  vm.statuses = ["", "-New-", "-Under Investigation-", "-Fixed-", "-Not an Issue-", "-Advisory-", "-N/A-"];
  vm.ratings = ["", "-Low-", "-Medium-", "-High-", "-Critical-"];
  vm.adversaryTypes = [];
  vm.assets = [];
  vm.attackTypes = [];
  vm.attackVectors = [];
  vm.vulnerabilities = [];
  // For sorting classification alphabetically before displaying
  var currentSortProp = "";

  //retrieves the threat ID from the url
  var threatID =$routeParams.threatID;
  var user;
  var name = "";
  try{
    user = identity.GetInfoFromJWT();
    //checks to see if the user is an admin and determines whether they can edit a threat or not
    $http.get(values.get('api') + '/users/' + user.identity).then(function(response){
      if(response.data[0]['user_role'] === 'Admin'){
        vm.canEdit = true;
      }
      name = response.data[0]['user_lastName'] + ", " + response.data[0]['user_firstName']
    });
  }
  catch(err){
    user = null;
  }
  vm.user = user;

  //adds the ability to save a threat to the watchlist
  vm.saveThreat = function(){
    threatData = ({
      threat_id: vm.threatID
    });

    $http.post(values.get('api') + '/'+user.identity+'/savedThreats', threatData).then(function(response){
      alert("Added to Watchlist!");
    },  function errorCallback(response){
        alert("This threat is already in your watchlist!");
    });

  };

  // opens modal for retraining the threat
  vm.trainModal = function(defaultClassificationType) {
    values.set("threatClassification", vm.classification);
    values.set("threatDescription", vm.desc);
    values.set("threatID", vm.threatID);
    values.set("name", name);
    if (defaultClassificationType) {
      values.set("defaultType", defaultClassificationType);
    }
    ModalService.showModal({
      templateUrl: 'ThreatDetail/train.html',
      controller: 'TrainingThreatController'
    }).then(function(modal) {
      modal.element.modal({backdrop: 'static'});
      modal.close.then(function(result) {
        //vm.message = "You said " + result;
      });
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

  //updates a threat adversary
  vm.updateAdversary = function() {
    threatData = ({adv_id : vm.selectedAdversary['ID'],
                  threat_editor:name});
    $http.put(values.get('api') + '/threats/'+ threatID + '/adversary', threatData).then(function(response){

    });
  };

  //updates a threat's owner
  vm.updateOwner = function() {
    threatData = ({threat_owner : vm.selectedOwner['ID'],
                  threat_editor:name});
    $http.put(values.get('api') + '/threats/'+ threatID + '/owner', threatData).then(function(response){

    });
  };

  //updates a threat's status
  vm.updateStatus = function() {
    threatData = ({threat_status : vm.selectedStatus,
                  threat_editor:name});
    $http.put(values.get('api') + '/threats/'+ threatID + '/status', threatData).then(function(response){

    });
  };

  //updates a threat's rating
  vm.updateRating = function() {
    threatData = ({threat_rating : vm.selectedRating,
                  threat_editor:name});
    $http.put(values.get('api') + '/threats/'+ threatID + '/rating', threatData).then(function(response){

    });
  };

  //updates a threat's note
  vm.updateNote = function() {
    threatData = ({threat_note : vm.notes,
                  threat_editor:name});
    $http.put(values.get('api') + '/threats/'+ threatID + '/note', threatData).then(function(response){

    });
  };

  //gets all of the adversary types
  $http.get(values.get('api') + '/adversaries').then(function(response){
    for(b = 0; b<response.data.length; b++){
      vm.adversaries.push({ Name: response.data[b]['adv_name'],
                                 ID: response.data[b]['adv_id']
      });
    }
  });

  $http.get(values.get('api') + '/threats/' + threatID + '/adversaries').then(function(response){
    currentSortProp = "adv_name";
    vm.adversaryTypes = response.data.sort(vm.sortAlphabetically);
  });

  $http.get(values.get('api') + '/threats/' + threatID + '/assets').then(function(response){
    currentSortProp = "asset_name";
    vm.assets = response.data.sort(vm.sortAlphabetically);
  });

  $http.get(values.get('api') + '/threats/' + threatID + '/attack_types').then(function(response){
    currentSortProp = "atktyp_name";
    vm.attackTypes = response.data.sort(vm.sortAlphabetically);
  });

  $http.get(values.get('api') + '/threats/' + threatID + '/attack_vectors').then(function(response){
    currentSortProp = "atkvtr_name";
    vm.attackVectors = response.data.sort(vm.sortAlphabetically);
  });

  $http.get(values.get('api') + '/threats/' + threatID + '/vulnerabilities').then(function(response){
    currentSortProp = "vuln_name";
    vm.vulnerabilities = response.data.sort(vm.sortAlphabetically);
  });

  vm.sortAlphabetically = function(a, b) {
    var nameA = a[currentSortProp].toUpperCase(); // ignore upper and lowercase
    var nameB = b[currentSortProp].toUpperCase(); // ignore upper and lowercase

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    // names must be equal
    return 0;
  };

  // Convert values of the same key in an associative array to an indexed array
  vm.objArrToIndexedArrByKey = function(assocArray, key) {
    indexedArray = [];
    for (var x = 0; x < assocArray.length; x++) {
      indexedArray[x] = assocArray[x][key];
    }
    return indexedArray;
  };



  //gets all of the users
  $http.get(values.get('api') + '/users').then(function(response){
    for(c= 0; c<response.data.length; c++){
      vm.owners.push({ Name: response.data[c]['user_firstName'] + " " + response.data[c]['user_lastName'],
                                 ID: response.data[c]['user_id']
      });
    }
  });

  //gets the details of the threat
  $http.get(values.get('api') + '/threats/' + threatID).then(function(response){
    vm.threatID = response.data[0]['threat_id'];
    vm.title = response.data[0]['threat_title'];
    vm.desc =  response.data[0]['threat_desc'];
    vm.classification = response.data[0]['threat_classification'];
    vm.link  = response.data[0]['threat_link'];
    vm.status = response.data[0]['threat_status'];
    vm.date = response.data[0]['threat_date'];
    var feed_id = response.data[0]['feed_id'];
    vm.threat_rating = response.data[0]['threat_rating'];
    var owner_id =  response.data[0]['threat_owner'];
    vm.note = response.data[0]['threat_note'];
    var adv_id = response.data[0]['adv_id'];
    var product_id = response.data[0]['product_id'];
    vm.editor = response.data[0]['threat_editor']


    getFeedName(feed_id);
    getOwnerName(owner_id);
    getAdversaryName(adv_id);
    getProductName(product_id);

  });

  //gets all of the affected products
  $http.get(values.get('api') + '/threats/' + threatID + '/affected').then(function(response){
    for(i=0; i < response.data.length; i++){
      getCatName(response.data[i]['product_id'], response.data[i]['product_name'], response.data[i]['product_desc'], response.data[i]['catgory_id']);
    }
  });

  //gets the name of the category of the threat
  var getCatName = function(id, name, desc, cat_id){
    if(cat_id != null){
    $http.get(values.get('api') + '/productCategories/' + cat_id).then(function(response){
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
      $http.get(values.get('api') + '/feeds/' + id).then(function(response){
        vm.feedName = response.data[0]['feed_title']
      });
    } else {
      vm.feedName = "None";
    }
  };


  var getProductName = function(id){
    if(id != null){
      $http.get(values.get('api') + '/products/' + id).then(function(response){
        vm.productName = response.data[0]['product_name']
      });
    } else {
      vm.productName = "None";
    }
  };


  //gets the name of the owner of the threat
  var getOwnerName = function(id){
    if(id != null){
      $http.get(values.get('api') + '/users/' + id).then(function(response){
        vm.owner = response.data[0]['user_firstName'] + " " + response.data[0]['user_lastName']
      });
    } else {
        vm.owner = "No Owner";
    }
  };

  //gets the name of the adversary of the threat
  var getAdversaryName = function(id){
    if(id != null){
      $http.get(values.get('api') + '/adversaries/' + id).then(function(response){
        vm.adversaryName = response.data[0]['adv_name']
      });
    } else {
        vm.adversaryName = "None";
    }
  };
});
