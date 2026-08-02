import ts from 'typescript';

import { enumsToObjects } from '../transformers/enums_to_objects.js';
import { removeExports } from '../transformers/remove_exports.js';
import { convertTemplateStrings } from '../transformers/template_strings.js';
import { transformNamespaces } from '../transformers/transform_namespaces.js';
import { noDeclarationInLoop } from '../checks/no-declaration-in-loop.js';
import { logger } from './logger.js';

export function buildTypescriptFiles(configuration: ts.ParsedCommandLine) {
  const program = ts.createProgram(configuration.fileNames, configuration.options);
  const host = ts.createCompilerHost(program.getCompilerOptions());

  decorateHostWriteFile(host);
  const emitResult = decorateProgramEmit(host, program);

  const diagnostics = [
    ...ts.getPreEmitDiagnostics(program),
    ...emitResult!.diagnostics
  ];

  diagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      logger.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      logger.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });

  return emitResult;
}

function reportDiagnostic(diagnostic: ts.Diagnostic) {
  if (diagnostic.file) {
    const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    logger.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
  } else {
    logger.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
  }
}

function decorateHostWriteFile(host: ts.CompilerHost) {
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
    }

    originalWriteFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
  };
}

function decorateProgramEmit(host: ts.CompilerHost, program?: ts.SemanticDiagnosticsBuilderProgram | ts.Program) {
  return program?.emit(undefined, host.writeFile, undefined, undefined, {
    before: [
      removeExports(),
      enumsToObjects(),
      convertTemplateStrings(),
      transformNamespaces(),
      noDeclarationInLoop()
    ],
  });
}

function reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
  console.info(ts.formatDiagnostic(diagnostic, {
    getCanonicalFileName: path => path,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => ts.sys.newLine,
  }));
}

export function watchTypescriptFiles(configuration: ts.ParsedCommandLine) {
  const host = ts.createWatchCompilerHost(
    configuration.fileNames,
    configuration.options,
    ts.sys,
    ts.createEmitAndSemanticDiagnosticsBuilderProgram,
    reportDiagnostic,
    reportWatchStatusChanged
  );

  const origCreateProgram = host.createProgram;

  host.createProgram = (rootNames: ReadonlyArray<string> = [], options, host, oldProgram) => {
    decorateHostWriteFile(host!);
    const program = origCreateProgram(rootNames, options, host, oldProgram);
    decorateProgramEmit(host!, program);
    return program;
  };

  ts.createWatchProgram(host);
}
