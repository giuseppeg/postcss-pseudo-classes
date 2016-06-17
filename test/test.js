import postcss from 'postcss';
import { readFileSync } from 'fs';
import test from 'ava';

import plugin from '../';

const read = fileName => readFileSync(fileName, 'utf-8');
const inCSS = read('./fixtures/pseudos.css');

function run(t, input, output, opts = { }) {
  return postcss([ plugin(opts) ]).process(input.trim())
    .then( result => {
      t.same(result.css, output.trim());
      t.same(result.warnings().length, 0);
    });
}

test('should add proper pseudoclass selectors', t => {
  const expectedOut = read('./fixtures/pseudos.out.css');
  return run(t, inCSS, expectedOut, { });
});

test('should add all combinations (slower) of pseudoclass selectors ' +
  'if the `allCombinations` option is set to `true`', t => {
  const expectedOut = read('./fixtures/pseudos-combinations.out.css');
  return run(t, inCSS, expectedOut, { allCombinations: true });
});

test('should add pseudoclass selectors from a list and ignore the rest', t => {
  const input = read('./fixtures/pseudos-restricted.css');
  const expectedOut = read('./fixtures/pseudos-restricted.out.css');
  const options = { restrictTo: ['nth-child', 'hover'], allCombinations: true };
  return run(t, input, expectedOut, options);
});
