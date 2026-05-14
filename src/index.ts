#!/usr/bin/env node

import * as args from './core/args.js';
import { commands } from './commands/index.js';
import { help } from './commands/help.js';

const cwd = process.cwd();

const command = commands.get(args.command);

if (command) {
  command.callback(cwd);
} else {
  help();
}
