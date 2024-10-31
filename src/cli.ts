import Watch from './watch.js';
import Build from './build.js';
import { getConfig, getTSConfig } from './config.js';

const availableCommands = new Map([
  ['watch', { callback: Watch, description: 'Watch for changes'}],
  ['build', { callback: Build, description: 'Build the project'}],
])

export default async function() {
  const cwd = process.cwd();
  const command = process.argv.slice(2)[0];
  const tsConfig = getTSConfig(cwd);
  const config = await getConfig(cwd);

  if (!availableCommands.has(command)) {
    console.error(`Unknown command "${command}"`);
    console.log(`Available commands:\n\t${Array.from(availableCommands).map(x => `"${x[0]}" - ${x[1].description}`).join('\n\t')}`);
    process.exit(1);
  }

  availableCommands.get(command)?.callback(cwd, config, tsConfig);
}