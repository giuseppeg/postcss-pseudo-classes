var postcss = require('postcss');

module.exports = postcss.plugin('postcss-pseudo-classes', function (options) {
  options = options || {};
  options.preserveBeforeAfter = options.preserveBeforeAfter || true;

  // Backwards compatibility--we always by default ignored `:root`.
  var blacklist = {
    ':root': true
  };

  var prefix = options.prefix || '\\:';

  var pseudoClassWhitelist = {};

  (options.psuedoClassWhitelist || []).forEach(function (whiteListItem) {
    pseudoClassWhitelist[whiteListItem.trim()] = true;
  });

  (options.blacklist || []).forEach(function (blacklistItem) {
    blacklist[blacklistItem] = true;
  });

  return function (css) {
    css.walkRules(function (rule) {
      var combinations;

      rule.selector.split(/\s*,\s*/g).forEach(function (selector) {
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
          var classPseudos = pseudos.map(function (inputPseudo) {
            // Ignore pseudo-elements!
            if (inputPseudo.match(/^::/)) {
              return inputPseudo;
            }

            // Ignore ':before' and ':after'
            if (
              options.preserveBeforeAfter &&
              [':before', ':after'].indexOf(inputPseudo) !== -1
            ) {
              return inputPseudo;
            }

            // Kill the colon
            var returnPseudo = inputPseudo.substr(1);

            // Replace left and right parens
            returnPseudo = returnPseudo.replace(/\(/g, '\\(');
            returnPseudo = returnPseudo.replace(/\)/g, '\\)');

            //  only use whitelist if it has contents
            if (options.psuedoClassWhitelist &&
              options.psuedoClassWhitelist.length > 0) {
              //  if the class is not in the whitelist - ignore
              if (!pseudoClassWhitelist[returnPseudo]) {
                return inputPseudo;
              }
            }

            return '.' + prefix + returnPseudo;
          });

          // Add all combinations of pseudo selectors/pseudo styles given a
          // selector with multiple pseudo styles.
          if (options.allCombinations) {
            combinations = createCombinations(
              pseudos,
              classPseudos,
              selectorConcat
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
function createCombinations(a, b, fn) {
  var combinations = [''];
  var newCombinations;
  for (var i = 0, len = a.length; i < len; i += 1) {
    newCombinations = [];
    combinations.forEach(function (combination) {
      newCombinations.push(fn(combination, a[i]));
      // Don't repeat work.
      if (a[i] !== b[i]) {
        newCombinations.push(fn(combination, b[i]));
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

// Returns a valid selector given pseudo-selector/pseudo-styles.
function selectorConcat(ps1, ps2) {
  if (ps2[0] === '.') {
    return ps2 + ps1;
  }
  return ps1 + ps2;
}

function appendWithSpace(a, b) {
  if (a) {
    a += ' ';
  }
  return a + b;
}
