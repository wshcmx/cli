import { build } from './build.js';
import { help } from './help.js';
import { init } from './init.js';
import { watch } from './watch.js';

export type Command = {
  callback: Function,
  description: string
};

export const commands = new Map<string, Command>([
  ['watch', { callback: watch, description: 'Watching for changes'}],
  ['build', { callback: build, description: 'Building the project'}],
  ['init', { callback: init, description: `Creating a new configuration file`}],
  ['help', { callback: help, description: 'Plugin help description' }]
]);