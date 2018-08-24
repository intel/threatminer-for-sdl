//controller for adding a user
angular.module('threat').controller('TrainingInfoController', function($http, $window, $q, values) {
	var vm = this;
	vm.trainingText = null;
	vm.isLoading = false;
	vm.displayHTML = "";
	vm.trainingData = null;
	vm.response = null;
	vm.type = "O";
	vm.isFirstPage = true;

	vm.onElementClick = function(element) {
		var type = vm.type;
		var idList = element.target.id.split(":")[1];
		var listIndex = idList.split(",")[0];
		var tokenIndex = idList.split(",")[1];

		var elementColors = {"O":"grey", "ASSET":"blue", "ATTACK_VECTOR":"green", "ATTACK_TYPE":"yellow", "ADVERSARY":"red", "VULNERABILITY":"purple"};
		var previousElementClass = element.target.className.match(/background-[^\s]+/g);	// get "background-*" from the class of the previous click
		element.target.className = element.target.className.replace(/background-[^\s]+/g, "");	// remove "background-*" from the class of the previous click

		// If the color that the user selected is the color of the element, remove the color and set its type to "O"
		if ((previousElementClass != null) && (previousElementClass == "background-" + elementColors[vm.type])) {
			element.target.className += " background-grey";
			type = "O";
		} else {
			element.target.className += " background-" + elementColors[vm.type];
		}
		vm.trainingData[listIndex][tokenIndex]["classification"] = type;
	}

	vm.submitTrainingData = function() {
		var outputarray = [];
		for (var i = 0; i < vm.trainingData.length; i++) {
			outputarray[i] = new Array(vm.trainingData.length);
			for (var x = 0; x < vm.trainingData[i].length; x++) {
				outputarray[i][x] = new Array(2);
				outputarray[i][x][0] = vm.trainingData[i][x]["token"];
				outputarray[i][x][1] = vm.trainingData[i][x]["classification"];
			}
		}
		$http.post(values.get('api') + '/users_products/insertTrainingData', ({trainingData:outputarray, trainingText:vm.trainingText})).then(function(response) {
			$window.location.reload();
		});
	}
	vm.getTokenizedText = function(){
		//posting the data to the api
		vm.isLoading = true;
		$http.post(values.get('api') + '/functions/getTokenizedText/0', ({trainingText:vm.trainingText})).then(function(response) {
			vm.response = response.data;
			var outputarray = new Array(response.data.length);
			for (var i = 0; i < response.data.length; i++) {
				outputarray[i] = new Array(response.data[i].length)
				for (var x = 0; x < response.data[i].length; x++) {
					outputarray[i][x] = new Array(2)
					outputarray[i][x]["token"] = response.data[i][x];
					outputarray[i][x]["classification"] = "O";
				}
			}
			vm.trainingData = outputarray;
			vm.isLoading = false;
			vm.isFirstPage = false;
		}, function errorCallback(response){
			alert("Looks like you're missing some important field(s)!")
			}
		);
	}
});
