import fs from 'node:fs';
import { dirname, normalize, relative, resolve } from 'node:path';

import ts from 'typescript';

import { enumsToObjects } from '../transformers/enums_to_objects.js';
import { removeExports } from '../transformers/remove_exports.js';
import { convertTemplateStrings } from '../transformers/template_strings.js';
import { transformNamespaces } from '../transformers/transform_namespaces.js';
import { args, ArgsFlags } from './args.js';
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

export function collectNonTypescriptFiles(configuration: ts.ParsedCommandLine) {
  const { outDir } = configuration.options;

  if (outDir === undefined) {
    throw new Error('The outDir option is not set in the tsconfig.json file.');
  }

  if (process.versions.node.split('.')[0] < '22') {
    throw new Error('The watch mode for non TypeScript files is available only since Node.js v22');
  }

  const { exclude, files, include } = configuration.raw;
  const fileNames = configuration.fileNames.map(normalize);
  const normalizedExclude = (exclude ?? []).map(normalize);

  return fs.globSync([...(include ?? []), ...(files ?? [])])
    .filter(x => !fileNames.includes(x))
    .filter(x => !normalizedExclude?.includes(x))
    .filter(x => fs.statSync(x).isFile());
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

      // Decode non ASCII characters
      data = data.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
        return String.fromCharCode(parseInt(match.substr(2), 16));
      });
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
      transformNamespaces()
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

export function watchNonTypescriptFiles(configuration: ts.ParsedCommandLine) {
  if (!args.has(ArgsFlags.INCLUDE_NON_TS_FILES)) {
    return;
  }

  const { rootDir, outDir } = configuration.options;
  const entries = collectNonTypescriptFiles(configuration);

  entries.forEach(x => {
    const filePath = rootDir ? relative(rootDir, x) : x;
    const outputFilePath = resolve(outDir!, filePath);

    fs.watch(resolve(x), (event: fs.WatchEventType) => {
      if (event == 'change') {
        fs.mkdirSync(dirname(outputFilePath), { recursive: true });
        fs.writeFileSync(outputFilePath, fs.readFileSync(resolve(x), 'utf-8'));
        logger.success(`🔨 ${new Date().toLocaleTimeString()} File ${x} has been changed`);
      }
    });
  });
}

export function buildNonTypescriptFiles(configuration: ts.ParsedCommandLine) {
  if (!args.has(ArgsFlags.INCLUDE_NON_TS_FILES)) {
    return;
  }

  const { rootDir, outDir } = configuration.options;
  const entries = collectNonTypescriptFiles(configuration);

  entries.forEach(x => {
    const filePath = rootDir ? relative(rootDir, x) : x;
    const outputFilePath = resolve(outDir!, filePath);
    fs.mkdirSync(dirname(outputFilePath), { recursive: true });
    fs.writeFileSync(outputFilePath, fs.readFileSync(resolve(x), 'utf-8'));
  });
}