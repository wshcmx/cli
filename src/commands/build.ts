import { args } from '../core/args.js';
import { buildNonTypescriptFiles, buildTypescriptFiles } from '../core/build.js';
import { getTSConfig } from '../core/config.js';
import { logger } from '../core/logger.js';

export function build(cwd: string) {
  logger.success(`🔨 ${new Date().toLocaleTimeString()} Project building started`);
  const configuration = getTSConfig(cwd, args.getArg('project'));

  const result = buildTypescriptFiles(configuration);

  if (result?.emitSkipped) {
    logger.error(`❌ ${new Date().toLocaleTimeString()} Project building failed`);
    process.exit(1);
  }

  buildNonTypescriptFiles(configuration);

  logger.success(`✅ ${new Date().toLocaleTimeString()} Project building finished`);
  process.exit(0);
}