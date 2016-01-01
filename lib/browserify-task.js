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

const fs = require('fs');
const browserify = require('browserify');

module.exports = function(file, output, skip) {

  if (skip) {
    return Promise.resolve();
  }

  console.time('browserify');

  // Run vulcanize and output to tmp dir
  const promise = new Promise((resolve, reject) => {

    const b = browserify();
    b.add(file);
    b.bundle()
      .pipe(fs.createWriteStream(output))
      .on('finish', () => {
        // console.log('Finished browserifying ', output);
        console.timeEnd('browserify');
        resolve();
      });

  });
  return promise;
}
