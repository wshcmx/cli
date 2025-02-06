import { globSync, statSync, mkdirSync, watch as fsWatch, WatchEventType, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { styleText } from 'node:util';

import ts from 'typescript';

import { getTSConfig } from '../core/config.js';
import { enumsToObjects } from '../transformers/enums_to_objects.js';
import { removeExports } from '../transformers/remove_exports.js';
import { convertTemplateStrings } from '../transformers/template_strings.js';
import { transformNamespaces } from '../transformers/transform_namespaces.js';
import { args, ArgsFlags } from '../core/args.js';

function watchNonTsFiles(configuration: ts.ParsedCommandLine) {
    const { outDir } = configuration.options;

    if (outDir === undefined) {
      throw new Error('The outDir option is not set in the tsconfig.json file.');
    }

    const { exclude, files, include } = configuration.raw;

    const entries = globSync([...(include ?? []), ...(files ?? [])])
      .filter(x => !configuration.fileNames.includes(x))
      .filter(x => !exclude?.includes(x))
      .filter(x => statSync(x).isFile());

    entries.forEach(x => {
      const outputFilePath = resolve(configuration.options.outDir!, x);

      fsWatch(resolve(x), null, (event: WatchEventType) => {
        if (event === 'change') {
          mkdirSync(dirname(outputFilePath), { recursive: true });
          writeFileSync(outputFilePath, readFileSync(resolve(x), 'utf-8'));
        }
      });
    });
}

function watchTsFiles(configuration: ts.ParsedCommandLine) {
  const host = ts.createWatchCompilerHost(
    configuration.fileNames,
    configuration.options,
    ts.sys,
    ts.createEmitAndSemanticDiagnosticsBuilderProgram,
    (diagnostic) => {
      if (diagnostic.file) {
        const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.error(styleText('red', `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`));
      } else {
        console.error(styleText('red', ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')));
      }
    }
  );

  const originalCreateProgram = host.createProgram;

  host.createProgram = (rootNames, options, ...rest) => {
    const program = originalCreateProgram(rootNames, options, ...rest);

    program.emit(undefined, undefined, undefined, undefined, {
      before: [
        removeExports(),
        enumsToObjects(),
        convertTemplateStrings(),
        transformNamespaces(),
      ]
    });

    return program;
  };

  ts.createWatchProgram(host);
}

export function watch(cwd: string) {
  const configuration = getTSConfig(cwd);

  watchTsFiles(configuration);

  if (args.has(ArgsFlags.INCLUDE_NON_TS_FILES)) {
    watchNonTsFiles(configuration);
  }
}