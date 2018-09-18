angular.module('threat').controller('TrainingThreatController', function ($scope, $http, $window, $q, values) {
    const threatDescription = values.get('threatDescription')
    const threatClassification = values.get('threatClassification')
    const name = values.get('name')
    const threatID = values.get('threatID')
    angular.element('#element:0').addClass('background-blue')
    const vm = this
    vm.trainingText = null
    vm.trainingData = [[]]
    vm.response = null
    vm.type = values.get('defaultType') || 'O'
    vm.podClasses = []

    vm.updateClassification = function (index, type) {
        type = type || vm.type
        const elementColors = {
            O: 'grey', ASSET: 'blue', ATTACK_VECTOR: 'green', ATTACK_TYPE: 'yellow', ADVERSARY: 'red', VULNERABILITY: 'purple'
        }
        var previousElementClass = vm.podClasses[index]
        // If the color that the user selected is the color of the element, remove the color and set its type to "O"
        if ((previousElementClass != null) && (previousElementClass === `background-${elementColors[type]}`)) {
            vm.podClasses[index] = 'background-grey'
            type = 'O'
        } else {
            vm.podClasses[index] = `background-${elementColors[type]}`
        }
        vm.trainingData[index].classification = type
    }

    vm.submitTrainingData = function () {
        const outputArray = []
        for (let x = 0; x < vm.trainingData.length; x++) {
            outputArray[x] = new Array(2)
            outputArray[x][0] = vm.trainingData[x].token
            outputArray[x][1] = vm.trainingData[x].classification
        }
        $http.put(`${values.get('api')}/threats/${threatID}/retrain`, ({ trainingData: outputArray, name })).then((response) => {
            $window.location.reload()
        })
    }

    $http.post(`${values.get('api')}/functions/getTokenizedText/1`, ({ trainingText: threatDescription })).then((response) => {
        vm.response = response.data[0]
        if (threatClassification) {
            var classifications = threatClassification.split(' ')
        }
        const outputarray = new Array(response.data.length)
        for (let x = 0; x < vm.response.length; x++) {
            outputarray[x] = new Array(2)
            outputarray[x].token = vm.response[x]
            if (threatClassification) {
                outputarray[x].classification = classifications[x]
            } else {
                outputarray[x].classification = 'O'
            }
            vm.trainingData[x] = outputarray[x]
            vm.updateClassification(x, outputarray[x].classification)
        }
    }, (response) => {
        $window.alert("Looks like you're missing some important field(s)!")
    })
})
