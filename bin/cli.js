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
		-c, --components Path to components dir. Defaults to bower_components
    --skip-vulcanize Skips the vulcanization step
    --skip-crisper Skips the crisper step
		--skip-objectify Skips the objectify step
		--skip-rewrite Skips the rewrite step
		--skip-shim Skips the shim step
    --skip-browserify Skips the browserify step
    --skip-copy Skips the copy step
    --skip-clean Skips the clean step

	Examples
	  $ spock app/elements/elements.html -o dist/elements/bundle.html
`, {
	alias: {
    o: 'output',
		c: 'components'
  },
  default: {
    output: 'dist/elements/elements.html',
		components: 'bower_components'
  }
});

updateNotifier({pkg: cli.pkg}).notify();

if (cli.input.length === 0) {
	console.error('Specify at least one path');
	process.exit(1);
}

spock(cli.input[0], cli.flags);
