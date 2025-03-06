import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { styleText } from 'node:util';

import { args, ArgsFlags } from '../core/args.js';
import { buildTypescriptFiles, collectNonTypescriptFiles } from '../core/build.js';
import { getTSConfig } from '../core/config.js';

export function build(cwd: string) {
  console.log(styleText('greenBright', `🔨 ${new Date().toLocaleTimeString()} Building started`));
  const configuration = getTSConfig(cwd, args.getArg('project'));

  const emitResult = buildTypescriptFiles(configuration.fileNames, configuration.options);

  if (emitResult!.emitSkipped) {
    console.error(styleText('red', 'Build process failed.'));
    process.exit(1);
  }

  if (args.has(ArgsFlags.INCLUDE_NON_TS_FILES)) {
    const { rootDir, outDir } = configuration.options;
    const entries = collectNonTypescriptFiles(configuration);

    entries.forEach(x => {
      const filePath = rootDir ? relative(rootDir, x) : x;
      const outputFilePath = resolve(outDir!, filePath);
      mkdirSync(dirname(outputFilePath), { recursive: true });
      writeFileSync(outputFilePath, readFileSync(resolve(x), 'utf-8'));
    });
  }

  console.log(styleText('greenBright', `✅ ${new Date().toLocaleTimeString()} Build finished`));
  process.exit(0);
}