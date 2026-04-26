# Visual Controller for Vanilla JS
*Requirements: None (framework-agnostic)*

![version](https://img.shields.io/github/package-json/v/peterNaydenov/visual-controller-for-vanilla-js)
![license](https://img.shields.io/github/license/peterNaydenov/visual-controller-for-vanilla-js)

Tool for building a **micro-frontends**(**MFE**) based on **vanilla JavaScript** - Start multiple vanilla JS applications in the same HTML page and control them. Unlike other visual controllers that depend on specific frameworks, this one works with user-provided start and destroy functions.

Install visual controller:
```
npm i @peter.naydenov/visual-controller-for-vanilla-js
```

Initialization process:
```js
import VisualController from '@peter.naydenov/visual-controller-for-vanilla-js'

var dependencies = {
        // ... put here libraries that should be available for all components
    }
var html = VisualController( dependencies )
// Controller is ready to use...
```


## Required App Structure

Vanilla JS apps must be exported as an object with `start` and optional `destroy` functions:

```js
function myApp ( props ) {
        // props: { id, container, dependencies, data, setupUpdates }
        
        var container = props.container
        var dependencies = props.dependencies
        var data = props.data
        var setupUpdates = props.setupUpdates
        
        // Create your DOM elements
        var button = document.createElement('button')
        button.textContent = 'Click me'
        container.appendChild(button)
        
        // Register update methods for external control
        setupUpdates({
                increment: function() {
                        // update logic here
                        console.log('Button clicked')
                    }
                , getValue: function() {
                        return button.textContent
                    }
            })
        
        // Return cleanup handle (required for destroy function)
        return { button: button }
    }


function destroyApp(handle) {
        // handle is the object returned by start function
        handle.button.remove()
    }


export default {
        start: myApp,
        destroy: destroyApp
    }
```


### Props received by start function

The `start` function receives a props object with:
- `id` - Container element id
- `container` - The DOM element where app is mounted
- `dependencies` - Dependencies provided during VisualController initialization
- `data` - Data passed as second argument to publish
- `setupUpdates(methods)` - Callback to register update methods accessible via `getApp`


## Publishing an App

```js
html.publish ( appDefinition, { greeting: 'Hi' }, 'app' )
// arguments: ( appDefinition, data, containerID )
```

Example:
```js
import MyApp from './components/MyApp.js'
import VisualController from 'visual-controller-for-vanilla-js'

var html = VisualController()

html.publish( MyApp, { greeting: 'Hello!' }, 'app-container' )
```

If app with specific `id` exists, old copy will be destroyed first automatically.
If app with `id` is not registered but container is not empty - expectation is that this is result of server rendition. If you want to not activate hydration, remove the content first;


## Visual Controller Methods
```js
  publish : 'Render app in container. Associate app instance with the container.'
, getApp  : 'Returns "update methods" registered by function "setupUpdates"'
, destroy : 'Destroy app by using container name '
, has     : 'Checks if app with specific "id" was published'
```



### VisualController.publish ()
Publish a vanilla JS app.
```js
html.publish ( appDefinition, props, containerID )
```
- **appDefinition**: *object*. App definition with `start` and optional `destroy` functions
- **props**: *object*. Data object to pass to the app
- **containerID**: *string*. Id of the container where app will live



### VisualController.getApp ()
Returns an object with update-methods for app defined by calling the `setupUpdates` function from within the component.

```js
var update_functions_list = html.getApp ( containerID )
```
- **containerID**: *string*. Id of the container.

Example:
```js
var 
      id = 'videoControls'
    , app = html.getApp ( id )
    ;
if ( app )   app.increment() // use update methods of the component
else {
        console.error ( 'App for id:"' + id + '" is not available' )
    }
```
If visual controller(html) has an app associated with this name will return it. Otherwise will return **false**.



### VisualController.destroy ()
Will destroy app associated with this container name and container will become empty. Function will return 'true' on success and 'false' on failure. 
Function will not delete content of provided container if there is no app associated with it.

```js
html.destroy ( containerID )
```
- **containerID**: *string*. Id name.



### VisualController.has ()
Checks if app with specific id was published.
```js
var exists = html.has ( containerID )
```
- **containerID**: *string*. Id name.
- **returns**: *boolean*. True if app exists, false otherwise.



## Compatibility Requirements

- **Browser**: Any modern browser with ES6+ support (for Promise, document.getElementById)
- **No framework dependencies**: Works with any JavaScript app that follows the required structure
- **Dependencies**: Requires `ask-for-promise` package for promise handling (included as peer dependency)



## Other details and requirements

- Visual controller will provide a "**dependency**" object inside props to every started app;
- Check a [release history](https://github.com/PeterNaydenov/visual-controller-for-vanilla-js/blob/main/Changelog.md);


### Extra

Visual Controller has versions for few other front-end frameworks:
- [React](https://github.com/PeterNaydenov/visual-controller-for-react)
- [Vue 3](https://github.com/PeterNaydenov/visual-controller-for-vue3)
- [Svelte v.5](https://github.com/PeterNaydenov/visual-controller-for-svelte5)
- [Solid](https://github.com/PeterNaydenov/visual-controller-for-solid)
- [Preact](https://github.com/PeterNaydenov/visual-controller-for-preact)
- [Lit](https://github.com/PeterNaydenov/visual-controller-for-lit)
- [Vue 2](https://github.com/PeterNaydenov/visual-controller-for-vue)
- [Svelte v.3 and v.4](https://github.com/PeterNaydenov/visual-controller-for-svelte3)