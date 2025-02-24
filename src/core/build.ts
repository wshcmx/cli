import { existsSync, globSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { styleText } from 'node:util';

import ts from 'typescript';

import { enumsToObjects } from '../transformers/enums_to_objects.js';
import { removeExports } from '../transformers/remove_exports.js';
import { convertTemplateStrings } from '../transformers/template_strings.js';
import { transformNamespaces } from '../transformers/transform_namespaces.js';

export function buildTypescriptFiles(fileNames: string[], options: ts.CompilerOptions) {
  const program = ts.createProgram(fileNames, options);

  const emitResult = program.emit(undefined, undefined, undefined, undefined, {
    before: [
      removeExports(),
      enumsToObjects(),
      convertTemplateStrings(),
      transformNamespaces(),
    ],
  });

  const diagnostics = [
    ...ts.getPreEmitDiagnostics(program),
    ...emitResult.diagnostics
  ];

  diagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.error(styleText('red', `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`));
    } else {
      console.error(styleText('red', ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')));
    }
  });

  return emitResult;
}

function renameNamespaces(outDir: string | undefined) {
  if (outDir === undefined || !existsSync(outDir)) {
    return;
  }

  const files = readdirSync(outDir, { recursive: true });

  files.forEach((file) => {
    const filePath = join(outDir, file.toString());

    if (filePath.endsWith('.js')) {
      let content = readFileSync(filePath, 'utf-8');

      if (content.indexOf('"META:NAMESPACE:') > 0) {
        renameSync(filePath, filePath.replace('.js', '.bs'));
      }
    }
  });
}

function decodeUnicodeEscapes(str: string): string {
  return str.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
    return String.fromCharCode(parseInt(match.substr(2), 16));
  });
}

function convertUnicodeFiles(outDir: string | undefined) {
  if (outDir === undefined || !existsSync(outDir)) {
    return;
  }

  const files = readdirSync(outDir, { recursive: true });

  files.forEach((file) => {
    const filePath = join(outDir, file.toString());

    if (filePath.endsWith('.js')) {
      let content = readFileSync(filePath, 'utf-8');

      content = decodeUnicodeEscapes(content);
      writeFileSync(filePath, content, 'utf-8');
    }
  });
}

export function after(outDir: string | undefined) {
  convertUnicodeFiles(outDir);
  renameNamespaces(outDir);
}

export function collectNonTypescriptFiles(configuration: ts.ParsedCommandLine) {
  const { outDir } = configuration.options;

  if (outDir === undefined) {
    throw new Error('The outDir option is not set in the tsconfig.json file.');
  }

  const { exclude, files, include } = configuration.raw;

  return globSync([...(include ?? []), ...(files ?? [])])
    .filter(x => !configuration.fileNames.includes(x))
    .filter(x => !exclude?.includes(x))
    .filter(x => statSync(x).isFile());
}