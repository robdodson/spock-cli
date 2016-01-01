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
const crisper = require('crisper');

function getFilename(filepath) {
  var basename = path.basename(filepath, path.extname(filepath));
  return {
    html: basename + '.html',
    js: basename + '.js'
  };
}

module.exports = function(source, htmlOutput, skip) {

  if (skip) {
    return Promise.resolve();
  }

  console.time('crisper');

  const promise = new Promise((resolve, reject) => {

    const splitfile = getFilename(htmlOutput);
    const output = crisper({
      source: source,
      jsFileName: splitfile.js,
      scriptInHead: false,
      separateScripts: true
    });

    fs.writeFileSync(htmlOutput, output.html, 'utf-8');
    // console.log('Finished crisperin\' ', htmlOutput);

    console.timeEnd('crisper');
    resolve(output.scriptFiles);
  });
  return promise;
}
