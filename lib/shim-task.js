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
const os = require('os');
const path = require('path');
const shortid = require('shortid');

module.exports = function(scriptFiles, skip) {

  if (skip) {
    return Promise.resolve();
  }

  console.time('shim');

  const promise = new Promise((resolve, reject) => {
    // TODO: Create an additional tmp dir in here?
    const tmpdir = fs.mkdirsSync(path.join(os.tmpdir(), 'spock-' + shortid.generate()));
    const content = [];
    // Write temporary script files and collect their filenames to require
    // in the shim index.js which will be browserified
    for (let i = 0; i < scriptFiles.length; i++) {
      let file = scriptFiles[i];
      content.push('require("./' + file.filename + '");\n');
      fs.writeFileSync(path.join(tmpdir, file.filename), file.content, 'utf-8');
    }

    // Write shim index and return its path
    const shim = path.join(tmpdir, 'index.js');
    fs.writeFileSync(shim, content.join(''), 'utf-8');
    // console.log('Finished shimming ', path.join(tmpDir, 'index.js'));
    console.timeEnd('shim');
    resolve({
      shim,
      scriptFiles
    });

  });

  return promise;

}
