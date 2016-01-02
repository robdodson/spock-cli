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
const path = require('path');
const browserify = require('browserify');

module.exports = function(shimBundle, output, skip) {

  if (skip) {
    return Promise.resolve();
  }

  console.time('browserify');

  const promise = new Promise((resolve, reject) => {
    // Tell browserify not to parse files
    const noParse = [];
    shimBundle.scriptFiles.forEach(file => {
      if (file.shouldExclude) {
        noParse.push(file.filename);
      }
    });
    // And tell babel to ignore the same group of files
    // Babel runs even on the noParse browserify files so we have to give
    // it a regex :\
    const ignore = new RegExp(noParse.join('|'));

    // Need to specify an absolute preset path because we're compiling in tmp dir
    const preset = path.resolve(__dirname, '../node_modules/babel-preset-es2015');
    browserify(shimBundle.shim, { noParse })
      .transform('babelify', {presets: [preset], ignore: ignore})
      .bundle()
      .pipe(fs.createWriteStream(output))
      .on('finish', () => {
        // console.log('Finished browserifying ', output);
        console.timeEnd('browserify');
        resolve();
      });

  });
  return promise;
}
