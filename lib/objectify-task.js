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

// Find the assetpath comment inserted by crisper
function findAssetPath(file) {
  var re = /\/\* assetpath="(.*)"/;
  var matches = re.exec(file);
  if (matches) {
    return matches[1];
  } else {
    return null;
  }
}

// Pad temp filenames with zeros
// This assumes a certain max number of files
function pad(num) {
  let prefix = "00000"; // quick and dirty limit, really this could go up to whatever
  let numStr = num.toString();
  let endSlice = prefix.length - numStr.length;
  if (endSlice < 0) {
    throw new RangeError('Number exceeds the max allowed value');
  }
  return prefix.slice(0, endSlice) + numStr;
}

module.exports = function(scriptFiles, prefix, componentDir, skip) {

  if (skip) {
    return Promise.resolve();
  }

  console.time('objectify');

  // Run vulcanize and output to tmp dir
  const promise = new Promise((resolve, reject) => {
    const newScripts = scriptFiles.map((file, idx) => {
      let assetPath = findAssetPath(file);
      // Should this file be excluded from any future transpilation?
      // If it came from the components dir, or is missing an assetPath (meaning
      // it is an included script from the components dir), then yes, exclude it
      // TODO: Not sure how this affects user-included ES6 scripts
      let shouldExclude = false;
      if (!assetPath || assetPath.indexOf(componentDir) !== -1) {
        shouldExclude = true;
      }
      return {
        filename: prefix + pad(idx) + '.js',
        content: file,
        assetPath: assetPath,
        shouldExclude: shouldExclude
      };
    });
    resolve(newScripts);
    console.timeEnd('objectify');
  });
  return promise;
}
