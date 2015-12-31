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

module.exports = function(tmpDir, prefix, htmlOutput, skip) {

  if (skip) {
    return Promise.resolve();
  }
  
  // Copy vulcanized and browserified files to dist
  const promise = new Promise((resolve, reject) => {

    let jsOutput = path.join(path.dirname(htmlOutput), prefix + '.js');

    try {
      fs.mkdirsSync(path.dirname(htmlOutput));
      fs.copySync(path.join(tmpDir, prefix + '.html'), htmlOutput);
      fs.copySync(path.join(tmpDir, prefix + '.js'), jsOutput);
      resolve();
    } catch (err) {
      reject(err);
    }

  });
  return promise;
}
