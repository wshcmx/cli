import { args, ArgsFlags } from '../core/args.js';
import { watchNonTypescriptFiles, watchTypescriptFiles } from '../core/build.js';
import { getTSConfig } from '../core/config.js';

export function watch(cwd: string) {
  const configuration = getTSConfig(args.get(ArgsFlags.PROJECT) ?? cwd);
  watchTypescriptFiles(configuration);
  watchNonTypescriptFiles(configuration);
}