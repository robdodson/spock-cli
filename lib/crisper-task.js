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

// crisper --script-in-head=false --separate-scripts=true --source app/.tmp/elements.html --html app/.tmp/elements.html --js app/.tmp/elements.js

// TODO: If the user only passes in one argument it should assume an overwrite?
module.exports = function(source, htmlOutput, jsOutput, skip) {

  if (skip) {
    return Promise.resolve();
  }

  // TODO: This should reject the promise on fail. Maybe switch to async
  const promise = new Promise((resolve, reject) => {
    const output = crisper({
      source: source,
      jsFileName: jsOutput,
      scriptInHead: false,
      separateScripts: true
    });

    fs.writeFileSync(htmlOutput, output.html, 'utf-8');
    console.log('Finished crisperin\' ', htmlOutput);

    const dir = path.dirname(htmlOutput);
    const prefix = path.basename(htmlOutput, '.html');
    const len = output.scriptFiles.length;
    for (let i = 0; i < len; i++) {
      let jsOutput = path.join(dir, prefix + i + '.js');
      fs.writeFileSync(jsOutput, output.scriptFiles[i], 'utf-8');
      console.log('Finished crisperin\' ', jsOutput);
    }
    resolve();
  });
  return promise;
}
