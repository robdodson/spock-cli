#!/usr/bin/env node
'use strict';

const updateNotifier = require('update-notifier');
const meow = require('meow');
const spock = require('../');

const cli = meow(`
	Usage
	  $ spock <path>

  Options
    -j, --js Output JavaScript file name. Defaults to elements.js
    -h, --html Output HTML file name. Defaults to elements.html

	Examples
	  $ spock elements.html -o dist/elements/elements.html
`, {
	alias: {
    j: 'js',
    h: 'html'
  }
});

updateNotifier({pkg: cli.pkg}).notify();

if (cli.input.length === 0) {
	console.error('Specify at least one path');
	process.exit(1);
}

spock(cli.input[0]);
