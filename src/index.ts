#!/usr/bin/env node

import { args } from './core/args.js';
import { commands } from './commands/index.js';
import { help } from './commands/help.js';

const cwd = process.cwd();

const command = commands.get(args.getCommand());

if (command) {
  command.callback(cwd);
} else {
  help();
}
