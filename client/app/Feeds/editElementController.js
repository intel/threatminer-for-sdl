// controller to add a new feed to the system
angular.module('threat').controller('EditElementController', function ($http, $window, values, identity) {
    const vm = this
    vm.tableName = values.get('tableName')
    vm.idFieldName = values.get('idFieldName')
    vm.id = values.get('id')
    vm.objArray = values.get('objArray')
    vm.nameField = values.get('nameField')
    vm.dateField = values.get('dateField')
    let user
    var name

    for (let x = 0; x < vm.objArray.length; x++) {
        vm[vm.objArray[x].fieldName] = vm.objArray[x].fieldValue
    }

    try {
        user = identity.GetInfoFromJWT()
    } catch (err) {
        user = null
    }

    if (user != null) {
    // Get name of user
        $http.get(`${values.get('api')}/users/${user.identity}`).then((response) => {
            name = `${response.data[0].user_lastName}, ${response.data[0].user_firstName}`
        })
    }

    vm.formatDateString = function (dateString) {
        const date = new Date(dateString)
        // If month or day is less than 10, place a "0" in front to match style of other tables
        const month = (date.getUTCMonth() + 1 < 10) ? `0${(date.getUTCMonth() + 1).toString()}` : date.getUTCMonth() + 1
        const day = (date.getUTCDate() < 10) ? `0${(date.getUTCDate()).toString()}` : date.getUTCDate()
        return `${month}/${day}/${date.getUTCFullYear().toString().slice(-2)}`
    }

    vm.updateElement = function () {
        const data = {}

        for (let x = 0; x < vm.objArray.length; x++) {
            data[vm.objArray[x].fieldName] = vm[vm.objArray[x].fieldName]
        }

        if (vm.nameField) {
            data[vm.nameField] = name
        }

        if (vm.dateField) {
            data[vm.dateField] = vm.formatDateString(new Date())
        }
        $http.put(`${values.get('api')}/${vm.tableName}/${parseInt(vm.id)}`, data).then(() => {
            $window.location.reload()
        })
    }
})
