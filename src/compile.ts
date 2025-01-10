import ts from 'typescript';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { enumsToObjects } from './transformers/enums_to_objects.js';
import { removeExports } from './transformers/remove_exports.js';
import { convertTemplateStrings } from './transformers/template_strings.js';
import { transformNamespaces } from './transformers/transform_namespaces.js';

function decodeUnicodeEscapes(str: string): string {
  return str.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
    return String.fromCharCode(parseInt(match.substr(2), 16));
  });
}

function convertUnicodeFiles(outputDir: string | undefined) {
  if (outputDir === undefined) {
    return;
  }

  const files = readdirSync(outputDir);

  files.forEach((file) => {
    const filePath = join(outputDir, file);

    if (filePath.endsWith('.js')) {
      let content = readFileSync(filePath, 'utf-8');

      content = decodeUnicodeEscapes(content);
      writeFileSync(filePath, content, 'utf-8');
      console.log(`Processed: ${filePath}`);
    }
  });
}

export function compile(configuration: ts.ParsedCommandLine) {
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