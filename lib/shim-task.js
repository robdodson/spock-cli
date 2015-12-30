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
const globby = require('globby');

module.exports = function(tmpDir, pattern, skip) {

  if (skip) {
    return Promise.resolve();
  }

  // Run vulcanize and output to tmp dir
  const promise = new Promise((resolve, reject) => {

    const content = [];
    const files = globby.sync(path.join(tmpDir, pattern));
    files.forEach(file => {
      content.push('require("./' + path.basename(file) + '");\n');
    });

    // TODO: LOL at my total lack of error handling :'(
    fs.writeFileSync(path.join(tmpDir, 'index.js'), content.join(''), 'utf-8');
    console.log('Finished shimming ', path.join(tmpDir, 'index.js'));
    resolve();

  });
  return promise;
}
