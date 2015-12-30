#!/usr/bin/env node
'use strict';

const updateNotifier = require('update-notifier');
const meow = require('meow');
const spock = require('../');

const cli = meow(`
	Usage
	  $ spock <path>

  Options
    -o, --output Output file path. Defaults to dist/elements/elements.{html,js}
    --skip-vulcanize Skips the vulcanization step
    --skip-crisper Skips the crisper step
		--skip-rewrite Skips the rewrite step
		--skip-shim Skips the shim step
    --skip-browserify Skips the browserify step

	Examples
	  $ spock app/elements/elements.html -o dist/elements/bundle.html
`, {
	alias: {
    o: 'output'
  },
  default: {
    output: 'dist/elements/elements.html'
  }
});

updateNotifier({pkg: cli.pkg}).notify();

if (cli.input.length === 0) {
	console.error('Specify at least one path');
	process.exit(1);
}

spock(cli.input[0], cli.flags);
