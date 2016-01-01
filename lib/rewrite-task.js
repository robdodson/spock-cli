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

const fs = require('fs-extra');
const path = require('path');
const globby = require('globby');
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

// Starting from the tmp dir...
// - glob all the elements*.js files
// - for each file
//    - find all require statements
//    - find the assetpath comment
//    - using assetpath, and the file we originally vulcanzed from, find
//      the element's original directory
//    - for each require statement
//       - find the absolute path to the module referenced
//       - rewrite the require so it uses the absolute path
module.exports = function(htmlOutputTmp, bundlePath, skip) {
  console.time('rewrite');
  const tmpDir = path.dirname(htmlOutputTmp);
  const prefix = path.basename(htmlOutputTmp, '.html');
  const pattern = prefix + '*.js';
  // e.g. glob(['app/.tmp/elements*.js']);
  const files = globby.sync(path.join(tmpDir, pattern));

  const promise = new Promise((resolve, reject) => {
    files.forEach(function(file) {
      let src = fs.readFileSync(file, 'utf-8');
      let requires = findRequires(src);
      let assetPath = findAssetPath(src);
      if (!assetPath) {
        return;
      }
      let elementDir = findElementDir(bundlePath, assetPath);

      // TODO: Does this means your elements can't be in the same directory as
      // elements.html? What will assetPath be? ./?
      // FIXME: This needs to bail if the require is not relative, otherwise we'll
      // screw up npm packages
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
          src = src.replace(requires[0], modulePath);
          fs.writeFileSync(file, src, 'utf-8');
          // console.log('Finished rewriting ', file);
        });
      }

    });
    console.timeEnd('rewrite');
    resolve();
  });
  return promise;
}
