import { args } from '../core/args.js';
import { buildNonTypescriptFiles, buildTypescriptFiles } from '../core/build.js';
import { getTSConfig } from '../core/config.js';
import { logger } from '../core/logger.js';

export function build(cwd: string) {
  logger.success(`🔨 ${new Date().toLocaleTimeString()} Building started`);
  const configuration = getTSConfig(cwd, args.getArg('project'));

  buildTypescriptFiles(configuration);
  buildNonTypescriptFiles(configuration);

  logger.success(`✅ ${new Date().toLocaleTimeString()} Build finished`);
  process.exit(0);
}