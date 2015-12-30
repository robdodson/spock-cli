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
const Vulcanize = require('vulcanize');

module.exports = function(input, output, skip) {

  if (skip) {
    return Promise.resolve();
  }

  const vulcan = new Vulcanize({
    inlineScripts: true,
    inlineCss: true
  });

  // Run vulcanize and output to tmp dir
  const promise = new Promise((resolve, reject) => {
    vulcan.process(input, function(err, inlinedHtml) {
      if (err) {
        return reject(err);
      }

      fs.mkdirsSync(path.dirname(output));
      fs.writeFileSync(output, inlinedHtml, 'utf-8');
      console.log('Finished vulcanizing ', output);
      return resolve(inlinedHtml);
    });
  });
  return promise;
}
