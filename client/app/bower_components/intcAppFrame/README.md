# How to instrument

1. Install via bower: `bower install --save intcAppFrame#4.x`
2. Include `'intcAppFrame'` in your modules dependencies. For example:

	```javascript
	  angular.module('yourApp', ['intcAppFrame', ...otherDependenciesHere... ]);
	```

3. Import the included scss in your main.scss file: `@import "intcAppFrame/scss/intcAppFrame"`

4. Add the directive to your `index.html` file. You could do it like so:

	```html
	    <intc-app-frame frame-templates="vm.frameTemplates" frame-data="vm.frameData">
	      <div class="container" ng-view=""></div>
	    </intc-app-frame>
	```

6. If your frame data is large and constantly changing, we suggest using a controller to provide app frame data. You will need to create a controller to make the app frame work if you are using callbacks (calling functions when events are fired, read more about callbacks below).

	```javscript
	AppFrameController:
	(function () {
	  'use strict';

	  angular.module('appFrameTester')
	    .controller('AppFrameController', AppFrameController);

	  /* @ngInject */
	  function AppFrameController() {
	      /*eslint no-unused-vars:0*/

	    var vm = this;
	    vm.frameData = {
	      name: 'IT Developer Zone',
	      itemsRight: [],
	      footer: {}
	    };

	    vm.frameTemplates = {
	      header: 'linksDeterminedByObj.iafHeader.html'
	    };

	  }
	})();

	```

# API

The following options are accepted by the intc-app-frame directive:

```js
<intc-app-frame frame-templates="" frame-data=""></intc-app-frame>
```

## `frame-templates`

*optional* : takes and object in the form of:
```
{
  header: 'string',
  footer: 'string'
}
```
The strings passed in are the path to an html file you would like to be used. For example, specifing `'hello.html'` in the `header` field will cause the `hello.html` file to be used in the app's header area. If you don't specify a template then the default will be used. Some templates come predefined in the frame. See the [templates section](#templates) to learn about them.


The layout consists of 4 parts:

1. The **header**. This fits the links, application name, Intel logo and whatever else you’d like. Mobile considerations must
be made. There is no scrolling in this section. The header is fixed.
2. The **body** contains the content of your app. You can scroll through content in this view.
3. The **footer** can contain a variety of information. It is best not to put to much information in here. The footer is
also fixed.

For a detailed walkthrough of creating your own frame template see [Adding your own template](#addingyourowntemplate)

## `frame-data`

*optional* Any data you would like to be passed to the template. The way the data is expected is entirely
dependent on the frame template specified.

You can pass data inline or from a variable. Data passed in from a variable is bound.

```html
  <intc-app-frame frame-data="vm.frameData"></intc-app-frame>

```

### Full frame-data Example

```js
vm.frameData = {
  name: 'your app name/title',          //required
  shortName: 'shortened',               //optional
  noLogo: bool                          //optional, defaults to false.
  itemsLeft: [                          //optional
    {
      title: 'someTitle',         //title you want displayed for this link
      href: 'some link',          // the href to where the link goes
      target: '_blank or _self',  // whether the link opens in current (_self) or new (_target) tab
      itemClass: 'someClass',     // a class you want applied to this link
      iconClass: 'intelicon',     // optional: The icon you want applied to the left of the link text. See goto/iconlibrary to find the icons you can use
      viewable: 'function',       // optional: a function returning true or false; controls visisbility of item
      subItems: [                 // if this is a dropdown specifiy the subItems. the href is ignored.
        {
          title: ...,
          click: ...,             //note this is a click and not an href; accepts a function as input
          itemClass: ...,
          iconClass: ...
        },
        {
          title: 'Third Level Menu'
          auxItems: [
            {
              title: 'Consul',
              href: 'https://consul.io'
            }
          ]
        }
        ...
      ],
      dataTemplate: '<some-html></some-html>',   //specify your own html for this element. title, href, and subitems are ignored
    },
    ... n other items ...
  ],
  itemsRight: [                         //optional
  ...items same as itemsLeft above...
  ],
  subnav: {
    itemsLeft: [
      ... same as above ...
    ],
    itemsRight: [
      ... same as above ...
    ]
  }.
  callbacks: {
    linkClicked: some function          //optional
    //any other callbacks you need.
  },
  searchCallback: function(searchQuery){}    //optional: if defined search field is added to navbar
                                             //specify your own callback to be called when enter key is pressed, all other settings are ignored
  footer: {
      rightText: 'some text on the left',   //optional
      rightTextSmall : 'short left text',   //optional; recommend either rightLeft or rightLeftSmall - not both
      rightText: 'some text on the right',   //optional
      rightTextSmall : 'short right text'    //optional; recommend either rightText or rightTextSmall - not both
  }
```

### Item Example(s)

#### HREF

If using **href**, below are the properties you can use.


```js
{
    title: '',
    href: '',
    target: '_blank or _self',  // whether the link opens in current (_self) or new (_target) tab
    itemClass: 'someClass',     // a class you want applied to this link
    iconClass: 'intelicon',
    viewable: function() { return true; }
}
```
#### Click

If using **click**, below are the properties you can use.

```js
{
    title: '',
    click: myFunction() { console.log(arguments); },
    itemClass: 'someClass',     // a class you want applied to this link
    iconClass: 'intelicon',
    viewable: function() { return someVariable; }
}
```

#### Data Template

If using **dataTemplate**, below are the properties you can use.

```js
{
    dataTemplate: "<some-html>anything, really</some-html>"
}
```
#### Search

If using **searchCallback**, below are the properties you can use.

```js
{
    searchCallback: function(searchQuery){
      // do something with searchQuery
    }
}



# Templates

## Using the provided template

The intc-app-frame comes with a template so you don't have to worry about implementing your own. You can use this template without specifying a `frame-template` attribute. The frame accepts data and uses that data to put links in the nav bar. A simple example follows:

```html
<!-- Simple Example: Using the built in template -->
<intc-app-frame frame-data="'My Application Name'">
...
</intc-app-frame>
```

There are many more examples of using this in the [demo page](#demo). The data can be as simple as that passed-in above or as complex as the object specificed below:

```js
{
  name: 'your app name/title',          //optional
  noLogo: bool                          //optional, defaults to false.
  itemsLeft: [                          //optional
    {
      title: 'someTitle',         //title you want displayed for this link
      href: 'some link',          // the href to where the link goes
      target: '_blank or _self',  // whether the link opens in current (_self) or new (_target) tab
      itemClass: 'someClass',     // a class you want applied to this link
      iconClass: 'intelicon',     // optional: The icon you want applied to the left of the link text. See goto/iconlibrary to find the icons you can use
      subItems: [                 // if this is a dropdown specifiy the subItems. the href is ignored.
        {
          title: ...,
          href: ...,
          itemClass: ...,
          iconClass: ...
        },
        ...
      ],
      dataTemplate: '<some-html></some-html>'   //specify your own html for this element. title, href, and subitems are ignored
    },
    ... n other items ...
  ],
  itemsRight: [                         //optional
  ...items same as itemsLeft above...
  ],
  subnav: {
    itemsLeft: {
      ... same as above ...
    },
    itemsRight: {
      ... same as above ...
    }
  }.
  callbacks: {
    linkClicked: some function          //optional
    //any other callbacks you need.
  }
```

See the [demo page](#demo) for an example that uses all of these data items.


## Callbacks
- Callbacks are called when events are fired. We currently support callbacks for the click event.
- The callback for the click function is called linkCalledFunction. Set its value to the function you want to call when a link is clicked.

```javascript
		// one of the items
		{
        name: 'AppFrameDemo',
        itemsRight: [
          {
            title: 'AngularJS'
          }
        ],
        callbacks: {
          note: 'You\'ll have to inspect the source to see the callbacks',
          linkClicked: linkClicked
        }
      }
```

## Adding your own template

If you decide that you want to specify your own header html you can. You'll do this by passing in your new html via the [frame-templates attribute](#frame-templates). Be sure to read the API section first. This section walks through creating your own tempalte and adding it into the app frame.

1. Create a `*.html` file that you want as your header. In this example `helloHeader.html` is used.

  ```html
    <nav class="navbar navbar-default">
      <div class="container-fluid">
          <div class="navbar-header">
              <a class="navbar-brand" href="#">
                  Hello User!
              </a>
          </div>
      </div>
    </nav>
  ```

2. Pass `helloHeader.html` into the app frame.

  ```html
   <intc-app-frame frame-templates="{
        header: 'helloHeader.html'
      }">

        ...other page content here

    </intc-app-frame>
  ```
  Your header will look like ![hello user walkthrough step 2 results](https://github.intel.com/intc/intc-app-frame/raw/2.x/docs/images/helloUserWalkthrough.PNG "hello user walkthrough step 2 results")
3. Add in some data consumtion. Lets modify our header to take a name of the current user, this way it can be more friendly. Our new header will look like this:

  ```html
    <nav class="navbar navbar-default">
      <div class="container-fluid">
          <div class="navbar-header">
              <a class="navbar-brand" href="#">
                  Hello {{frameData.username}}!
              </a>
          </div>
      </div>
    </nav>
  ```

4. Now we can pass in data and we will see the user's name is displayed.

  ```html
   <intc-app-frame frame-templates="{
        header: 'helloHeader.html'
      }" frame-data="{
        username: 'John'
      }">

        ...other page content here

    </intc-app-frame>
  ```
  Your header will look like ![hello user walkthrough step 4 results](https://github.intel.com/intc/intc-app-frame/raw/2.x/docs/images/helloUserWalkthrough2.PNG "hello user walkthrough step 4 results")

## Adding a footer

Using the same method [above](#adding-your-own-template) you can add a footer! intcAppFrame has the ability to have a footer, but it isn't added by default. You'll have to define is and add it manually (for now). For example your footer html might look like:

```html
<div class="col-xs-12">
  <div class="pull-right" style="width:250px;">
    <p>For internal use only<p>
  </div>
  <div class="pull-left">
    <p>Intel Confidential</p>
  </div>
</div>
```

Then you would add it to your application with:

```html
   <intc-app-frame frame-templates="{
        header: 'someheader.html',
        footer: 'path/to/your/footer.html'
      }">

        ...other page content here

    </intc-app-frame>
```

You'll need to allocate space for your footer as well. You can do this by setting the `$footer-height` variable in your `main.scss`. That file might look something like this:

```
// Override default path for fonts and icons, since our gulp tasks produce a different structure and break this relative path.
$intel-font-path: "fonts/";
$font-path: "fonts/";
$footer-height: 50px;       //You have to set this variable so that the app frame knows to make space for your footer.
                            //The header is 50px, in this example we are setting the footer size to be the same.

@import "it-mlaf-sass/it-mlaf";
@import "scss/intcAppFrame";

...other imports and styles...
```

## Example Implementation
- This repo has the app frame implemented with the controller and callbacks. Look at the docs page for the code.
