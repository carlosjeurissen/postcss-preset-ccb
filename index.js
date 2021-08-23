#!/usr/bin/env node
'use strict';

function getPluginList (options) {
  const fallbackFeatures = options.fallback !== false;
  const upcomingFeatures = options.upcoming !== false;
  const upnextFeatures = Boolean(options.next);
  const fallbackUnshipped = fallbackFeatures || upnextFeatures;

  const minifyCss = options.minify;
  const purgeCss = Boolean(options.purge);
  const preserveUnlessMinify = !minifyCss;

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
          autoprefixer: true,
          cssDeclarationSorter: false,
          svgo: false,
          zindex: false
        }
      ]
    }),

    minifyCss && purgeCss && require('@fullhuman/postcss-purgecss')(options.purge),

    fallbackFeatures && require('postcss-nth-child-fix') // safe fix for android 4.1 and 4.2 bug
  ];

  return postcssPlugins.filter((item) => {
    return item !== false;
  });
}

exports.getPluginList = getPluginList;
module.exports = exports.getPluginList;
