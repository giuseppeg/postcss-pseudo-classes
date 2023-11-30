# PostCSS Pseudo Classes

[PostCSS] plugin to automatically add in companion classes
where pseudo-selectors are used.
This allows you to add the class name to force the styling of a pseudo-selector,
which can be really helpful for testing or being able
to concretely reach all style states.

Example:

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

[PostCSS]: https://github.com/postcss/postcss

### Credits

This plugin is a port of [rework-pseudo-classes](https://github.com/SlexAxton/rework-pseudo-classes) written by [Alex Sexton](https://twitter.com/SlexAxton).

## Installation

```bash
$ npm install postcss-pseudo-classes
```

## Options

```js
<<<<<<< HEAD
require('postcss-pseudo-classes')({
  // (optional) list of pseudo-classes to process. Can be an array or
  // a function receiving default list and returning new one.
  custom: [
    ':hover', ':active', ':focus', ':visited', ':focus-visible', ':focus-within'
  ],

  // default is `false`. If `true`, will output CSS
  // with all combinations of pseudo styles/pseudo classes.
  allCombinations: true,

  // default is `true`. If `false`, will generate
  // pseudo classes for `:before` and `:after`
  preserveBeforeAfter: false,

  // default is `\:`. It will be added to pseudo classes.
  prefix: '\\:'
});
```

## Edge cases

* The plugin process only [user-action pseudo-classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes#user_action_pseudo-classes).
* Chained pseudo-selectors just become chained classes: `:focus:hover` becomes `.\:focus.\:hover`.

## Tests

```bash
$ npm test
```

## Contributors

[@ai](https://github.com/ai)

## License

(MIT)
