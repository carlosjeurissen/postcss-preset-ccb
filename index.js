#!/usr/bin/env node

/* eslint-disable
  unicorn/prefer-module,
  disable-autofix/strict,
  global-require,
*/

'use strict';

function getPluginList (options) {
  const fallbackFeatures = options.fallback !== false;
  const upcomingFeatures = options.upcoming !== false;
  const upnextFeatures = Boolean(options.next);
  const logicalFeatures = Boolean(options.logicalDir);
  const fallbackUnshipped = fallbackFeatures || upnextFeatures;
  const notComplyingStylelintCcb = !options.ccbCompliant;

  const minifyCss = options.minify;
  const preserveUnlessMinify = !minifyCss;
  const preserveOnlyForAdditionalClarity = preserveUnlessMinify && false;
  const preserveOnceImplementedAnywhere = false;
  const requiredForCcb = true;

  const blockDirection = options.blockDirection || 'left-to-right';
  const inlineDirection = options.inlineDirection || 'top-to-bottom';

  let sourceDir = options.source || '';
  if (sourceDir.endsWith('/')) {
    sourceDir = sourceDir.slice(0, -1);
  }

  let purgeCssWhitelist = options.purge;
  const purgeCss = Boolean(purgeCssWhitelist);
  if (purgeCss) {
    if (!Array.isArray(purgeCssWhitelist)) {
      purgeCssWhitelist = [];
    }
    purgeCssWhitelist.push(
      /^class$/,
      /^dir$/,
      /^disabled$/,
      /^draggable$/,
      /^hidden$/,
      /^open$/,
      /^required$/,
      /^role$/,
      /^tabindex$/,
      /^data-/,
      /^aria-/,
      /webkit-scrollbar/,
    );
  }

  /* TODO general
    -webkit-text-decoration: underline;
    text-decoration: underline;

    autoprefixer should not prefix the above

    color:hwb(200 0% 0%/.5) should be replaced with color:hwb(200 0 0/.5) when minified?
  */

  /* maybe, low priority
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-rebase-url
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-global-data
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-extract
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-design-tokens
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-conditional-values
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-todo-or-die
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-slow-plugins
    https://www.npmjs.com/package/container-query-polyfill
  */

  const cssNanoConfig = {
    autoprefixer: true,
    cssDeclarationSorter: false,
    mergeIdents: false,
    reduceIdents: false,
    svgo: false,
    zindex: false,
  };

  const postcssPlugins = [
    Boolean(options.resolveImports) && require('postcss-import'), // non-standard preprocessor
    Boolean(options.inputRange) && require('postcss-input-range'), // non-standard preprocessor

    notComplyingStylelintCcb && upnextFeatures && require('postcss-custom-media')({ preserve: false }), // safe preprocessor (preset-env: 'custom-media-queries')
    // TODO JS fallbackFeatures && require('postcss-env-function') (preset-env: 'environment-variables'), (order: run environment-variables here to access transpiled custom media params and properties)
    fallbackFeatures && require('postcss-safe-area'), // env fallbacks
    notComplyingStylelintCcb && fallbackFeatures && require('postcss-image-set-function')({ preserve: preserveUnlessMinify }), // (preset-env: 'image-set-function'), (order: run images-set-function before nesting-rules so that it may fix nested media)
    fallbackFeatures && require('postcss-media-minmax'), // safe preprocessor (preset-env: 'media-query-ranges')
    upnextFeatures && require('@csstools/postcss-media-queries-aspect-ratio-number-values')({ preserve: preserveOnlyForAdditionalClarity }), // safe preprocessor (preset-env)
    // TODO JS fallbackFeatures && require('css-prefers-color-scheme') // (preset-env: 'prefers-color-scheme-query') (order: run prefers-color-scheme-query here to prevent duplicate transpilation after nesting-rules)
    fallbackFeatures && require('postcss-nesting')({
      edition: '2024-02',
    }), // safe preprocessor (preset-env)
    (upnextFeatures || upcomingFeatures || fallbackFeatures) && require('postcss-custom-selectors')({ preserve: preserveOnceImplementedAnywhere }), // safe preprocessor (preset-env) (future-revisit: 2022-06-20), (order: run custom-selectors after nesting-rules to correctly transpile &:--custom-selector)

    fallbackFeatures && require('postcss-pseudo-class-any-link')({ preserve: preserveUnlessMinify }), // safe preprocessor (preset-env: 'any-link-pseudo-class')
    // TODO C fallbackFeatures && require('postcss-attribute-case-insensitive')({preserve: preserveForAdditionalClarity}) (preset-env)
    // TODO JS fallbackFeatures && require('postcss-focus-visible'), (preset-env: 'focus-visible-pseudo-class')
    fallbackFeatures && require('postcss-selector-not'), // specificity-unsafe preprocessor, (future-revisit) (preset-env: 'not-pseudo-class') (order: run not-pseudo-class after other selectors have been transpiled)

    logicalFeatures && fallbackFeatures && require('postcss-logical')({ blockDirection, inlineDirection }), // tricky preprocessor (preset-env: 'logical-properties-and-values') (order: run logical-properties-and-values before dir-pseudo-class)
    logicalFeatures && fallbackFeatures && require('@csstools/postcss-logical-float-and-clear')({ inlineDirection }), // (preset-env: 'logical-float-and-clear')
    logicalFeatures && upcomingFeatures && require('@csstools/postcss-logical-overflow')({ inlineDirection }), // (preset-env)
    logicalFeatures && fallbackFeatures && require('@csstools/postcss-logical-overscroll-behavior')({ inlineDirection }), // (preset-env)
    logicalFeatures && fallbackFeatures && require('@csstools/postcss-logical-resize')({ blockDirection, inlineDirection }), // (preset-env)
    logicalFeatures && fallbackFeatures && require('@csstools/postcss-logical-viewport-units')({ inlineDirection, preserve: true }), // (preset-env)
    logicalFeatures && fallbackFeatures && require('postcss-dir-pseudo-class'), // tricky preprocessor (preset-env)

    // TODO 'all-property', // run all-property before other property polyfills (preset-env: 4 'initial') https://github.com/maximkoretskiy/postcss-initial, todo awaiting https://github.com/maximkoretskiy/postcss-initial/issues/49 or https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-initial

    upcomingFeatures && require('@csstools/postcss-gradients-interpolation-method')({ preserve: true }), // (preset-env) (order: run before all color functions)
    notComplyingStylelintCcb && fallbackUnshipped && require('postcss-color-gray')({ preserve: preserveOnlyForAdditionalClarity }), // safe preprocessor, don't use
    notComplyingStylelintCcb && fallbackUnshipped && require('postcss-color-mod-function')({}), // safe preprocessor, don't use
    notComplyingStylelintCcb && fallbackFeatures && require('@csstools/postcss-color-mix-function')({ preserve: true }), // (preset-env) (order: run before any other color functions)
    upcomingFeatures && require('@csstools/postcss-relative-color-syntax')({ preserve: preserveOnlyForAdditionalClarity }), // (preset-env)
    notComplyingStylelintCcb && fallbackFeatures && require('postcss-lab-function')({ preserve: true }), // safe preprocessor (preset-env)
    notComplyingStylelintCcb && fallbackFeatures && require('@csstools/postcss-oklab-function')({ preserve: true }), // safe preprocessor (preset-env)
    notComplyingStylelintCcb && fallbackFeatures && require('@csstools/postcss-color-function')({ preserve: true }), // safe preprocessor (preset-env)
    notComplyingStylelintCcb && fallbackFeatures && require('@csstools/postcss-hwb-function')({ preserve: true }), // safe preprocessor (preset-env: '')
    fallbackFeatures && require('postcss-color-functional-notation')({ preserve: preserveOnlyForAdditionalClarity }), // safe preprocessor (preset-env)
    notComplyingStylelintCcb && fallbackFeatures && require('postcss-color-rebeccapurple')({ preserve: false }), // safe preprocessor (preset-env: 'rebeccapurple-color')
    notComplyingStylelintCcb && fallbackFeatures && require('postcss-color-hex-alpha')({ preserve: preserveOnlyForAdditionalClarity }), // safe preprocessor (preset-env: 'hexadecimal-alpha-notation')
    fallbackFeatures && require('postcss-double-position-gradients')({ preserve: true }), // safe fallback (preset-env)
    // TODO JS require('css-blank-pseudo'); // (preset-env: 'blank-pseudo-class')
    fallbackFeatures && require('postcss-page-break'), // safe fallback (preset-env: 'break-properties')
    fallbackFeatures && require('postcss-font-variant'), // safe fallback (preset-env: 'font-variant-property')

    // TODO properly handle is and any fallbacks (two plugins below)
    fallbackFeatures && require('postcss-matches-is-pseudo-class')({ preserve: preserveOnlyForAdditionalClarity }),
    fallbackFeatures && require('@csstools/postcss-is-pseudo-class'), // specificity-unsafe preprocessor, required for postcss-custom-selectors (preset-env: '') (order: after other selector transforms, before :has())
    fallbackFeatures && require('postcss-pseudo-any')({ matchModern: false, matchPrefixed: true }), // specificity-unsafe preprocessor (order: before postcss-is-pseudo-class)

    notComplyingStylelintCcb && fallbackFeatures && require('@csstools/postcss-scope-pseudo-class')({ preserve: preserveOnlyForAdditionalClarity }),
    // TODO JS require('css-has-pseudo'), (preset-env: 'has-pseudo-class')
    requiredForCcb && fallbackFeatures && require('postcss-gap-properties')({ preserve: preserveUnlessMinify }), // safe fallback (preset-env), future-revisit 2022-06-20
    notComplyingStylelintCcb && fallbackFeatures && require('postcss-overflow-shorthand')({ preserve: preserveUnlessMinify }), // (preset-env: 'overflow-property')
    fallbackFeatures && require('postcss-replace-overflow-wrap')({ method: 'copy' }), // safe fallback (preset-env: 'overflow-wrap-property')
    fallbackFeatures && require('postcss-place')({ preserve: preserveUnlessMinify }), // safe preprocessor (preset-env: 'place-properties')
    upcomingFeatures && require('postcss-font-family-fangsong')({ preserve: true }),
    fallbackFeatures && require('postcss-font-family-system-ui')({ preserve: true }), // safe fallback (preset-env: 'system-ui-font-family') // browserlist
    upcomingFeatures && require('@csstools/postcss-font-format-keywords')({ preserve: preserveOnlyForAdditionalClarity }), // safe preprocessor (preset-env)
    fallbackFeatures && require('@csstools/postcss-normalize-display-values'), // safe preprocessor, alternative: postcss-normalize-display-values, (preset-env: 'display-two-values')
    notComplyingStylelintCcb && fallbackFeatures && require('@csstools/postcss-ic-unit')({ preserve: true }), // safe fallback (preset-env)
    fallbackFeatures && require('postcss-opacity-percentage')({ preserve: preserveOnlyForAdditionalClarity }),
    notComplyingStylelintCcb && fallbackFeatures && require('@csstools/postcss-text-decoration-shorthand')({ preserve: preserveUnlessMinify }), // safe preprocessor (preset-env)
    notComplyingStylelintCcb && fallbackFeatures && require('@csstools/postcss-unset-value')({ preserve: true }), // safe preprocessor (preset-env)

    // Math functions
    upcomingFeatures && require('@csstools/postcss-stepped-value-functions')({ preserve: preserveOnceImplementedAnywhere }), // future-revisit 2022-06-20 (preset-env)
    fallbackFeatures && require('@csstools/postcss-trigonometric-functions')({ preserve: preserveOnceImplementedAnywhere }), // future-revisit 2022-06-20 (preset-env)
    upcomingFeatures && require('@csstools/postcss-exponential-functions')({ preserve: preserveOnlyForAdditionalClarity }), // safe fallback (preset-env)
    fallbackFeatures && require('@csstools/postcss-nested-calc')({ preserve: preserveOnlyForAdditionalClarity }), // safe fallback (preset-env)
    fallbackFeatures && require('postcss-clamp')({ precalculate: minifyCss }), // (preset-env: 'clamp')

    fallbackFeatures && require('postcss-custom-properties')({ preserve: true }), // safe fallback (preset-env)

    fallbackFeatures && require('@csstools/postcss-progressive-custom-properties'), // (preset-env)

    fallbackFeatures && require('@csstools/postcss-cascade-layers'), // (preset-env)

    fallbackFeatures && require('@csstools/postcss-gamut-mapping'), // (preset-env)

    fallbackFeatures && require('postcss-calc')({ precision: 10, preserve: true }), // safe fallback
    // TODO JS https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-focus-within
    fallbackFeatures && require('postcss-redundant-color-vars'), // safe fix fallback for https://bugs.webkit.org/show_bug.cgi?id=185940
    fallbackFeatures && require('postcss-overflow-fallbacks')({ addOverlayFallback: notComplyingStylelintCcb }),
    fallbackFeatures && require('postcss-clip-path-polyfill'), // safe fallback
    fallbackFeatures && require('postcss-will-change'), // safe fallback
    fallbackFeatures && require('postcss-flexbugs-fixes'), // safe fix preprocessor
    fallbackFeatures && require('postcss-nth-child-fix'), // safe fix for android 4.1 and 4.2 bug
    fallbackFeatures && require('postcss-pixrem')({ browsers: null }), // safe fallback

    fallbackFeatures && require('autoprefixer'), // safe fallback (preset-env)

    // Obsolete due to cssnano precense minifyCss && require('@csstools/postcss-minify'), // (preset-env)

    minifyCss && require('cssnano')({
      preset: [
        'default',
        cssNanoConfig,
        { discardComments: false },
      ],
    }),

    minifyCss && purgeCss && require('@fullhuman/postcss-purgecss')({
      content: [
        sourceDir + '/**/*.js',
        sourceDir + '/**/*.html',
      ],
      rejected: true,
      safelist: {
        deep: purgeCssWhitelist,
      },

      extractors: [
        {
          extensions: ['js'],
          extractor: function extractor (source) {
            return (
              source.split(/[ "'.;]/g)
            );
          },
        },
      ],
    }),

    minifyCss && require('cssnano')({
      preset: [
        'default',
        cssNanoConfig,
      ],
    }),
  ];

  return postcssPlugins.filter((item) => item !== false);
}

exports.getPluginList = getPluginList;
module.exports = exports.getPluginList;
