#!/usr/bin/env node
import { help } from './commands/help.js';
import { init } from './commands/init.js';
import { build } from './commands/build.js';
import { watch } from './commands/watch.js';

const cwd = process.cwd();

switch (process.argv.slice(2)[0]?.toLowerCase()) {
  case 'init':
    init(cwd);
    break;
  case 'build':
    build(cwd);
    break;
  case 'watch':
    watch(cwd);
    break;
  default:
    help();
    break;
}