# Release History

All notable changes to this project will be documented in this file.



## 2.0.0 (2026-08-05)
- [x] **Breaking change.** Region-based API. The v1 `id`-based API (`publish(appDefinition, data, id)` etc.) is removed. Regions are defined with the inlined dim subset (see `src/dim.js`) via the new `set` method, which mirrors `dim.set` exactly.
- [x] New API: `set`, `publish(alias, appDef, data?, extraParams?)`, `destroy`, `has`, `getApp`, `isEmpty`, `list`, `reset`.
- [x] Multiple placeholders can coexist inside a single parent without DOM `id` collisions — selection is by alias returned from the `set` callback.
- [x] Destroying an app empties the region but keeps the markers, so the same alias can host a different app later.
- [x] Mount container is a `<div>` for fresh mounts, or the existing element for SSR — invisible to layout, no DOM wrapper authored by the user.
- [x] SSR hydration preserved: when the range already contains content at publish time, the controller picks it as the mount target (single element → direct mount, multiple siblings → wrapped in a mount container).
- [x] `isEmpty(alias)` delegates to the inlined dim's `range.isEmpty()` — returns `true` for collapsed or orphaned ranges, `undefined` for unknown aliases.
- [x] `destroy()` is polymorphic — accepts no argument (destroys every published app, returns count), an alias string, or an array of alias strings. Markers stay in the DOM in every form.
- [x] No `@peter.naydenov/dim` dependency. The slim subset of dim the controller uses is inlined in `src/dim.js`. The file header documents the upstream reference for syncing if the official package changes.
- [x] `extraParams` slot accepted but ignored — reserved for future use.



## 1.0.0 ( 2026-04-26 )


### Added
- [x] Initial release;
- [x] VisualController function with publish, destroy, getApp, has methods;
- [x] App definition with start and destroy functions;
- [x] Demo application;
- [x] Test suite with vitest;
- [x] Vite build configuration;