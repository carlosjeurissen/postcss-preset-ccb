#!/usr/bin/env node

'use strict';

function getPluginList (options) {
  const fallbackFeatures = options.fallback !== false;
  const upcomingFeatures = options.upcoming !== false;
  const upnextFeatures = Boolean(options.next);
  const fallbackUnshipped = fallbackFeatures || upnextFeatures;
  const notComplyingStylelintCcb = !options.ccbCompliant;

  const minifyCss = options.minify;
  const preserveUnlessMinify = !minifyCss;
  const preserveOnlyForAdditionalClarity = preserveUnlessMinify && false;
  const preserveOnceImplementedAnywhere = false;

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

  /* todo
    https://github.com/maximkoretskiy/postcss-initial, todo awaiting https://github.com/maximkoretskiy/postcss-initial/issues/49
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-attribute-case-insensitive
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-cascade-layers
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-env-function

    notComplyingStylelintCcb && https://github.com/mrcgrtz/postcss-opacity-percentage
  */

  /* potentials, requiring js
    https://github.com/csstools/postcss-plugins/tree/main/plugins/css-blank-pseudo
    https://github.com/csstools/postcss-plugins/tree/main/plugins/css-has-pseudo
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-focus-visible
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-focus-within
    https://github.com/csstools/postcss-plugins/tree/main/plugins/css-prefers-color-scheme
    https://www.npmjs.com/package/container-query-polyfill
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-env-function
  */

  const postcssPlugins = [
    Boolean(options.resolveImports) && require('postcss-import'), // non-standard preprocessor
    Boolean(options.inputRange) && require('postcss-input-range'), // non-standard preprocessor

    notComplyingStylelintCcb && upnextFeatures && require('postcss-custom-media')({ preserve: false }), // safe preprocessor (postcss-preset-env)

    fallbackFeatures && require('postcss-custom-properties')({ preserve: true }), // safe fallback (postcss-preset-env) todo incorrect fallback
    fallbackFeatures && require('postcss-double-position-gradients')({ preserve: true }), // safe fallback (postcss-preset-env)
    // fallbackFeatures && require('postcss-image-set-function')({ preserve: preserveUnlessMinify }), prefer non-image-set fallback, todo

    fallbackFeatures && require('postcss-gap-properties')({ preserve: preserveUnlessMinify }), // safe fallback (postcss-preset-env), future-revisit 2022-06-20
    upcomingFeatures && require('postcss-media-minmax'), // safe preprocessor (postcss-preset-env)
    upnextFeatures && require('postcss-nesting'), // safe preprocessor (postcss-preset-env)
    upnextFeatures && require('postcss-custom-selectors')({ preserve: preserveOnceImplementedAnywhere }), // safe preprocessor (postcss-preset-env) future-revisit 2022-06-20
    fallbackFeatures && require('postcss-page-break'), // safe fallback (postcss-preset-env)
    fallbackFeatures && require('postcss-place')({ preserve: preserveUnlessMinify }), // safe preprocessor (postcss-preset-env)
    fallbackFeatures && require('postcss-pseudo-class-any-link')({ preserve: preserveUnlessMinify }), // safe preprocessor (postcss-preset-env)

    fallbackFeatures && require('postcss-pseudo-any')({ matchModern: true, matchPrefixed: true }), // specificity-unsafe preprocessor, future-revisit (postcss-preset-env), alternative: https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-is-pseudo-class

    fallbackFeatures && require('postcss-selector-not'), // specificity-unsafe preprocessor, future-revisit (postcss-preset-env)

    Boolean(options.logicalDir) && fallbackFeatures && require('postcss-logical'), // tricky preprocessor (postcss-preset-env)
    Boolean(options.logicalDir) && upcomingFeatures && require('postcss-dir-pseudo-class'), // tricky preprocessor (postcss-preset-env)

    notComplyingStylelintCcb && fallbackFeatures && require('postcss-color-functional-notation')({ preserve: preserveOnlyForAdditionalClarity }), // safe preprocessor (postcss-preset-env)
    notComplyingStylelintCcb && fallbackUnshipped && require('postcss-color-gray')({ preserve: preserveOnlyForAdditionalClarity }), // safe preprocessor, don't use (postcss-preset-env)
    notComplyingStylelintCcb && fallbackFeatures && require('postcss-color-hex-alpha')({ preserve: preserveOnlyForAdditionalClarity }), // safe preprocessor (postcss-preset-env)
    notComplyingStylelintCcb && upcomingFeatures && require('postcss-lab-function')({ preserve: true }), // safe preprocessor (postcss-preset-env)
    notComplyingStylelintCcb && upcomingFeatures && require('@csstools/postcss-oklab-function')({ preserve: true }), // safe preprocessor (postcss-preset-env)
    notComplyingStylelintCcb && fallbackFeatures && require('postcss-color-rebeccapurple')({ preserve: false }), // safe preprocessor (postcss-preset-env)
    notComplyingStylelintCcb && fallbackUnshipped && require('postcss-color-mod-function')({}), // safe preprocessor, don't use (postcss-preset-env)
    notComplyingStylelintCcb && fallbackFeatures && require('@csstools/postcss-color-function')({ preserve: true }), // safe preprocessor (postcss-preset-env)
    notComplyingStylelintCcb && require('@csstools/postcss-hwb-function')({ preserve: true }), // safe preprocessor (postcss-preset-env)
    fallbackFeatures && require('postcss-opacity-percentage')({ preserve: preserveOnlyForAdditionalClarity}),

    // fallbackFeatures && require('postcss-overflow-clip')({ add: false }), todo awaiting https://github.com/Hypnosphi/postcss-overflow-clip/issues/1
    fallbackFeatures && require('postcss-overflow-shorthand')({ preserve: preserveUnlessMinify }), // safe fallback (postcss-preset-env)
    fallbackFeatures && require('postcss-replace-overflow-wrap')({ method: 'copy' }), // safe fallback (postcss-preset-env)
    fallbackFeatures && require('postcss-clamp')({ precalculate: minifyCss }),

    upcomingFeatures && require('@csstools/postcss-normalize-display-values'), // safe preprocessor, alternative: postcss-normalize-display-values

    fallbackFeatures && require('pixrem'), // safe fallback
    notComplyingStylelintCcb && upcomingFeatures && require('postcss-ic-unit')({ preserve: true }), // safe fallback, alternative: @csstools/postcss-ic-unit

    fallbackFeatures && require('postcss-redundant-color-vars'), // safe fix fallback for https://bugs.webkit.org/show_bug.cgi?id=185940
    fallbackFeatures && require('postcss-clip-path-polyfill'), // safe fallback
    fallbackFeatures && require('postcss-calc')({ preserve: true, precision: 10 }), // safe fallback
    fallbackFeatures && require('postcss-safe-area'),
    fallbackFeatures && require('postcss-flexbugs-fixes'), // safe fix preprocessor
    fallbackFeatures && require('postcss-will-change'), // safe fallback

    upcomingFeatures && require('@csstools/postcss-stepped-value-functions')({ preserve: preserveOnceImplementedAnywhere}), // future-revisit 2022-06-20
    upcomingFeatures && require('@csstools/postcss-trigonometric-functions')({ preserve: preserveOnceImplementedAnywhere}), // future-revisit 2022-06-20

    upcomingFeatures && require('postcss-font-variant'), // safe fallback (postcss-preset-env)
    upcomingFeatures && require('postcss-font-family-system-ui')({ preserve: true }), // safe fallback (postcss-preset-env) // browserlist
    upcomingFeatures && require('postcss-font-family-fangsong')({ preserve: true }),
    upcomingFeatures && require('postcss-font-format-keywords')({ singleQuote: false }), // safe preprocessor

    fallbackFeatures && require('postcss-nth-child-fix'), // safe fix for android 4.1 and 4.2 bug

    fallbackFeatures && require('autoprefixer'), // safe fallback

    minifyCss && require('cssnano')({
      preset: [
        'default', {
          discardComments: false,
          autoprefixer: true,
          cssDeclarationSorter: false,
          svgo: false,
          zindex: false,
        },
      ],
    }),

    minifyCss && purgeCss && require('@fullhuman/postcss-purgecss')({
      content: [
        sourceDir + '/**/*.js',
        sourceDir + '/**/*.html',
      ],
      safelist: {
        deep: purgeCssWhitelist,
      },
      rejected: true,
      extractors: [
        {
          extractor: function (source) {
            return [
              ...source.split(/[ "'.;]/g),
            ];
          },
          extensions: ['js'],
        },
      ],
    }),

    minifyCss && require('cssnano')({
      preset: [
        'default', {
          autoprefixer: true,
          cssDeclarationSorter: false,
          svgo: false,
          zindex: false,
        },
      ],
    }),
  ];

  return postcssPlugins.filter((item) => item !== false);
}

exports.getPluginList = getPluginList;
module.exports = exports.getPluginList;
