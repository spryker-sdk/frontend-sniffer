#!/usr/bin/env node

const program = require('commander');
const { set } = require('../dist/environment');
const { version } = require('../package.json');

program
    .version(version, '-v, --version')
    .option('-t, --take-only [n]', 'Collect only the first [n] elements for each stream')
    .option('-c, --collect-only', 'Run the collector only')
    .option('-d, --debug', 'Run in debug mode (verbose)')
    .parse(process.argv);

set({
    collectOnly: !!program.collectOnly,
    takeOnly: !!program.takeOnly ? program.takeOnly : null,
    debug: !!program.debug
});

const { sniff, collect } = require('../dist');

if (program.collectOnly) {
    collect();
    return;
}

sniff();
