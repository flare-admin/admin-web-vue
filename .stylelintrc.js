module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended-vue',
    'stylelint-config-prettier'
  ],
  customSyntax: 'postcss-less',
  rules: {
    'no-descending-specificity': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global']
      }
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep']
      }
    ],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['function', 'if', 'each', 'include', 'mixin']
      }
    ],
    'no-empty-source': null,
    'color-function-notation': null,
    // 'alpha-value-notation': null,
    // 'media-query-no-invalid': null,
    // 'selector-anb-no-unmatchable': null,
    'declaration-block-no-duplicate-properties': true,
    'color-no-invalid-hex': true
  }
};
