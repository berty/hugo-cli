#!/usr/bin/env node

var spawnSync = require('child_process').spawnSync;

var cli = require('../');


var args = process.argv;

if (/node(\.exe)?$|iojs$|nodejs$/.test(args[0])) {
  args = args.slice(2);
}

var options = {
  verbose: args.find((a) => /-([^\s]*v[^\s]*|-verbose)/.test(a))
};

cli.withBerty(options, function(err, bertyPath) {

  if (err) {
    console.error('failed to grab berty :-(');
    console.error(err);

    process.exit(1);
  }

  process.exit(spawnSync(bertyPath, args, { stdio: 'inherit' }).status);
});
