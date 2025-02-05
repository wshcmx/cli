import { globSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import util from 'node:util';

import ts from 'typescript';

import { getTSConfig } from '../config.js';
import { enumsToObjects } from '../transformers/enums_to_objects.js';
import { removeExports } from '../transformers/remove_exports.js';
import { convertTemplateStrings } from '../transformers/template_strings.js';
import { transformNamespaces } from '../transformers/transform_namespaces.js';
import { convertUnicodeFiles } from '../transformers/retain_non_ascii_characters.js';
import { renameNamespaces } from '../transformers/convert_namespaces_ext.js';

function nonTsBuild(configuration: ts.ParsedCommandLine) {
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
    mkdirSync(dirname(outputFilePath), { recursive: true });
    writeFileSync(outputFilePath, readFileSync(resolve(x), 'utf-8'));
  });
}

function tsBuild(configuration: ts.ParsedCommandLine) {
  const program = ts.createProgram(configuration.fileNames, configuration.options);

  const emitResult = program.emit(undefined, undefined, undefined, undefined, {
    before: [
      removeExports(),
      enumsToObjects(),
      convertTemplateStrings(),
      transformNamespaces(),
    ],
  });

  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

  diagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.error(util.styleText('red', `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`));
    } else {
      console.error(util.styleText('red', ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')));
    }
  });

  if (!emitResult.emitSkipped) {
    console.error(util.styleText('red', 'Build process failed.'));
    process.exit(1);
  }
}

export function build(cwd: string) {
  console.log(`🔨 ${new Date().toLocaleTimeString()} Building started`);
  const configuration = getTSConfig(cwd);

  tsBuild(configuration);
  nonTsBuild(configuration);
  convertUnicodeFiles(configuration.options.outDir);
  renameNamespaces(configuration.options.outDir);
  console.log(`✅ ${new Date().toLocaleTimeString()} Build finished`);
  process.exit(0);
}