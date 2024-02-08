/* eslint-env node, es2022 */
/* eslint-disable
  global-require,
  no-autofix/strict,
*/

import {
  describe,
  expect,
  test,
} from 'vitest';

import fs from 'node:fs';
import postcss from 'postcss';
import postcssPrettify from 'postcss-prettify';
import postcssDiscardComments from 'postcss-discard-comments';

import postcssPluginsPreset from '..';

const inputCss = fs.readFileSync('./__tests__/input.css', 'utf8');
const validOutputCss = fs.readFileSync('./__tests__/valid-output.css', 'utf8');
const validOutputMinifiedCss = fs.readFileSync('./__tests__/valid-output-minified.css', 'utf8');

describe('The output matches expectations', () => {
  test('normal output', () => postcss(postcssPluginsPreset({
    resolveImports: true,
    next: true,
    minify: false,
  })).process(inputCss, {
    from: undefined,
  }).then(({ css }) => {
    fs.writeFileSync('./__tests__/actual-output.css', css);
    expect(css).toBe(validOutputCss);

    return postcss([
      postcssPrettify,
      postcssDiscardComments,
    ]).process(css, {
      from: undefined,
    }).then(({ css }) => {
      fs.writeFileSync('./__tests__/actual-output-no-comments.css', css);
    });
  }));

  test('minified output', () => postcss(postcssPluginsPreset({
    resolveImports: true,
    next: true,
    minify: true,
  })).process(inputCss, {
    from: undefined,
  }).then(({ css }) => postcss([
    postcssPrettify,
    postcssDiscardComments,
  ]).process(css, {
    from: undefined,
  })).then(({ css }) => {
    fs.writeFileSync('./__tests__/actual-output-minified.css', css);
    expect(css + '\n').toBe(validOutputMinifiedCss);
  }));
});
