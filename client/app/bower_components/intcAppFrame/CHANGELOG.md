# Changelog

## 4.5.21

- When the app frame is listening to all click events, and is determining whether or not the search break out needs to be closed; the `offsetParent` variable is null.  Added a condition to test this variable before executing on the variable.

## 4.5.19

- Refactor search slideout to automatically collapse when a click event happens outside of the slideout while expanded

## 4.4.18

- Fix "Cannot read property 'getBoundingClientRect' of undefined" Bug

## 4.4.17

- fix: added capability to search for the unordered list instead of assuming position as child in DOM. Useful for when icons are used w/anchors.
- chore: removed the keep folder.

## 4.4.16

- added the ability for 3rd level menu items via the `auxItems` array of menu items
- dropdown menu detects window position and will shift orientation right when it is too close to the right side of the window.
- added convienence property for menu items `divider` - a boolean for adding a divider between anchor/link menu items.

## 4.3.17

- Accessibility improvments on search
  - When tabbing out of the searchbox the searchbox is hidden
  - Additinal aria attributes added

## 4.3.16

- Accessibility improvments on search

## 4.3.15

- Refined search capability
  - Extracted from data driven header
  - Hidden by default and visibility toggles on click

  ```js
  vm.frameData = {
    ...
    searchCallback: function(searchQuery){}    //optional: if defined search field is added to navbar
                                                //specify your own callback to be called when enter key is pressed, all other settings are ignored
    ...
  }
  ```

## 4.3.14

- Added the ability to add a search box with a callback as a part of the topnav

  ```js
  itemsRight: [
    ...
    {
      searchCallback: function(searchQuery){
        // called on enter press in search box
        // do stuff with searchQuery
      }
    },
    ...
  ]
  ```

## 4.2.9 - 4.3.12

??

## 4.2.9
- Replaced screen reader only span that announces "(current)" with aria-current attribute
- Fixed keyboard navigation on clickable links

## 4.2.6

- Added `angular-sanitize` as dependency and included it in the module declaration for intc-app-frame
- For menu items that use the `data-template` attribute, no longer have to sanitize the HTML; this is done automatically.
- Resolves [issue 21](https://github.intel.com/intc/intc-app-frame/issues/21#issuecomment-59463)

## 4.1.4

- Subnav style was being enabled when no subnav present, thus causing some issues with z-index.

## 4.1.3

- Merge 3.x and 4.x codebase.

## 3.4.11

- resolve a bug where items in the menu were stuck in the 'active' or highlighted state.

## 3.4.8

- Added .npmrc
- In testing found an interpoloation for vm.frameTemplates.header in templates/intcAppFrame.html; removed

## 3.4.7

- Fix: style; adjust active text color to white from blue

## 3.4.6

- chore: typo/bad copy in `intcAppFrame.js` calling setActive method that no longer exists; should be init.

## 3.4.5

- Style update for smaller default height
- Support for custom footers to set `frameData.footer.active`

## 3.4.4

- cleanup of `expanded` attribute from directive and tempaltes (dataDrivenLinks) since $emit and $on are used instead.
- Added `viewable` attribute for items.
- Updated the `docs` app examples and implementation.
- Removed ie8 support from `docs` example.
- Chore; removed expanded attribute from dataDrivenLinks directive.
- Style: synchronize style rules for media queries - all use same max-width now
- Adjusted html templates for new object initialization and default values
- Refactored intc-app-frame directive to use controller approach instead of link function.

## 3.3.4

- Converted directives to use controller and controller as syntax
- Removed slide and mobile slide capabilities; they appeared to not be fully implemented and were therefore removed.
- Found a typo/miss on template definition that was not interpolated
- Fixed active text color to be white instead of intel blue (background is dark blue)

## 3.3.3

- Added short name attribute for mobile

## 3.2.3

- Remove max-height for nav-collapse
- Change max width from 767 to $grid-float-breakpoint

## 3.2.2

- Bug fixes: removed angular-mocks as a dependency; fixed typo in dataDriven template. Cleaned up examples.

## 3.2.0

- Added click capability for items; no longer have to rely on callback function to do your ng-click items!
- removed some inline styles from the footer

## 3.1.0

- (Mobile) when no links or menu items, dont show the hamburger (menu button)
- (Mobile) changed color scheme to not use intel-blue as background for menu; not enough contrast, too blue
- (Mobile) clicking on a link in the menu will now close the menu; previously you would select an item and then have to tap the menu button again to close.
- (Mobile) added border to bottom of menu
- (Mobile) added padding to bottom of menu
- Added border-top to footer
- Fix gulp `compileStyles` so it wouldnt import it-mlaf twice (doubling the size of the `docs` css
- added version info to package.json and bower.json
- Restricted anularjs dependency to 1.x
- Restricted it-mlaf-sass dependency to 3.x
- Added gulp-debug module for use with gulp
- Added favicon.ico for browsers who require such things, and give 404's if you dont have one.
- Remove lodash as a dependency; not needed to do for loops in javascript
- Added project support for linting with ESLint (removed jshint)
- Reorganized and optimized the gulp tasks
- Added a unit test; updated karma configuration; added code coverage reports

## 3.0.0

- chore: several major updates to dependencies

## 2.5.0

- chore: update angular semvar notation

## 2.4.2

- chore: update angular reference

## 2.4.1

- fix: ui-router patch for ui-sref

## 2.4.0

- feat: ui.router support

## 2.3.0

- feat: ability to open targets into a new/existing window

## 2.2.1

- fix: minification bug fix

## 2.2.0

+ feat(linksByData): Ability to add icon to the left of the link.

  Just add the `iconClass` data member to your data object and fill it with a string of the class you want applied like : `'intelicon-menu'`
+ fix(header): set active items with leading / to work as well as no leading slash
+ fix(*): Callbacks where not being called.
+ docs(readme): add in info on how to add a footer.

## 2.1.0

+ Added subnavs! See the demo page too see them in action!
+ Fixed 1px off bug.
+ Fixed bug where items on the left would never become active
+ Made the default header `linksDeterminedByObj.iafHeader.html`. Removed the other headers from the website and documentation. I did this because the linksByObjHeader can be used to make all of the other templates. I demonstrate this on the demo page by keeping the template the same but inputting different data. As a result these headers will be removed in 3.x.
+ Lots more documentation

## 2.0.1

- fix(active): Fix active links to show properly.
- Cleanup documentation

## 2.0.0

While implementation detials are similar everything has changed. If you are looking to migrate then implementation details can
be found in README.md.
