import postcss from 'postcss';
import { readFileSync as read } from 'fs';
import test from 'ava';

import plugin from '../';

const inCSS = read('./fixtures/pseudos.css', 'utf-8');

function run(t, input, output, opts = { }) {
  return postcss([ plugin(opts) ]).process(input.trim())
    .then( result => {
      t.same(result.css, output.trim());
      t.same(result.warnings().length, 0);
    });
}

test('should add proper pseudoclass selectors', t => {
  const expectedOut = read(
    './fixtures/pseudos.out.css',
    'utf-8'
  );

  return run(t, inCSS, expectedOut, { });
});

test('should add all combinations (slower) of pseudoclass selectors ' +
  'if the `allCombinations` option is set to `true`', t => {
  const expectedOut = read(
    './fixtures/pseudos-combinations.out.css',
    'utf-8'
  );

  return run(t, inCSS, expectedOut, { allCombinations: true });
});

test('split `rule.selector`', t => {
  const selectors = read('./fixtures/selector-splitting.css', 'utf-8');

  return run(t, selectors, selectors, { });
});
