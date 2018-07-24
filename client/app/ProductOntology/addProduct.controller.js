//controller for the add product modal
angular.module('threat').controller('AddproductController', function($http, $window, $q, identity) {

    var vm = this;
    vm.categories = [{Name:"", Id:null}];
    vm.product_desc = null;
    vm.selectedCat = {Name:"", Id:null};
    vm.keywords = [];
    var promiseArray = [];
    var user;
    var name = "";


    try{
     user = identity.GetInfoFromJWT();
     name = user.displayName;
   } catch(err) {
     user = null
     name = "Unauthorized"
   }


   //gets all the product categories
    $http.get('http://127.0.0.1:5000/productCategories').then(function(response){
      for(k=0; k<response.data.length; k++){
        vm.categories.push({Name:response.data[k]['category_name'],
        Id: response.data[k]['category_id'] })
      }
    });
    //adds keywords
    insertKeywords = function(id, keywords){
      console.log(name)
        for(k=0; k<keywords.length; k++){
          var keywordData = ({
            keyword:keywords[k]['text'],
            product_editor: name
          });
          promiseArray.push($http.post('http://127.0.0.1:5000/products/'+id+'/keywords', keywordData))
         };

         $q.all(promiseArray).then(function(dataArray){
           $window.location.reload();
         });
    };

    //adds a product
		vm.addProduct = function() {
      if(vm.selectedCat['Id'] != null){
        var productData = ({
            product_name:vm.product_name,
            product_desc:vm.product_desc,
            category_id:vm.selectedCat['Id'],
            product_editor: name,
            product_updated: " "
          });

      }


      if(vm.selectedCat['Id'] == null){
        var productData = ({
            product_name:vm.product_name,
            product_desc:vm.product_desc,
            product_editor: name,
            product_updated: " "
          });

      }
      var addProductPromise = $http.post('http://127.0.0.1:5000/products', productData)

      addProductPromise.then(function(response){
        product_id = angular.copy(response.data[0]['max(product_id)'])
        insertKeywords(product_id, vm.keywords)
      }, function errorCallback(response){
          alert("Looks like you're missing some important field(s)!")
      });
  };


});
