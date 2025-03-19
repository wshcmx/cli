import { build } from './build.js';
import { help } from './help.js';
import { watch } from './watch.js';

export type Command = {
  callback: Function,
  description: string
};

export const commands = new Map<string, Command>([
  ['build', { callback: build, description: 'Building the project'}],
  ['help', { callback: help, description: 'Plugin help description' }],
  ['watch', { callback: watch, description: 'Watching for changes'}],
]);