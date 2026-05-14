import fs from 'node:fs';
import { dirname, extname, normalize, relative, resolve } from 'node:path';

import ts from 'typescript';

import { enumsToObjects } from '../transformers/enums_to_objects.js';
import { removeExports } from '../transformers/remove_exports.js';
import { convertTemplateStrings } from '../transformers/template_strings.js';
import { transformNamespaces } from '../transformers/transform_namespaces.js';
import { noDeclarationInLoop } from '../checks/no-declaration-in-loop.js';
import { args } from './args.js';
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
  const configFilePath = typeof configuration.options.configFilePath === 'string'
    ? configuration.options.configFilePath
    : resolve('tsconfig.json');
  const configDirectoryPath = dirname(configFilePath);
  const includePatterns = Array.isArray(include) ? include.filter((pattern): pattern is string => typeof pattern === 'string') : [];
  const filePatterns = Array.isArray(files) ? files.filter((pattern): pattern is string => typeof pattern === 'string') : [];
  const excludePatterns = Array.isArray(exclude) ? exclude.filter((pattern): pattern is string => typeof pattern === 'string') : [];
  const fileNames = new Set(configuration.fileNames.map((fileName) => normalize(fileName)));
  const normalizedExclude = new Set(excludePatterns.map((filePath) => normalize(resolve(configDirectoryPath, filePath))));
  const compilableExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);

  return fs.globSync([...includePatterns, ...filePatterns], { cwd: configDirectoryPath })
    .map((filePath: string) => normalize(resolve(configDirectoryPath, filePath)))
    .filter((filePath: string) => !fileNames.has(filePath))
    .filter((filePath: string) => !normalizedExclude.has(filePath))
    .filter((filePath: string) => !compilableExtensions.has(extname(filePath)))
    .filter((filePath: string) => fs.statSync(filePath).isFile());
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

      if (!args['retain-non-ascii-characters']) {
        // Decode non ASCII characters
        data = data.replace(/\\u[\dA-Fa-f]{4}/g, (match) => {
          return String.fromCharCode(parseInt(match.substr(2), 16));
        });
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

export function watchNonTypescriptFiles(configuration: ts.ParsedCommandLine) {
  if (!args['include-non-ts-files']) {
    return;
  }

  const sourceRootPath = getSourceRootPath(configuration);
  const { outDir } = configuration.options;
  const entries = collectNonTypescriptFiles(configuration);

  entries.forEach((x: string) => {
    const filePath = relative(sourceRootPath, x);
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
  if (!args['include-non-ts-files']) {
    return;
  }

  const sourceRootPath = getSourceRootPath(configuration);
  const { outDir } = configuration.options;
  const entries = collectNonTypescriptFiles(configuration);

  entries.forEach((x: string) => {
    const filePath = relative(sourceRootPath, x);
    const outputFilePath = resolve(outDir!, filePath);
    fs.mkdirSync(dirname(outputFilePath), { recursive: true });
    fs.writeFileSync(outputFilePath, fs.readFileSync(resolve(x), 'utf-8'));
  });
}

function getSourceRootPath(configuration: ts.ParsedCommandLine) {
  const configFilePath = typeof configuration.options.configFilePath === 'string'
    ? configuration.options.configFilePath
    : resolve('tsconfig.json');
  const configDirectoryPath = dirname(configFilePath);

  if (typeof configuration.options.rootDir === 'string') {
    return resolve(configDirectoryPath, configuration.options.rootDir);
  }

  return configDirectoryPath;
}
