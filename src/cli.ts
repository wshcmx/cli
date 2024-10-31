import Watch from './watch.js';
import Build from './build.js';
import Init from './init.js';
import { getTSConfig, getWshcmxConfig, wshcmxConfigFileName } from './config.js';

const availableCommands = new Map([
  ['watch', { callback: Watch, description: 'Watch for changes'}],
  ['build', { callback: Build, description: 'Build the project'}],
  ['init', { callback: Init, description: `Create a new "${wshcmxConfigFileName}" file`}],
])

export default async function() {
  const cwd = process.cwd();
  const command = process.argv.slice(2)[0];

  if (command === 'init') {
    Init(cwd);
    process.exit(0);
  }

  const wshcmxConfig = await getWshcmxConfig(cwd);
  const tsConfig = await getTSConfig(cwd);

  if (!availableCommands.has(command)) {
    console.error(`Unknown command "${command}"`);
    console.log(`Available commands:\n\t${Array.from(availableCommands).map(x => `"${x[0]}" - ${x[1].description}`).join('\n\t')}`);
    process.exit(1);
  }

  availableCommands.get(command)?.callback(cwd, wshcmxConfig, tsConfig);
}