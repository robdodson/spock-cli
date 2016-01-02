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

const fs = require('fs-extra');
const path = require('path');
const pathExists = require('path-exists');
const vulcanize = require('./lib/vulcanize-task');
const crisper = require('./lib/crisper-task');
const babel = require('./lib/babel-task');
const rewriteRequires = require('./lib/rewrite-task');
const shim = require('./lib/shim-task');
const browserify = require('./lib/browserify-task');
// const fs = require('fs');
// const profiler = require('v8-profiler');

module.exports = function(bundle, opts) {
  // profiler.startProfiling('', true);
  const htmlOutput = path.join(process.cwd(), opts.output);
  const jsOutput = htmlOutput.replace('.html', '.js');
  const prefix = path.basename(htmlOutput, '.html'); // used for temp files
  const entryFile = path.join(process.cwd(), bundle);

  // Make sure the passed in entry file is valid
  if (!pathExists.sync(entryFile)) {
    return Promise.reject(new Error('Could not find import at: ' + bundle));
  }

  // Make sure output dir exists, otherwise create it
  if (!fs.ensureDirSync(path.dirname(htmlOutput))) {
    fs.mkdirsSync(path.dirname(htmlOutput));
  }

  console.time('spock');
  Promise.resolve()
    .then(() => {
      return vulcanize(entryFile, opts.skipVulcanize)
    })
    .then(vulcanizedHtml => {
      return crisper(vulcanizedHtml, htmlOutput, opts.skipCrisper);
    })
    .then(scriptFiles => {
      return babel(scriptFiles, opts.skipBabel);
    })
    .then(scriptFiles => {
      return rewriteRequires(scriptFiles, entryFile, opts.skipRewrite);
    })
    .then(rewrittenFiles => {
      return shim(rewrittenFiles, prefix, opts.skipShim);
    })
    .then(shimFile => {
      return browserify(shimFile, jsOutput, opts.skipBrowserify);
    })
    .then(() => {
      console.log('Live long and prosper');
      console.timeEnd('spock');
      // var profile = profiler.stopProfiling('');
      // profile.export(function(err, res) {
      //   fs.writeFileSync('profile.cpuprofile', res);
      // });
    })
    .catch(console.log.bind(console));

};
