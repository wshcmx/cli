import { args } from '../core/args.js';
import { watchNonTypescriptFiles, watchTypescriptFiles } from '../core/build.js';
import { getTSConfig } from '../core/config.js';

export function watch(cwd: string) {
  const configuration = getTSConfig(cwd, args.getArg('project'));
  watchTypescriptFiles(configuration);
  watchNonTypescriptFiles(configuration);
}