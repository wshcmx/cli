import ts from 'typescript';
import { getTSConfig } from './config.js';
import { enumsToObjects } from '../transformers/enums_to_objects.js';
import { removeExports } from '../transformers/remove_exports.js';
import { convertTemplateStrings } from '../transformers/template_strings.js';
import { transformNamespaces } from '../transformers/transform_namespaces.js';

export function watch(cwd: string) {
  console.log(`🔨 Building started`);
  const configuration = getTSConfig(cwd);
  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;

  const host = ts.createWatchCompilerHost(
      configuration.fileNames,
      configuration.options,
      ts.sys,
      createProgram,
      (diagnostic) => {
        if (diagnostic.file) {
          const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
          const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
          console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        } else {
          console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
        }
      },
      (diagnostic) => console.error(ts.formatDiagnostic(diagnostic, ts.createCompilerHost({}))),
  );

  const originalCreateProgram = host.createProgram;
  host.createProgram = (rootNames, options, ...rest) => {
    const program = originalCreateProgram(rootNames, options, ...rest);
    const emit = program.emit;

    program.emit = () => {
      return emit(undefined, undefined, undefined, undefined, {
        before: [
          removeExports(),
          enumsToObjects(),
          convertTemplateStrings(),
          transformNamespaces(),
        ]
      })
    };
    return program;
  };

  ts.createWatchProgram(host);
}