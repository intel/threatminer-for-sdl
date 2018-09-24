(function() {
  'use strict';

  angular.module('intcEnter', [])
    .directive('intcEnter', function intcEnter () {
      return {
        restrict:'A',
        link: function intcEnterFunc (scope, element, attrs) {

            element.bind('keydown keypress', function(event){
              if(event.which === 13){
                scope.$apply(function(){
                  scope.$eval(attrs.intcEnter);
                });
                event.preventDefault();
              }
            });
        }
      };
    });
})();
