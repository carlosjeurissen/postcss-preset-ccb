#!/usr/bin/env node
'use strict';

function getPluginList (options) {
  const fallbackFeatures = options.fallback !== false;
  const upcomingFeatures = options.upcoming !== false;
  const upnextFeatures = Boolean(options.next);
  const fallbackUnshipped = fallbackFeatures || upnextFeatures;

  const minifyCss = options.minify;
  const preserveUnlessMinify = !minifyCss;

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
      /webkit-scrollbar/
    );
  }

  /* todo
    https://github.com/maximkoretskiy/postcss-initial
    https://github.com/polemius/postcss-clamp
    https://github.com/Semigradsky/postcss-attribute-case-insensitive
    https://github.com/JLHwung/postcss-font-family-fangsong
    https://github.com/JLHwung/postcss-ic-unit
    https://github.com/mrcgrtz/postcss-opacity-percentage
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-ic-unit
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-color-function
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-hwb-function
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-image-set-function
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-is-pseudo-class
    https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-oklab-function
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

    upnextFeatures && require('postcss-custom-media')({ preserve: false }), // safe preprocessor (postcss-preset-env)

    fallbackFeatures && require('postcss-custom-properties')({ preserve: true }), // safe fallback (postcss-preset-env)
    fallbackFeatures && require('postcss-double-position-gradients')({ preserve: true }), // safe fallback (postcss-preset-env)
    upcomingFeatures && require('postcss-font-variant'), // safe fallback (postcss-preset-env)
    upcomingFeatures && require('postcss-font-family-system-ui')({ preserve: true }), // safe fallback (postcss-preset-env)
    fallbackFeatures && require('postcss-gap-properties')({ preserve: true }), // safe fallback (postcss-preset-env)
    upnextFeatures && require('postcss-media-minmax'), // safe preprocessor (postcss-preset-env)
    upnextFeatures && require('postcss-nesting'), // safe preprocessor (postcss-preset-env)
    upnextFeatures && require('postcss-custom-selectors')({ preserve: preserveUnlessMinify }), // safe preprocessor (postcss-preset-env)

    upcomingFeatures && require('postcss-page-break'), // safe fallback (postcss-preset-env)
    fallbackFeatures && require('postcss-place')({ preserve: preserveUnlessMinify }), // safe preprocessor (postcss-preset-env)
    fallbackFeatures && require('postcss-pseudo-class-any-link')({ preserve: preserveUnlessMinify }), // safe preprocessor (postcss-preset-env)

    fallbackFeatures && require('postcss-pseudo-any'), // preprocessor, future-revision (postcss-preset-env)

    fallbackFeatures && require('postcss-selector-not').default, // safe preprocessor, future-revision (postcss-preset-env)

    Boolean(options.logicalDir) && fallbackFeatures && require('postcss-logical'), // tricky preprocessor (postcss-preset-env)
    Boolean(options.logicalDir) && upcomingFeatures && require('postcss-dir-pseudo-class'), // tricky preprocessor (postcss-preset-env)

    fallbackFeatures && require('postcss-color-functional-notation')({ preserve: preserveUnlessMinify }), // safe preprocessor (postcss-preset-env)
    fallbackUnshipped && require('postcss-color-gray'), // safe preprocessor, don't use (postcss-preset-env)
    fallbackFeatures && require('postcss-color-hex-alpha')({ preserve: preserveUnlessMinify }), // safe preprocessor (postcss-preset-env)
    upnextFeatures && require('postcss-lab-function')({ preserve: false }), // safe preprocessor (postcss-preset-env)
    fallbackFeatures && require('postcss-color-rebeccapurple')({ preserve: false }), // safe preprocessor (postcss-preset-env)
    fallbackUnshipped && require('postcss-color-mod-function'), // safe preprocessor, don't use (postcss-preset-env)

    fallbackFeatures && require('postcss-overflow-shorthand')({ preserve: preserveUnlessMinify }), // safe fallback (postcss-preset-env)
    fallbackFeatures && require('postcss-replace-overflow-wrap')({ method: 'copy' }), // safe fallback (postcss-preset-env)

    upcomingFeatures && require('postcss-normalize-display-values'), // safe preprocessor
    fallbackFeatures && require('pixrem'), // safe fallback

    fallbackFeatures && require('postcss-redundant-color-vars'), // safe fix fallback for https://bugs.webkit.org/show_bug.cgi?id=185940
    fallbackFeatures && require('postcss-clip-path-polyfill'), // safe fallback
    fallbackFeatures && require('postcss-calc')({ preserve: true }), // safe fallback
    fallbackFeatures && require('postcss-flexbugs-fixes'), // safe fix preprocessor
    upcomingFeatures && require('postcss-font-format-keywords'), // safe preprocessor
    fallbackFeatures && require('postcss-will-change'), // safe fallback

    fallbackFeatures && require('autoprefixer'), // safe fallback

    minifyCss && require('cssnano')({
      preset: [
        'default', {
          discardComments: false,
          autoprefixer: true,
          cssDeclarationSorter: false,
          svgo: false,
          zindex: false
        }
      ]
    }),

    minifyCss && purgeCss && require('@fullhuman/postcss-purgecss')({
      content: [
        sourceDir + '/**/*.js',
        sourceDir + '/**/*.html'
      ],
      safelist: {
        deep: purgeCssWhitelist
      },
      rejected: true,
      extractors: [
        {
          extractor: function (source) {
            return [
              ...source.split(/[.'"; ]/g)
            ];
          },
          extensions: ['js']
        }
      ]
    }),

    minifyCss && require('cssnano')({
      preset: [
        'default', {
          autoprefixer: true,
          cssDeclarationSorter: false,
          svgo: false,
          zindex: false
        }
      ]
    }),

    fallbackFeatures && require('postcss-nth-child-fix') // safe fix for android 4.1 and 4.2 bug
  ];

  return postcssPlugins.filter((item) => {
    return item !== false;
  });
}

exports.getPluginList = getPluginList;
module.exports = exports.getPluginList;
