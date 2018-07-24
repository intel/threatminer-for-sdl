// controller for the product's page
angular.module('threat')
  .controller('SearchController', function($http,$q, $window, ModalService, identity, todelete) {
    var vm = this;
	vm.currentSearchParam = "Threat Description";
	vm.maxPageCount = 1;
	vm.currentPage = 1;
	vm.searchQuery = "";
	vm.displayedCollection = [];
	vm.hasPerformedASearch = false;

	vm.setDropdown = function(title) {
		vm.currentSearchParam = title;
	};

	vm.showNoSearchResults = function() {
		return ((vm.displayedCollection.length == 0) && vm.hasPerformedASearch)
	}

	vm.isLastPage = function() {
		return (vm.currentPage == vm.maxPageCount);
	}

	vm.nextPage = function() {
		if (vm.currentPage != vm.maxPageCount) {
			vm.currentPage++;
			vm.search();
		}
	}

	vm.previousPage = function() {
		if (vm.currentPage != 1) {
			vm.currentPage--;
			vm.search();
		}
	}

	//checks if the user is an admin and determines whether they can delete or not
	vm.search = function() {
		$http.get('http://127.0.0.1:5000/threats/pageCount').then(function(response){
			vm.maxPageCount = response.data;
	    });
		apiString = "http://127.0.0.1:5000/threats/";
        pageCountAPIString = "http://127.0.0.1:5000/threats/pageCount/";
		if (vm.searchQuery != "") {
			if (vm.currentSearchParam  == "Threat Description") {
				apiString += "desc/" + vm.searchQuery + "/";
                pageCountAPIString += "desc/" + vm.searchQuery;
			} else if (vm.currentSearchParam  == "Threat Title") {
				apiString += "title/" + vm.searchQuery + "/";
                pageCountAPIString += "title/" + vm.searchQuery;
			}
		}
		apiString += "currentPage/" + vm.currentPage;
        $http.get(pageCountAPIString).then(function(response){
            vm.maxPageCount = response.data;
        });
		$http.get(apiString).then(function(response){
			dataArr = response.data;
			vm.displayedCollection = [];
			dataArr.forEach(function(element) {
				vm.displayedCollection.unshift({ID:element.threat_id, Date:element.threat_date, Title:element.threat_title, Description:element.threat_desc})
			})
			vm.hasPerformedASearch = true;
	    });
	}
 });
