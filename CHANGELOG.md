# micromorph

## 0.4.3

### Patch Changes

- Update `startViewTransition` logic

## 0.4.2

### Patch Changes

- 9b8e241: Revert previous patch

## 0.4.1

### Patch Changes

- f84618e: Treat entire navigation as a transition

## 0.4.0

### Minor Changes

- cbcaa44: Automatically add `route-announcer` element, support `data-router-ignore` and `data-router-noscroll` attributes to opt `a` links out of SPA routing or `scrollToTop` behavior.

  Updates default export of `micromorph/spa` entrypoint to return an instance of `Router` for programatic control.

  Updates default export of `micromorph/nav` entrypoint to return an instance of `Router` for programatic control.

### Patch Changes

- f969b64: Update code to support View Transitions by default
- 08cd7b5: Await `beforeDiff` and `afterDiff`

## 0.3.1

### Patch Changes

- f472e4f: remove logs, support scrollToTop option

## 0.3.0

### Minor Changes

- 5502cd9: Add `micromorph/nav` entrypoint, which uses the upcoming Navigation API

## 0.2.2

### Patch Changes

- a8cab71: Add license (MIT)

## 0.2.1

### Patch Changes

- Oops, actually publish the `dist` folder

## 0.2.0

### Minor Changes

- d56bca8: Adds the `include` option to control which anchor tags trigger a SPA navigation. Supports either a filter-like callback function or a selector string.

  Adds the `scrollToTop` option to control if SPA navigation should reset scroll on navigation.
