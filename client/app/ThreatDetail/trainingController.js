angular.module('threat').controller('TrainingThreatController', function($scope, $http, $window, $q, values) {
  var threatDescription = values.get("threatDescription");
  var threatClassification = values.get("threatClassification");
  var name = values.get("name");
  var threatID = values.get("threatID");
  angular.element('#element:0').addClass('background-blue');
	var vm = this;
	vm.trainingText = null;
	vm.trainingData = [[]];
	vm.response = null;
	vm.type = values.get("defaultType") || "O";
  vm.podClasses = [];

	vm.updateClassification = function(index, type) {
		var type = type || vm.type;
		var elementColors = {"O":"grey", "ASSET":"blue", "ATTACK_VECTOR":"green", "ATTACK_TYPE":"yellow", "ADVERSARY":"red", "VULNERABILITY":"purple"};
    previousElementClass = vm.podClasses[index];
    // If the color that the user selected is the color of the element, remove the color and set its type to "O"
		if ((previousElementClass != null) && (previousElementClass == "background-" + elementColors[type])) {
			vm.podClasses[index] = "background-grey";
			type = "O";
		} else {
			vm.podClasses[index] = "background-" + elementColors[type];
		}
		vm.trainingData[index]["classification"] = type;
	}

	vm.submitTrainingData = function() {
    var outputArray = []
    for (var x = 0; x < vm.trainingData.length; x++) {
				outputArray[x] = new Array(2);
				outputArray[x][0] = vm.trainingData[x]["token"];
				outputArray[x][1] = vm.trainingData[x]["classification"];
    }
		$http.put(values.get('api') + '/threats/' + threatID  + '/retrain', ({trainingData:outputArray, name:name})).then(function(response) {
			$window.location.reload();
		});
	}

  $http.post(values.get('api') + '/functions/getTokenizedText/1', ({trainingText:threatDescription})).then(function(response) {
    vm.response = response.data[0];
    if (threatClassification) {
      var classifications = threatClassification.split(' ');
    }
    var outputarray = new Array(response.data.length);
    for (var x = 0; x < vm.response.length; x++) {
      outputarray[x] = new Array(2);
      outputarray[x]["token"] = vm.response[x];
      if (threatClassification) {
        outputarray[x]["classification"] = classifications[x];
      } else {
        outputarray[x]["classification"] = "O";
      }
      vm.trainingData[x] = outputarray[x];
      vm.updateClassification(x, outputarray[x]["classification"]);
    }
    }, function errorCallback(response){
      alert("Looks like you're missing some important field(s)!")
    }
  );
});
