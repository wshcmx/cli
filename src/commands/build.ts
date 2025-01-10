import ts from 'typescript';
import { getTSConfig } from './config.js';
import { enumsToObjects } from '../transformers/enums_to_objects.js';
import { removeExports } from '../transformers/remove_exports.js';
import { convertTemplateStrings } from '../transformers/template_strings.js';
import { transformNamespaces } from '../transformers/transform_namespaces.js';
import { convertUnicodeFiles } from '../transformers/retain_non_ascii_characters.js';

export function build(cwd: string) {
  console.log(`🔨 Building started`);
  const configuration = getTSConfig(cwd);

  const program = ts.createProgram(configuration.fileNames, configuration.options);

  const emitResult = program.emit(undefined, undefined, undefined, undefined, {
    before: [
      removeExports(),
      enumsToObjects(),
      convertTemplateStrings(),
      transformNamespaces(),
    ]
  });

  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });

  if (emitResult.emitSkipped) {
    console.error('Compile process failed.');
    process.exit(1);
  }

  convertUnicodeFiles(configuration.options.outDir);
  console.log(`✅ ${new Date().toLocaleTimeString()} Compile done`);
  process.exit(0);
}
