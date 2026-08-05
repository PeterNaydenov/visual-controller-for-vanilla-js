# Visual Controller for Vanilla JS

![version](https://img.shields.io/github/package-json/v/peterNaydenov/visual-controller-for-vanilla-js)
![license](https://img.shields.io/github/license/peterNaydenov/visual-controller-for-vanilla-js)
![npm downloads](https://img.shields.io/npm/dw/@peter.naydenov/visual-controller-for-vanilla-js)

Run multiple vanilla JavaScript apps on the same page from a single controller. Each app gets its own region defined by invisible markers — **no DOM ids, no wrapper elements, no `getElementById` calls**.

```js
import VisualController from '@peter.naydenov/visual-controller-for-vanilla-js'
import HeaderApp from './apps/header.js'
import SidebarApp from './apps/sidebar.js'
import CartApp from './apps/cart.js'

const html = new VisualController({ /* shared dependencies */ })

// Place markers anywhere in the DOM. Whatever string the callback returns
// becomes the alias. Multiple regions can share a parent.
html.set(({ start, end }) => { document.querySelector('header').append(start, end); return 'header' })
html.set(({ start, end }) => { document.querySelector('aside').append(start, end);  return 'sidebar' })
html.set(({ start, end }) => { document.querySelector('main').append(start, end);   return 'cart' })

// Publish apps into the regions.
html.publish('header', HeaderApp)
html.publish('sidebar', SidebarApp)
html.publish('cart', CartApp)
```

Each `publish` is independent — apps can be added, removed, swapped, or destroyed at runtime. Each app gets access to the same shared dependencies (event buses, stores, services) via dependency injection.

> **v2.0.0 — breaking change.** The v1 `id`-based API is gone. v2 is region-only. See [Migration from v1](#migration-from-v1) if you're upgrading.


## Why use this

Most pages need more than one vanilla JS app — a header from team A, a sidebar from team B, a checkout widget from team C. The challenge is coordinating them without coupling.

The marker model is what makes this library simple. Instead of authoring `<div id="app">` and looking it up with `document.getElementById('app')`, you place invisible markers directly in the DOM and the controller finds them by alias:

```js
// v1: tag the element, look it up, pass the id
<div id="app"></div>
html.publish(MyApp, props, 'app')

// v2: place markers, return the alias — no DOM id, no wrapper
html.set(({ start, end }) => {
    document.querySelector('#main').append(start, end)
    return 'app'
})
html.publish('app', MyApp, props)
```

The nesting of `set` and `publish` looks like extra steps, but the payoff is that the controller owns the location. No ids to manage, no collisions, no wrapper elements. The HTML author doesn't need to know which app will live where — they just write `<main>` and the JS declares the regions.

The dynamic lifecycle is the other half:

```js
// Swap apps in a region without touching the DOM
html.publish('header', HeaderApp)        // first app
html.publish('header', PromoBannerApp)   // same alias, different app
html.destroy('header')                   // markers stay, region is empty
html.publish('header', HeaderApp)        // re-publish
```

Same parent, multiple regions, no DOM ids, no wrapper elements.


## Quick start

```js
import VisualController from '@peter.naydenov/visual-controller-for-vanilla-js'
import HeaderApp from './header.js'
import SidebarApp from './sidebar.js'

const html = new VisualController({ /* dependencies */ })

// 1. Define regions. Each callback receives { start, end } markers
//    (invisible text nodes) and must attach both to the DOM.
//    Whatever string the callback returns becomes the alias.
html.set(({ start, end }) => {
    document.querySelector('#main').append(start, end)
    return 'header'
})

html.set(({ start, end }) => {
    document.querySelector('#main').append(start, end)
    return 'sidebar'
})

// 2. Publish apps into regions.
html.publish('header', HeaderApp, { greeting: 'Hi!' })
html.publish('sidebar', SidebarApp)
```

```html
<main id="main">
    <h2>Static page heading</h2>
    <!-- regions are placed by the JS above. No <div id="..."> wrappers. -->
</main>
```

The same parent (`#main`) hosts two regions with no `id` collisions. Selection is by alias, not by DOM lookup.

> The marker model is the same one used by [`@peter.naydenov/dim`](https://github.com/PeterNaydenov/dim). A slim inlined subset of dim lives in `src/dim.js` (no separate install). See that file's header for the upstream reference.


## API

```js
  set     : 'Define a region by placing markers in the DOM'
, publish : 'Mount a vanilla JS app into a region by alias'
, destroy : 'Unmount the app(s); empty the range(s); keep the markers'
, has     : 'Is an app currently published in this region?'
, getApp  : 'Returns the setupUpdates interface for a published app'
, isEmpty : 'Is the region empty (no content between markers)?'
, list    : 'Returns every alias registered via set'
, reset   : 'Unmount all apps, clear internal state, remove the markers'
```


### `html.set(fn, ...args)`

Define a region. The callback receives `{ start, end }` text-node markers and must attach both to the DOM. Whatever string the callback returns becomes the alias used by all other methods.

```js
html.set(({ start, end }) => {
    document.querySelector('#main').append(start, end)
    return 'header'
})

// Extra args are forwarded to the callback.
html.set(({ start, end }, locale) => {
    // ...
    return 'l10n-header'
}, 'en')
```

The placement is entirely up to you — anywhere the markers can be inserted. Multiple regions can live inside the same parent. Markers stay where you put them for the lifetime of the page (or until `reset()`).


### `html.publish(alias, appDef, data?, extraParams?)`

Mount a vanilla JS app into a region. The controller inserts a `<div>` (or uses the existing element when content is present), calls the app's `start(props)` function, and tracks the app under the alias.

| Arg           | Required | Default | Description |
| ------------- | -------- | ------- | ----------- |
| `alias`       | yes      | —       | Region alias (returned from `set`). |
| `appDef`      | yes      | —       | App definition object with `start(props)` and optional `destroy()`. |
| `data`        | no       | `{}`    | Data object passed as `props.data` to `start`. |
| `extraParams` | no       | `{}`    | Reserved for future use. Accepted, ignored. |

Returns a `Promise` resolving to the `setupUpdates` object, or `false` on error.

```js
// Bare minimum
html.publish('header', MyApp)

// With data
html.publish('header', MyApp, { greeting: 'Hi!' })

// All four
html.publish('header', MyApp, { greeting: 'Hi!' }, { /* future */ })
```

Calling `publish` for an alias that already has a published app silently destroys the old one first, then mounts the new one. Same alias, different app, same location.


### `html.destroy(target?)`

Unmount the app published in a region and empty the range. Markers stay in the DOM, so the alias can be `publish`-ed again later.

```js
html.destroy('header')              // → true / false
html.destroy()                      // → count of apps destroyed across all aliases
html.destroy(['header', 'sidebar']) // → count of those actually destroyed
```

Three forms:

- **`destroy(alias)`** — single alias string. Returns `true` on success, `false` if the alias has no published app.
- **`destroy()`** — no args. Destroys every published app across all aliases. Returns the count of apps destroyed.
- **`destroy(aliases)`** — array of alias strings. Destroys each; missing aliases are silently skipped. Returns the count actually destroyed.

**What `destroy()` touches:** the app's `destroy()` function (if provided), the mount container (removes from DOM), and the cache entry (so `has(alias)` is `false`).
**What `destroy()` does NOT touch:** the markers (stay in the DOM), the alias in `list()` (stays registered, can be re-published), or the dim registry (no re-`set()` needed).

For a full cleanup that also removes markers, use `reset()`.


### `html.has(alias)`

Returns `true` if an app is currently published in this region, `false` otherwise. Empty regions (markers exist but no app published) return `false`.

```js
html.has('header')   // → boolean
```


### `html.getApp(alias)`

Returns the `setupUpdates` object provided from inside the published app, or `false` if the alias has no published app.

```js
const app = html.getApp('header')
if (app)   app.changeMessage('New value')
else       console.error('App not published')
```


### `html.isEmpty(alias)`

Is the region empty (no content between its markers)? Returns `true` if the range is collapsed (empty) **or** if the markers are orphaned (no longer in the DOM). Returns `undefined` for an unknown alias and logs an error.

```js
html.isEmpty('header')   // → true / false / undefined
```

Useful for pre-publish checks: `if (html.isEmpty('header')) await html.publish(...)`. After `destroy`, the range is empty again (markers stay, app gone), so `isEmpty` returns `true`.


### `html.list()`

Returns an array of every alias registered via `set`, regardless of whether each region currently has a published app. Cleared by `reset()`.

```js
html.list()   // → ['header', 'sidebar']
```


### `html.reset()`

Unmounts every published app, clears internal state, and removes every marker from the DOM. After `reset()`, the aliases are gone and the regions must be re-created with `set()` before publishing again.

```js
html.reset()
```


## Inside an app

A vanilla JS app is an object with a `start(props)` function and an optional `destroy()` function:

```js
function HeaderApp ( props ) {
  const { container, dependencies, data, setupUpdates } = props
  const { capitalize } = dependencies

  let message = capitalize(data.greeting) || 'Hello'
  let count = 0

  container.innerHTML = `
    <div class="hello">
      <h3>${message}</h3>
      <p>Count: ${count}</p>
      <button>Increment</button>
    </div>
  `

  const button = container.querySelector('button')
  const counter = container.querySelector('p')
  const title = container.querySelector('h3')

  button.addEventListener('click', () => {
    counter.textContent = `Count: ${++count}`
  })

  setupUpdates({
    changeMessage ( newMsg ) { title.textContent = newMsg },
    increment () { counter.textContent = `Count: ${++count}` },
    getCount () { return count }
  })
}


function destroyHeaderApp () {
  // Optional cleanup. Called before the container is removed.
}


export default { start: HeaderApp, destroy: destroyHeaderApp }
```

### `props` received by `start`

| Property         | Description |
| ---------------- | ----------- |
| `alias`          | The alias of the region. |
| `container`      | The DOM element where the app should render its content. |
| `dependencies`   | Shared dependencies provided to the `VisualController` constructor. |
| `data`           | The data object passed to `publish` (defaults to `{}`). |
| `setupUpdates`   | Function `(methods) => void` to register an external update interface. |

External access goes through the alias:

```js
const updates = html.getApp('header')
updates.changeMessage('New message content')
updates.increment()
updates.getCount()   // → 1
```


## Other details

### SSR hydration

When you pre-populate a region with HTML (server-rendered or static markup), `publish` detects it and uses it as the mount target — the controller will not replace it, so any pre-existing DOM stays intact.

```js
// Render on the server, then drop the HTML into the region
const ssrHtml = await renderComponentToString(HeaderApp)

html.set(({ start, end }) => {
    document.querySelector('#main').append(start, end)
    return 'header'
})

// Manually insert the SSR HTML between the markers
const tmpl = document.createElement('template')
tmpl.innerHTML = ssrHtml
document.querySelector('#main').insertBefore(tmpl.content.firstElementChild, /* end marker */)

// Publish — will use the existing DOM as the mount target
await html.publish('header', HeaderApp)
```

Three cases:

- **Empty range** → controller inserts a `<div>` and mounts fresh.
- **Single element between markers** → uses that element directly as the mount target.
- **Multiple sibling nodes between markers** (fragment template) → wraps them in a `<div style="display:contents">` and mounts the wrapper.

Because vanilla JS apps control their own rendering, "hydration" here simply means the controller passes the existing DOM to the app as `container` instead of creating a new one. Your app is responsible for using it (or replacing it) as it sees fit.


## Development

Setup and common commands:

```bash
npm install
npm test         # run the test suite
npm run cover    # coverage report
npm run types    # regenerate dist/main.d.ts from JSDoc
npm run build    # build + regenerate types
npm run dev      # run the demo at http://localhost:5173/
```

Source layout:

| Path | Purpose |
| --- | --- |
| `src/main.js` | The controller. ~250 lines including JSDoc. |
| `src/dim.js` | Slim inlined subset of the dim marker model. ~120 lines. |
| `test/01_controller.test.js` | Test suite. |
| `test/components.js` | Test app definitions used by tests. |
| `demo/` | Runnable demo (`app.js`, `main.js`). |
| `index.html` | Entry point for `npm run dev`. |
| `dist/` | Build artifacts (committed for npm publishing). |

#### Adding a new method

1. Add the function to `src/main.js` with JSDoc.
2. Export it from the `return { ... }` block at the bottom.
3. Add it to the `VisualControllerInstance` typedef near the top.
4. Add tests in `test/01_controller.test.js`.
5. Update the README's API table and section.
6. Add a bullet to `Changelog.md` under the current version.

#### Keeping the inlined dim in sync

The dim model is owned by the official `@peter.naydenov/dim` package. If the upstream API changes, diff `src/dim.js` against the reference implementation (see the file header for the GitHub URL) and update the inlined subset to match. The methods used by the controller are `set`, `get`, `reset`, `aliases`, and the range's `isEmpty`.


## Migration from v1

If you're upgrading from the v1 `id`-based API, here is the short version:

| v1 | v2 |
| --- | --- |
| `<div id="app"></div>` authored in HTML | No element needed — markers are placed via `set` |
| `html.publish(appDef, data, 'app')` | `html.set(...); html.publish('app', appDef, data)` |
| `html.destroy('app')` | `html.destroy('app')` (same) |
| `html.has('app')` | `html.has('app')` (same) |
| `html.getApp('app')` | `html.getApp('app')` (same) |
| Container passed as `props.container` | Same — `props.container` is now a marker-created `<div>` (or the existing element for SSR) |

The biggest behavioral change is that the controller no longer looks anything up by DOM id. The alias returned from `set`'s callback replaces the role of the id completely. Markers can be placed anywhere in the DOM (not just inside a pre-authored `<div id="...">`), so multiple regions can share a parent.


## Extra

Visual Controller has versions for other front-end frameworks:
- [React](https://github.com/PeterNaydenov/visual-controller-for-react)
- [Vue 3](https://github.com/PeterNaydenov/visual-controller-for-vue3)
- [Svelte 5](https://github.com/PeterNaydenov/visual-controller-for-svelte5)
- [Solid](https://github.com/PeterNaydenov/visual-controller-for-solid)
- [Preact](https://github.com/PeterNaydenov/visual-controller-for-preact)
- [Lit](https://github.com/PeterNaydenov/visual-controller-for-lit)
- [Vue 2](https://github.com/PeterNaydenov/visual-controller-for-vue)
- [Svelte 3 and 4](https://github.com/PeterNaydenov/visual-controller-for-svelte3)


## Credits

'visual-controller-for-vanilla-js' was created and supported by Peter Naydenov.


## License

Released under the [MIT License](https://github.com/PeterNaydenov/visual-controller-for-vanilla-js/blob/main/LICENSE).
