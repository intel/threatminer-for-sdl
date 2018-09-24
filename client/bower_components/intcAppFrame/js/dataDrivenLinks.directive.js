(function () {
  'use strict';

  function intcAppFrameLinksController($location, $log, $rootScope, $sce) {
    var vm = this;

    vm.functions = {
      sanitizeHTML: function (html) {
        return $sce.trustAsHtml(html);
      }
    }

    vm.linkClickedWrapper = function ($event, item) {
      $rootScope.$emit('linkClickedWrapper');

      if (item.click) {
        item.click();
        //Prevent links with click event from navigating to dummy href like #
        $event.preventDefault();
      }

      if (vm.callbacks && vm.callbacks.linkClicked) {
        vm.callbacks.linkClicked($event, item);
      }

    }

    vm.isActive = function (item) {
      //Skip all logic if no href is defined like click template. All conditions are based on href
      if (!item.href) return false;

      var active = false;

      //Grab the decoded url for cases where $locationProvider.hasPrefix is defined or url is encoded (ex: /#!#%2Fsubnav1)
      var url = decodeURIComponent($location.url());
      var path = $location.path();

      if (item.href === '#' + path || item.href === '/#' + path || _.startsWith('#' + path, item.href) || item.href === url) {
        active = true;
      }

      if (item.subItems) {
        for (var subIdx in item.subItems) {
          var subItem = item.subItems[subIdx];
          if (subItem.href && (subItem.href === '#' + path || subItem.href === '/#' + path || _.startsWith('#' + path, subItem.href) || subItem.href === url)) {
            active = true;
          }
        };
      }
      return active;
    };

    vm.isSubActive = function (item) {
      //Skip all logic if no href is defined like click template. All conditions are based on href
      if (!item.href) return false;

      var active = false;

      //Grab the decoded url for cases where $locationProvider.hasPrefix is defined or url is encoded (ex: /#!#%2Fsubnav1)
      var url = decodeURIComponent($location.url());
      var path = $location.path();

      if (item.href === '#' + path || item.href === '/#' + path || _.startsWith('#' + path, item.href) || item.href === url) {
        active = true;
      }

      if (item.auxItems) {
        for (var subIdx in item.auxItems) {
          var auxItem = item.auxItems[subIdx];
          if (auxItem.href && (auxItem.href === '#' + path || auxItem.href === '/#' + path || _.startsWith('#' + path, auxItem.href) || auxItem.href === url)) {
            active = true;
          }
        };
      }
      return active;
    };
  }
  intcAppFrameLinksController.$inject = ['$location', '$log', '$rootScope', '$sce'];

  function intcAppFrameLinks($templateCache) {
    var directive = {
      restrict: 'A',
      scope: {
        links: '=',
        callbacks: '='
      },
      template: $templateCache.get('dataDrivenLinks.html'),
      bindToController: true,
      controller: intcAppFrameLinksController,
      controllerAs: 'vm'
    };
    return directive;
  }
  intcAppFrameLinks.$inject = ['$templateCache', '$log'];

  function intcSecondLevelMenu($log, $window) {
    var directive = {
      restrict: 'C',
      link: function (scope, element, attrs) {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            if (mutation.type == "attributes") {
              var children = mutation.target.children;
              var list;

              for (var g = 0, h = children.length; g < h; g++) {
                var child = children[g];
                if (child.nodeName === 'UL') {
                  list = child;
                }
              }

              if( list === undefined ){ return; }
              var listObj = angular.element(list);
              var rect = listObj[0].getBoundingClientRect();

              var innerHeight = $window.innerHeight;

              var kids = listObj.children();
              var foundSubMenu = false;
              for (var i = 0, j = kids.length; i < j; i++) {
                var kid = kids[i];
                var kidElem = angular.element(kid);
                if (kidElem.hasClass('dropdown-submenu')) {
                  foundSubMenu = true;
                }
              }

              if (foundSubMenu && (innerWidth - rect.right < 50)) {
                for (var i = 0, j = kids.length; i < j; i++) {
                  var kid = kids[i];
                  var kidElem = angular.element(kid);

                  var descendants = kidElem.children();
                  for (var k = 0, l = descendants.length; k < l; k++) {
                    var descendant = descendants[k];
                    var descObj = angular.element(descendant);
                    if (descObj[0].nodeName === 'A') {
                      // pull anchor right; hide arrow on right; show an arrow on left
                      descObj.addClass('text-right');
                    }
                    else if (descObj[0].nodeName === 'UL') {
                      // third level menu needs ==> left: auto; && right: 100%;
                      descObj.addClass('menu-right');
                     var spawnList = descObj.find('a');
                      for (var m = 0, n = spawnList.length; m < n; m++) {
                        var spawn = spawnList[m];
                        var spawnObj = angular.element(spawn);
                        spawnObj.addClass('text-right');
                      }
                    }
                  }
                }
              }
            }
          });
        });

        observer.observe(element[0], {
          attributes: true
        });
      }
    };

    return directive;
  }
  intcSecondLevelMenu.$inject = ['$log', '$window'];

  angular.module('intcAppFrame').directive('intcSecondLevelMenu', intcSecondLevelMenu);
  angular.module('intcAppFrame').directive('intcAppFrameLinks', intcAppFrameLinks);
})();
