import { help } from './commands/help.js';
import { init } from './commands/init.js';
import { build } from './commands/build.js';
import { watch } from './commands/watch.js';

export async function cli() {
  const cwd = process.cwd();
  const command = process.argv.slice(2)[0]?.toLowerCase();

  switch (command) {
    case 'init':
      return init(cwd);
    case 'build':
      return build(cwd);
    case 'watch':
      return watch(cwd);
    default:
      return help();
  }
}