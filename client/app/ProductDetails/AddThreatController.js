// controller for adding a new threat
angular.module('threat').controller('AddThreatController', function ($http, $window, $q, $routeParams, identity, values) {
  const vm = this
  vm.link = null
  vm.desc = null
  vm.id = $routeParams.productID
  vm.adversaries = [{ Name: '', ID: null }]
  vm.ratings = ['', '-Low-', '-Medium-', '-High-', '-Critical-']
  vm.statuses = ['', '-New-', '-Under Investigation-', '-Fixed-', '-Not an Issue-', '-Advisory-', '-N/A-']
  let user
  let name = ''
  try {
    user = identity.GetInfoFromJWT()
  } catch (err) {
    user = null
  }
  vm.owners = [{ Name: '', ID: null }]
  vm.selectedCat = { Name: '', ID: null }
  vm.selectedAdv = { Name: '', ID: null }
  vm.SelectedRating = null
  vm.selectedStatus = null
  vm.notes = null
  vm.selectedOwner = { Name: '', ID: null }
  // creating the date
  var today = new Date()
  let dd = today.getDate()
  let mm = today.getMonth() + 1 // January is 0!
  const yyyy = today.getFullYear()
  if (dd < 10) {
    dd = `0${dd}`
  }
  if (mm < 10) {
    mm = `0${mm}`
  }
  today = `${mm}/${dd}/${yyyy}`

  $http.get(`${values.get('api')}/users/${user.identity}`).then((response) => {
    name = `${response.data[0].user_lastName}, ${response.data[0].user_firstName}`
  })

  // retrieves a list of adversaries
  $http.get(`${values.get('api')}/adversaries`)
    .then((response) => {
      for (var j = 0; j < response.data.length; j++) {
        vm.adversaries.push({
          Name: response.data[j].adv_name,
          ID: response.data[j].adv_id
        })
      }
    })

  // retrieves all users for assigning ownership
  $http.get(`${values.get('api')}/users`)
    .then((response) => {
      for (var l = 0; l < response.data.length; l++) {
        vm.owners.push({
          Name: `${response.data[l].user_firstName} ${response.data[l].user_lastName}`,
          ID: response.data[l].user_id
        })
      }
    })

  // function for posting a threat
  vm.addThreat = function () {
    const threatData = ({
      threat_title: vm.title,
      threat_link: vm.link,
      threat_desc: vm.desc,
      threat_rating: vm.SelectedRating,
      threat_status: vm.selectedStatus,
      threat_owner: vm.selectedOwner.ID,
      threat_note: vm.notes,
      threat_editor: name,
      threat_date: today
    })

    $http.post(`${values.get('api')}/products/${vm.id}/threats`, threatData).then((response) => {
      $window.location.reload()
    }, (response) => {
      alert("Looks like you're missing some important field(s)!")
    })
  }
})
