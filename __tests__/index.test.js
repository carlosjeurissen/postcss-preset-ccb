'use strict';

const fs = require('node:fs');

const postcss = require('postcss');
const postcssPluginsPreset = require('..');

const validInputCss = fs.readFileSync('./__tests__/valid-input.css', 'utf8');
const validOutputCss = fs.readFileSync('./__tests__/valid-output.css', 'utf8');
const validOutputMinifiedCss = fs.readFileSync('./__tests__/valid-output-minified.css', 'utf8');

describe('The output matches expectations', () => {
  test('normal output', () => postcss(postcssPluginsPreset({
    next: true,
    minify: false,
  })).process(validInputCss, {
    from: undefined,
  }).then(({ css }) => {
    fs.writeFileSync('./__tests__/actual-output.css', css);
    expect(css).toBe(validOutputCss);

    return postcss([
    require('postcss-prettify'),
    require('postcss-discard-comments'),
  ]).process(css, {
    from: undefined,
  }).then(({ css }) => {
    fs.writeFileSync('./__tests__/actual-output-no-comments.css', css);

  });
  }));

  test('minified output', () => postcss(postcssPluginsPreset({
    next: true,
    minify: true,
  })).process(validInputCss, {
    from: undefined,
  }).then(({ css }) => postcss([
    require('postcss-prettify'),
    require('postcss-discard-comments'),
  ]).process(css, {
    from: undefined,
  })).then(({ css }) => {
    fs.writeFileSync('./__tests__/actual-output-minified.css', css);
    expect(css + '\n').toBe(validOutputMinifiedCss);
  }));
});
