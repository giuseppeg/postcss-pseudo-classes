const INTERACTIVE_STATES = {
  ':hover': true,
  ':active': true,
  ':focus': true,
  ':visited': true,
  ':focus-visible': true,
  ':focus-within': true
};

const plugin = function (options = {}) {
  options.preserveBeforeAfter = options.preserveBeforeAfter ?? true;

  // Backwards compatibility--we always by default ignored `:root`.
  const blacklist = {
    ':root': true,
    ':host': true,
    ':host-context': true
  };

  const prefix = options.prefix ?? '\\:';

  let restrictTo;
  if (options.custom) {
    let list;
    if (Array.isArray(options.custom)) {
      list = options.custom;
    } else {
      list = options.custom(Object.keys(INTERACTIVE_STATES));
    }
    restrictTo = list.reduce((target, pseudoClass) => {
      const finalClass =
        (pseudoClass.charAt(0) === ':' ? '' : ':') +
        pseudoClass.replace(/\(.*/g, '');
      target[finalClass] = true;
      return target;
    }, {});
  } else {
    restrictTo = INTERACTIVE_STATES;
  }

  return {
    postcssPlugin: 'postcss-pseudo-classes',
    prepare() {
      const fixed = [];
      return {
        Rule(rule) {
          if (fixed.indexOf(rule) !== -1) {
            return;
          }
          fixed.push(rule);

          let combinations;

          rule.selectors.forEach(selector => {
            // Ignore some popular things that are never useful
            if (blacklist[selector]) {
              return;
            }

            if (!selector.includes(':')) {
              return;
            }

            const selectorParts = selector.split(' ');
            const pseudoedSelectorParts = [];

            selectorParts.forEach((selectorPart, index) => {
              const pseudos = selectorPart.match(/::?([^:]+)/g);

              if (!pseudos) {
                if (options.allCombinations) {
                  pseudoedSelectorParts[index] = [selectorPart];
                } else {
                  pseudoedSelectorParts.push(selectorPart);
                }
                return;
              }

              const baseSelector = selectorPart.substr(
                0,
                selectorPart.length - pseudos.join('').length
              );

              const classPseudos = pseudos.map(pseudo => {
                const pseudoToCheck = pseudo.replace(/\(.*/g, '');
                // restrictTo a subset of pseudo classes
                if (!restrictTo[pseudoToCheck]) {
                  return pseudo;
                }

                // Ignore pseudo-elements!
                if (pseudo.match(/^::/)) {
                  return pseudo;
                }

                // Ignore ':before' and ':after'
                if (
                  options.preserveBeforeAfter &&
                  [':before', ':after'].indexOf(pseudo) !== -1
                ) {
                  return pseudo;
                }

                // Kill the colon
                pseudo = pseudo.substr(1);

                // Replace left and right parens
                pseudo = pseudo.replace(/\(/g, '\\(');
                pseudo = pseudo.replace(/\)/g, '\\)');

                return '.' + prefix + pseudo;
              });

              // Add all combinations of pseudo selectors/pseudo styles given a
              // selector with multiple pseudo styles.
              if (options.allCombinations) {
                combinations = createCombinations(pseudos, classPseudos);
                pseudoedSelectorParts[index] = [];

                combinations.forEach(combination => {
                  pseudoedSelectorParts[index].push(baseSelector + combination);
                });
              } else {
                pseudoedSelectorParts.push(
                  baseSelector + classPseudos.join('')
                );
              }
            });

            if (options.allCombinations) {
              const serialCombinations = createSerialCombinations(
                pseudoedSelectorParts,
                appendWithSpace
              );

              serialCombinations.forEach(combination => {
                addSelector(combination);
              });
            } else {
              addSelector(pseudoedSelectorParts.join(' '));
            }

            function addSelector(newSelector) {
              if (newSelector && newSelector !== selector) {
                rule.selector += ',\n' + newSelector;
              }
            }
          });
        }
      };
    }
  };
};
plugin.postcss = true;

// a.length === b.length
function createCombinations(a, b) {
  let combinations = [''];
  let newCombinations;
  for (let i = 0, len = a.length; i < len; i += 1) {
    newCombinations = [];
    combinations.forEach(combination => {
      newCombinations.push(combination + a[i]);
      // Don't repeat work.
      if (a[i] !== b[i]) {
        newCombinations.push(combination + b[i]);
      }
    });
    combinations = newCombinations;
  }
  return combinations;
}

// arr = [[list of 1st el], [list of 2nd el] ... etc]
function createSerialCombinations(arr, fn) {
  let combinations = [''];
  let newCombinations;
  arr.forEach(elements => {
    newCombinations = [];
    elements.forEach(element => {
      combinations.forEach(combination => {
        newCombinations.push(fn(combination, element));
      });
    });
    combinations = newCombinations;
  });
  return combinations;
}

function appendWithSpace(a, b) {
  if (a) {
    a += ' ';
  }
  return a + b;
}

module.exports = plugin;
