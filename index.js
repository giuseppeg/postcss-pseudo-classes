var postcss = require('postcss');

module.exports = postcss.plugin('postcss-pseudo-classes', function (options) {
  options = options || {};
  options.preserveBeforeAfter = options.preserveBeforeAfter || true;

  // Backwards compatibility--we always by default ignored `:root`.
  var blacklist = {
    ':root': true
  };

  (options.blacklist || []).forEach(function (blacklistItem) {
    blacklist[blacklistItem] = true;
  });

  var restrictTo;

  if (Array.isArray(options.restrictTo) && options.restrictTo.length) {
    restrictTo = options.restrictTo.reduce(function (target, pseudoClass) {
      var finalClass = (pseudoClass.charAt(0) === ':' ? '' : ':') +
        pseudoClass.replace(/\(.*/g, '');
      if (!target.hasOwnProperty(finalClass)) {
        target[finalClass] = true;
      }
      return target;
    }, {});
  }

  return function (css) {
    css.walkRules(function (rule) {
      var combinations;

      rule.selectors.forEach(function (selector) {
        // Ignore some popular things that are never useful
        if (blacklist[selector]) {
          return;
        }

        var selectorParts = selector.split(' ');
        var pseudoedSelectorParts = [];

        selectorParts.forEach(function (selectorPart, index) {
          var pseudos = selectorPart.match(/::?([^:]+)/g);

          if (!pseudos) {
            if (options.allCombinations) {
              pseudoedSelectorParts[index] = [selectorPart];
            } else {
              pseudoedSelectorParts.push(selectorPart);
            }
            return;
          }

          var baseSelector = selectorPart.substr(
            0,
            selectorPart.length - pseudos.join('').length
          );

          var classPseudos = pseudos.map(function (pseudo) {
            // restrictTo a subset of pseudo classes
            if (
              blacklist[pseudo] ||
              restrictTo &&
              !restrictTo[pseudo.replace(/\(.*/g, '')]
            ) {
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

            return '.\\:' + pseudo;
          });

          // Add all combinations of pseudo selectors/pseudo styles given a
          // selector with multiple pseudo styles.
          if (options.allCombinations) {
            combinations = createCombinations(
              pseudos,
              classPseudos
            );
            pseudoedSelectorParts[index] = [];

            combinations.forEach(function (combination) {
              pseudoedSelectorParts[index].push(baseSelector + combination);
            });
          } else {
            pseudoedSelectorParts.push(baseSelector + classPseudos.join(''));
          }
        });

        if (options.allCombinations) {
          var serialCombinations = createSerialCombinations(
            pseudoedSelectorParts,
            appendWithSpace
          );

          serialCombinations.forEach(function (combination) {
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
    });
  };
});

// a.length === b.length
function createCombinations(a, b) {
  var combinations = [''];
  var newCombinations;
  for (var i = 0, len = a.length; i < len; i += 1) {
    newCombinations = [];
    combinations.forEach(function (combination) {
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
  var combinations = [''];
  var newCombinations;
  arr.forEach(function (elements) {
    newCombinations = [];
    elements.forEach(function (element) {
      combinations.forEach(function (combination) {
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
