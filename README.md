# ![spock](media/header.png)

> ES2015 or CommonJS modules for Polymer

## Warning

This is a crazy idea that I thought up one night and should not be used by any one on a real project. If you do use it on a real project then you are a bad person and you should feel bad.

## What does it do?

Use CommonJS or ES2015 modules in your HTML Imports, that's what!

**with ES2015**
```html
<dom-module id="x-foo">
  ...
  <script>
    import { sayHello } from '../../modules/my-module';
    import moment from 'moment';

    Polymer({
      is: 'x-foo',
      attached: () => {
        sayHello();
        console.log('the time is', moment().calendar());
      }
    });
  </script>
</dom-module>
```

**with CommonJS**
```html
<dom-module id="x-foo">
  ...
  <script>
    var sayHello = require('../../modules/my-module');
    var moment = require('moment');

    Polymer({
      is: 'x-foo',
      attached: function() {
        sayHello();
        console.log('the time is', moment().calendar());
      }
    });
  </script>
</dom-module>
```

## Trying it out

- Clone the project
- `cd` into `spock-cli` dir
- `npm install`
- `npm link` -- Remember to restore your old copy of crisper when you're done
- `cd` into `demo` dir (you can choose either commonjs or es6)
- `npm install && bower install`
- Run `npm test` to setup the demo `dist` directory
- `cd` into `dist` and run a local server to preview

## How does it work?

Vulcanize will put all of your elements in the correct order, meaning all of your scripts are also in the correct order. Using a modified version of Crisper, spock will extract every `<script>` it sees in your vulcanized bundle into a standalone file. Using the original location of the `elements.html` it can then rewrite the `require` statements in your files to use the correct paths to your modules. It then creates a shim file that requires all of these files in the correct order. Then it browserifies (and optionally babelifies) the shim, at this point any `require` statements will have their corresponding JS compiled into the bundle. Finally it moves the vulcanized html and browserified js to your `dist` directory.

Here are all the steps in list form:

- Vulcanize all elements into a bundle
- Walk the bundle using crisper, extract every script into its own file (steal the assetPath too)
- Use assetPath and location of original elements.html to figure out how to rewrite relative require paths and determine if the element should be babelified (if it came from bower_components it should not)
- Don't rewrite requires that would hit NODE_PATH (i.e. anything coming from node_modules)
- Create an index shim that requires these files in the correct sequential order
- Write shim and all extracted js files to `os.tmpdir`
- Browserify the index shim and call it elements.js
- Put elements.html and elements.js in dist

## What's next?

**Play nice with Gulp**
The code is currently a mishmash and depends heavily on the CLI. The lib should eventually be able to play nice with Gulp.

**WebPack**
Although I've done so in a totally hacky manner, I think I've proven that it is possible to extract and compile modules into your import bundles. I'd really like to see if this could be made into a WebPack transform as well since that's where all the hotness seems to be these days.

## What about `<script type=module>` ?
Ultimately I think this tool will be replaced by `<script type=module>` and someone may come along and write a really sick polyfill for that, who knows? But until that happens I'd like to have _some_ way to work with modules and Polymer.

## Known issues

**Requires a build step**
It's a bummer but yeah, you have to run the build during development. On a small project it takes about 1-2 seconds to run. Maybe there are clever tricks we can do like using watchify to make this less painful?

**No sourcemaps**
Vulcanize has [an open issue](https://github.com/Polymer/vulcanize/issues/12) to add some kind of sourcemap support. Our hands are tied here.

**Unable to rewrite inlined scripts**
_Working on a fix for this!_ If an element depends on an external script file, and that external script file has a `require` call in it, and you bundle it with `--inline-scripts` in Vulcanize, then Spock will attempt to rewrite the `require` path.
