import { mkdirSync, watch as fsWatch, WatchEventType, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

import ts from 'typescript';

import { getTSConfig } from '../core/config.js';
import { args } from '../core/args.js';
import { after, buildTypescriptFiles, collectNonTypescriptFiles } from '../core/build.js';
import { styleText } from 'node:util';

function watchNonTsFiles(configuration: ts.ParsedCommandLine) {
  const { rootDir, outDir } = configuration.options;
  const entries = collectNonTypescriptFiles(configuration);

  entries.forEach(x => {
    const filePath = rootDir ? relative(rootDir, x) : x;
    const outputFilePath = resolve(outDir!, filePath);

    fsWatch(resolve(x), null, (event: WatchEventType) => {
      if (event === 'change') {
        mkdirSync(dirname(outputFilePath), { recursive: true });
        writeFileSync(outputFilePath, readFileSync(resolve(x), 'utf-8'));
      }
    });
  });
}

export function watch(cwd: string) {
  const configuration = getTSConfig(cwd, args.getArg('project'));

  configuration.fileNames.map(x => {
    fsWatch(x, () => {
      const emitResult = buildTypescriptFiles([x], configuration.options);

      if (!emitResult.emitSkipped) {
        console.error(styleText('greenBright', `🔨 ${new Date().toLocaleTimeString()} File ${x} has been changed`));
      }
    });
  });

  watchNonTsFiles(configuration);
  after(configuration.options.outDir);
}