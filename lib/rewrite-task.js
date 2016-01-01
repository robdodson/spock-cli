/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

/**
 * Iterate over all extracted js files and rewrite their require calls so their
 * relative paths point at the correct files. If they have just been vulcanized
 * and crisper'd there is a good chance these paths are broken and must be fixed
 * up if we're about to browserify
 */

'use strict';

const path = require('path');
const findRequires = require('find-requires');

// TODO: Break these functions into modules so they're testable

// Find the assetpath comment inserted by crisper
function findAssetPath(file) {
  var re = /^\/\* assetpath="(.*)"/;
  var matches = re.exec(file);
  if (matches) {
    return matches[1];
  } else {
    return false;
  }
}

// Find the path back to the element's original directory
function findElementDir(elementsHTML, assetPath) {
  return path.join(path.dirname(elementsHTML), assetPath);
}

// Find the full path to the module relative to the element's directory
function findModulePath(requirePath, elementDir) {
  return path.resolve(elementDir, requirePath)
}

function isRelative(str) {
  return /^\.\.?/.test(str);
}

// - for each file
//    - find all require statements
//    - find the assetpath comment
//    - using assetpath, and the file we originally vulcanzed from, find
//      the element's original directory
//    - for each require statement
//       - find the absolute path to the module referenced
//       - rewrite the require so it uses the absolute path
module.exports = function(scriptFiles, entryFile, skip) {

  if (skip) {
    return Promise.resolve();
  }

  console.time('rewrite');

  const promise = new Promise((resolve, reject) => {
    const rewrittenFiles = scriptFiles.map((file) => {
      let newFile = file.concat();
      let requires = findRequires(newFile);
      let assetPath = findAssetPath(newFile);
      if (!assetPath) {
        return newFile;
      }
      let elementDir = findElementDir(entryFile, assetPath);

      // TODO: What happens if your elements are in same dir as elements.html?
      if (requires.length && assetPath) {
        requires.forEach(function(req) {
          // Check if the path is relative (starting with ./ or ../)
          // Technically just requiring 'foo' would be a relative path, but
          // node treats those as part of the NODE_PATH and we don't want to
          // attempt to rewrite them (otherwise we'll rewrite paths to stuff coming)
          // from node_modules
          if (!isRelative(req)) {
            return;
          }
          let modulePath = findModulePath(req, elementDir);
          newFile = newFile.replace(req, modulePath);
          // console.log('Finished rewriting ', file);
        });
      }

      return newFile;

    });
    console.timeEnd('rewrite');
    resolve(rewrittenFiles);
  });
  return promise;
}
