(function () {
  'use strict';

  function intcAppFrameController($location, $rootScope, $scope) {
    var vm = this;

    /** VARIABLES **/
    vm.searchHidden = true;
    vm.defaultTemplates = {
      header: 'dataDriven.iafHeader.html',
      footer: ''
    };

    vm.defaultData = {
      name: 'intc-app-frame',
      noLogo: false,
      itemsLeft: [],
      itemsRight: [],
      subnav: {
        itemsLeft: [],
        itemsRight: []
      },
      callbacks: {},
      searchCallback: undefined,
      footer: {}
    };

    vm.defaultItem = {
      active: false,
      viewable: function () { return true; }
    };

    /** EVENTS **/
    var linkClickedOn = $rootScope.$on('linkClickedWrapper', function () {
      vm.frameData.expanded = !vm.frameData.expanded
    });

    var stateChangeSuccessOn = $scope.$on('$stateChangeSuccess', function () {
      init();
    });

    var routeChangeSuccessOn = $scope.$on('$routeChangeSuccess', function () {
      init();
    });

    var frameDataWatch = $scope.$watch('vm.frameData', function () {
      init();
    }, true);

    // on-click event listener in order to collapse the search-slideout when
    // a click event happens outside of the search-slideout
    var searchCallbackWatch = $scope.$watch('vm.frameData.searchCallback', function (searchCallback) {
      if (searchCallback) {
        var $appFrame = (angular.element(document.querySelector('[intc-app-frame]')).length) ? angular.element(document.querySelector('[intc-app-frame]')) : angular.element(document.querySelector('intc-app-frame'));

        $appFrame.on('click', function (event) {
          var offsetParent = angular.element(event.target).prop('offsetParent');
          if (offsetParent && offsetParent.id && !_.startsWith(offsetParent.id, 'intc-app-frame-search') && !vm.searchHidden) {
            vm.toggleSearch();
          }
        });
      }
    });

    /** FUNCTIONS **/

    function init() {
      if (vm.frameTemplates) {
        vm.frameTemplates = angular.extend({}, vm.defaultTemplates, vm.frameTemplates);
      }
      else {
        vm.frameTemplates = vm.defaultTemplates;
      }

      if (vm.frameData) {
        vm.frameData = angular.merge({}, vm.defaultData, vm.frameData);
      }
      else {
        vm.frameData = vm.defaultData;
      }

      for (var prop in vm.frameData.footer) {
        vm.frameData.footer.active = true;
      }

      if (vm.frameTemplates.footer != '') {
        vm.frameData.footer.active = true;
      }

      if (vm.frameData.subnav.itemsLeft.length || vm.frameData.subnav.itemsRight.length) {
        vm.frameData.subnav.active = true;
      }

      itemInitializer(vm.frameData.itemsLeft);
      itemInitializer(vm.frameData.itemsRight);
      itemInitializer(vm.frameData.subnav.itemsLeft);
      itemInitializer(vm.frameData.subnav.itemsRight);

    }

    function itemInitializer(items) {
      for (var idx in items) {
        var item = items[idx];

        var newItem = angular.extend({}, vm.defaultItem, item);
        item = newItem;
        items[idx] = item;

        if (item.subItems) {
          for (var subIdx in item.subItems) {
            var subItem = item.subItems[subIdx];
            var newSubItem = angular.extend({}, vm.defaultItem, subItem);
            subItem = newSubItem;

            if (subItem.auxItems) {
              for (var auxIdx in subItem.auxItems) {
                var auxItem = subItem.auxItems[auxIdx];
                var newAuxItem = angular.extend({}, vm.defaultItem, auxItem);
                auxItem = newAuxItem;

                subItem.auxItems[auxIdx] = auxItem;
              }
            }

            item.subItems[subIdx] = subItem;
          };
        }
      }
    };

    vm.toggleSearch = function($event) {
      var searchContainer = angular.element(document.querySelectorAll('#intc-app-frame-search'));
      searchContainer.toggleClass('open');
      vm.searchHidden = !vm.searchHidden;

      if(!vm.searchHidden) {
        document.querySelector('div#intc-app-frame-search > form#intc-app-frame-search-slideout > input').focus();
      }

      return true;
    };

    vm.searchKeyup = function($event){
      if( $event.keyCode === 9 ){
        vm.toggleSearch();
      }
    };

    /** INIT **/

    init();
  }
  intcAppFrameController.$inject = ['$location', '$rootScope', '$scope'];

  function intcAppFrame($templateCache) {
    var directive = {
      restrict: 'EA',
      template: $templateCache.get('intcAppFrame.html'),
      scope: {
        frameTemplates: '=?frameTemplates',
        frameData: '=?frameData'
      },
      transclude: true,
      bindToController: true,
      controller: intcAppFrameController,
      controllerAs: 'vm'
    };

    return directive;
  }
  intcAppFrame.$inject = ['$templateCache'];

  angular.module('intcAppFrame', ['intcEnter']);
  angular.module('intcAppFrame').directive('intcAppFrame', intcAppFrame);
})();
