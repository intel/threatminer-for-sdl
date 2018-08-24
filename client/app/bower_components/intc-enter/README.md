
# intcEnter

Custom directive to add increased functionality to the enter key.

## Quickstart

install with bower

```
bower install intc-enter --save
```

Include as a dependency:

```
angular.module('MYAPPNAME', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
  'angulartics.google.analytics',
  'intcEnter'
])
...
```

##Usage
```
 <input class="form-control" type="text" intc-enter = "yourFunction()" ng-model="yourModel"/>
```
