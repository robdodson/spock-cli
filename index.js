/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

const fs = require('fs');
const path = require('path');
const globby = require('globby');
const findRequires = require('find-requires');
const pathExists = require('path-exists');

function rewriteRequires(files, bundlePath) {
  files.forEach(function(file) {
    var src = fs.readFileSync(file, 'utf-8');
    var requires = findRequires(src); // there's an npm module for everything! :)
    var assetPath = findAssetPath(src); // ...except this...
    if (!assetPath) {
      return;
    }
    var elementDir = findElementDir(bundlePath, assetPath);

    // TODO: I guess this means your elements can't be in the same directory as
    // elements.html?
    if (requires.length && assetPath) {
      requires.forEach(function(req) {
        var modulePath = findModulePath(req, elementDir);
        src = src.replace(requires[0], modulePath);
      });
    }

    fs.writeFileSync(file, src, 'utf-8');
  });
}

function findAssetPath(file) {
  var re = /^\/\* assetpath="(.*)"/;
  var matches = re.exec(file);
  if (matches) {
    return matches[1];
  } else {
    return false;
  }
}

function findElementDir(elementsHTML, assetPath) {
  return path.join(path.dirname(elementsHTML), assetPath);
}

function findModulePath(requirePath, elementDir) {
  return path.resolve(elementDir, requirePath)
}

module.exports = function(bundle) {
  'use strict';

  // Make sure the passed in bundle path is valid
  let fullBundlePath = path.join(process.cwd(), bundle);
  if (!pathExists.sync(fullBundlePath)) {
    return Promise.reject(new Error('Could not find bundle: ' + bundle));
  }

  rewriteRequires(globby.sync('app/.tmp/elements*.js'), fullBundlePath);

};
