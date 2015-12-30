/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const path = require('path');
const pathExists = require('path-exists');
const vulcanize = require('./lib/vulcanize-task');
const crisper = require('./lib/crisper-task');
const rewriteRequires = require('./lib/rewrite-task');
const shim = require('./lib/shim-task');
const browserify = require('./lib/browserify-task');
const copy = require('./lib/copy-task');
const del = require('del');

module.exports = function(bundle, options) {

  const htmlOutput = path.join(process.cwd(), options.output);
  const entryFile = path.join(process.cwd(), bundle);
  // Make sure the passed in entry file is valid
  if (!pathExists.sync(entryFile)) {
    return Promise.reject(new Error('Could not find import at: ' + bundle));
  }
  // Sort out where temporary files will go
  // This is where we'll put the vulcanized html and
  // crisper'd js files before we browserify them all back together
  const htmlOutputTmp = path.resolve(
    entryFile, '../../.tmp', path.basename(htmlOutput)
  );
  const jsOutputTmp = path.basename(htmlOutputTmp, '.html') + '.js';
  // this is duplicated work (from rewrite task)
  const tmpDir = path.dirname(htmlOutputTmp);
  const prefix = path.basename(htmlOutputTmp, '.html');
  const pattern = prefix + '*.js';

  vulcanize(entryFile, htmlOutputTmp, options.skipVulcanize)
    .then(vulcanizedHtml => {
      return crisper(vulcanizedHtml, htmlOutputTmp, jsOutputTmp, options.skipCrisper);
    })
    .then(() => {
      return rewriteRequires(htmlOutputTmp, entryFile, options.skipRewrite);
    })
    .then(() => {
      return shim(tmpDir, pattern, options.skipShim);
    })
    .then((shimFile) => {
      return browserify(shimFile, htmlOutputTmp.replace('.html', '.js'), options.skipBrowserify);
    })
    .then(() => {
      return copy(tmpDir, prefix, htmlOutput);
    })
    .then(() => {
      return del(tmpDir);
    })
    .catch((err) => {
      console.error('oh no! ', err);
      return Promise.reject(err);
    });

    // TODO: How come .finally doesn't work??

};
