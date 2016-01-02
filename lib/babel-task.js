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

const babel = require('babel-core');

module.exports = function(scriptFiles, skip) {

  if (skip) {
    return Promise.resolve();
  }

  console.time('babel');

  const promise = new Promise((resolve, reject) => {
    const newScripts = scriptFiles.map((file) => {
      return Object.assign({}, file, {
        content: file.shouldExclude ?
          file.content : babel.transform(file.content, {
            presets: ['es2015']
          }).code
      })
    });
    console.timeEnd('babel');
    return resolve(newScripts);
  });
  return promise;
}
