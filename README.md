# PostCSS Pseudo Classes [![Build Status][ci-img]][ci]

[PostCSS] plugin to automatically add in companion classes
where pseudo-selectors are used.
This allows you to add the class name to force the styling of a pseudo-selector,
which can be really helpful for testing or being able
to concretely reach all style states.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/giuseppeg/postcss-pseudo-classes.svg
[ci]:      https://travis-ci.org/giuseppeg/postcss-pseudo-classes

### Credits

This plugin is a port of [rework-pseudo-classes](https://github.com/SlexAxton/rework-pseudo-classes) written by [Alex Sexton](https://twitter.com/SlexAxton).

## Installation

```bash
$ npm install postcss-pseudo-classes
```

## Example

```js
var pseudoclasses = require('postcss-pseudo-classes')({
  // default contains `:root`.
  blacklist: [],

  // (optional) create classes for a restricted list of selectors
  // N.B. the colon (:) is optional
  restrictTo: [':nth-child', 'hover'],

  // default is `false`. If `true`, will output CSS
  // with all combinations of pseudo styles/pseudo classes.
  allCombinations: true,

  // default is `true`. If `false`, will generate
  // pseudo classes for `:before` and `:after`
  preserveBeforeAfter: false

  // default is `\:`. It will be added to pseudo classes.
  prefix: '\\:'
});

postcss([ pseudoclasses ])
  .process(css)
  .then(function (result) { console.log(result.css); });
```

### style.css

```css
.some-selector:hover {
  text-decoration: underline;
}
```

yields

```css
.some-selector:hover,
.some-selector.\:hover {
  text-decoration: underline;
}
```

### usage

```html
<button class="some-selector :hover">howdy</button>
```

## Edge cases

* This plugin escapes parenthesis so `:nth-child(5)` would look like `.class.\:nth-child\(5\)` and can be used as a regular class: `<button class=":nth-child(5)">howdy</button>`.
* Pseudo-selectors with two colons are ignored entirely since they're a slightly different thing.
* Chained pseudo-selectors just become chained classes: `:focus:hover` becomes `.\:focus.\:hover`.

## Tests

```bash
$ npm test
```

## Contributors

[@ai](https://github.com/ai)

## License

(MIT)
