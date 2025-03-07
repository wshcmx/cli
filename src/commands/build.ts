import { styleText } from 'node:util';

import { args } from '../core/args.js';
import { buildNonTypescriptFiles, buildTypescriptFiles } from '../core/build.js';
import { getTSConfig } from '../core/config.js';

export function build(cwd: string) {
  console.log(styleText('greenBright', `🔨 ${new Date().toLocaleTimeString()} Building started`));
  const configuration = getTSConfig(cwd, args.getArg('project'));

  buildTypescriptFiles(configuration);
  buildNonTypescriptFiles(configuration);

  console.log(styleText('greenBright', `✅ ${new Date().toLocaleTimeString()} Build finished`));
  process.exit(0);
}