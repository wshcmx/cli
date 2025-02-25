import { globSync, statSync } from 'node:fs';
import { styleText } from 'node:util';

import ts from 'typescript';

import { enumsToObjects } from '../transformers/enums_to_objects.js';
import { removeExports } from '../transformers/remove_exports.js';
import { convertTemplateStrings } from '../transformers/template_strings.js';
import { transformNamespaces } from '../transformers/transform_namespaces.js';

export function buildTypescriptFiles(fileNames: string[], options: ts.CompilerOptions) {
  const program = ts.createProgram(fileNames, options);
  const host = ts.createCompilerHost(program.getCompilerOptions());
  const originalWriteFile = host.writeFile;

  host.writeFile = (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
    if (fileName.endsWith('.js')) {
      // Convert namespaces
      if (data.indexOf('"META:NAMESPACE:') !== -1) {
        fileName = fileName.replace('.js', '.bs');
      }

      // Add aspnet render tag
      if (data.indexOf('/// @html') !== -1) {
        data = `<%\n// <script>\n${data}\n%>`;
        fileName = fileName.replace('.js', '.html');
      }

      // Decode non ASCII characters
      data = data.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
        return String.fromCharCode(parseInt(match.substr(2), 16));
      });
    }

    originalWriteFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
  };

  const emitResult = program.emit(undefined, host.writeFile, undefined, undefined, {
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
