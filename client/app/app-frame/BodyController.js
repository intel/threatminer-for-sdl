// controller for the nav bar
angular.module('threat').controller('BodyController', function ($log, identity, $http, values) {
    /* @ngInject */
    /*
        The nav-bar will load differently depending on whether the user is an
        admin or base user.
      */
    const vm = this
    let user
    let name = ''
    let id = null

    try {
        user = identity.GetInfoFromJWT()
        id = user.identity
        // If a logged in user doesn't have an account anymore, log them out.
        $http.get(`${values.get('api')}/users/${id}`).then((response) => {
            if (response.data.length === 0) {
                identity.removeToken()
            }
        })
    } catch (err) {
        user = null
        name = 'Unauthorized'
    }

    if (identity.isIdentify()) {
    // retireves the user from the API by id
        $http.get(`${values.get('api')}/users/${id}`).then((response) => {
            const role = response.data[0].user_role
            name = `${response.data[0].user_firstName} ${response.data[0].user_lastName}`
            // loads a link to the admin page if the user has that role
            if (role === 'Admin') {
                // console.log("You are an Admin!");
                vm.frameData = {
                    name: 'Threat Miner for SDL',
                    noLogo: true,
                    itemsRight: [

                        {
                            title: 'Ontologies',
                            href: '/ontologies'
                        },
                        {
                            title: 'Search',
                            href: '/search'
                        },
                        {
                            title: 'Threat Feeds',
                            href: '/feeds'
                        },
                        {
                            title: 'Executive Summary',
                            href: '/executive'
                        },
                        {
                            title: name,
                            href: '/admin'

                        }
                    ]
                }
            } else {
                // if a user does not have the admin role, a link to the watchlist page loads
                vm.frameData = {
                    name: 'Threat Miner for SDL',
                    noLogo: true,
                    itemsRight: [
                        {
                            title: 'Ontologies',
                            href: '/ontologies'
                        },
                        {
                            title: 'Search',
                            href: '/search'
                        },
                        {
                            title: 'Threat Feeds',
                            href: '/feeds'
                        },
                        {
                            title: 'Executive Summary',
                            href: '/executive'
                        },
                        {
                            title: name,
                            href: '/watchlist'

                        }
                    ]
                }
            }
        })
    } else {
        vm.frameData = {
            name: 'Threat Miner for SDL',
            noLogo: true,
            itemsRight: [
                {
                    title: 'Ontologies',
                    href: '/ontologies'
                },
                {
                    title: 'Search',
                    href: '/search'
                },
                {
                    title: 'Threat Feeds',
                    href: '/feeds'
                },
                {
                    title: 'Executive Summary',
                    href: '/executive'
                },
                {
                    title: 'Log in',
                    href: '/login'

                }
            ]
        }
    }
})
