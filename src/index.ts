#!/usr/bin/env node

import { build } from './commands/build.js';
import { help } from './commands/help.js';
import { watch } from './commands/watch.js';

const cwd = process.cwd();

const [ command ] = process.argv.slice(2);

switch (command.toLowerCase()) {
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