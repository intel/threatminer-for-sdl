//controller to add a new feed to the system
angular.module('threat').controller('AddfeedController', function($http, $window, $q) {

    var vm = this;
    vm.feedTypes = [{Name:"", ID: null}];
    vm.feed_desc = null;
    vm.selectedType = [{Name: "", ID: null}];

    var promiseArray = [];
    //fills the drop down for selecting a feed type
    $http.get('http://127.0.0.1:5000/feedTypes').then(function(response){
      for(l=0; l<response.data.length; l++){
        vm.feedTypes.push({Name:response.data[l]['type_name'],
        ID: response.data[l]['type_id'] })
      }
    });
    // starts up the modal for adding a new feed
		vm.addFeed = function() {

      if(vm.selectedType['ID'] != null){
        var feedData = ({
          feed_title:vm.feed_title,
          feed_link:vm.feed_link,
          feed_desc:vm.feed_desc,
          feed_type:vm.selectedType['ID']
        });
      }
      if(vm.selectedType['ID'] == null){

        var feedData = ({
          feed_title:vm.feed_title,
          feed_link:vm.feed_link,
          feed_desc:vm.feed_desc,
        });
      }

      var addFeedPromise = $http.post('http://127.0.0.1:5000/feeds', feedData)

      addFeedPromise.then(function(response){
         $window.location.reload();
      }, function errorCallback(response){
          alert("Looks like you're missing some important field(s)!")
      });
  };
});
