#!/usr/bin/env node

import { args } from './core/args.js';
import { build } from './commands/build.js';
import { help } from './commands/help.js';
import { watch } from './commands/watch.js';

const cwd = process.cwd();

switch (args.getCommand()) {
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