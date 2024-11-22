import ts, { CompilerOptions } from 'typescript';
import { relative, resolve, sep } from 'node:path';
import { transpile } from './compile.js';
import { tsConfigFilePath, WshcmxConfiguration } from './config.js';
import { readFileSync, rmSync } from 'node:fs';
import { detectContentType, resolveExtname } from './util.js';

export default function(cwd: string, wshcmxConfig: WshcmxConfiguration, tsConfig: CompilerOptions) {
  console.log(`🔎 Watching for changes in "${tsConfig.rootDir}"`);

  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;

  const host = ts.createWatchCompilerHost(
      tsConfigFilePath,
      tsConfig,
      ts.sys,
      createProgram,
      (diagnostic) => {
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

        if (diagnostic.file) {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
            console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
        } else {
            console.error(message);
        }
      },
      (diagnostic) => console.info(ts.formatDiagnostic(diagnostic, ts.createCompilerHost({})))
  );

  const originalWatchFile = host.watchFile;

  host.watchFile = (path) => {
    if (path.includes("/node_modules/")) {
      return noopWatcher;
    }

    if (path.split(sep).filter(x => x.startsWith(".")).length > 1) {
      return noopWatcher;
    }

    return originalWatchFile(path, (_, event) => {
      if (event === ts.FileWatcherEventKind.Created) {
        add(path, cwd, wshcmxConfig, tsConfig);
      } else if (event === ts.FileWatcherEventKind.Changed) {
        change(path, cwd, wshcmxConfig, tsConfig);
      } else if (event === ts.FileWatcherEventKind.Deleted) {
        unlink(path, cwd, wshcmxConfig, tsConfig);
      }
    }, 400);
  }

  const p = ts.createWatchProgram(host);
}

async function add(filePath: string, cwd: string, wshcmxConfig: WshcmxConfiguration, tsConfig: CompilerOptions) {
  const [ code, inputFilePath, outputFilePath ] = transpile(resolve(cwd, filePath), tsConfig);
  wshcmxConfig.postwatch?.('add', cwd, code, inputFilePath, outputFilePath);
  console.log(`✅ ${new Date().toLocaleTimeString()} File added "${relative(cwd, outputFilePath)}"`);
}

async function change(filePath: string, cwd: string, wshcmxConfig: WshcmxConfiguration, tsConfig: CompilerOptions) {
  const [ code, inputFilePath, outputFilePath ] = transpile(resolve(cwd, filePath), tsConfig);
  wshcmxConfig.postwatch?.('change', cwd, code, inputFilePath, outputFilePath);
  console.log(`✅ ${new Date().toLocaleTimeString()} File changed "${relative(cwd, inputFilePath)}"`);
}

async function unlink(filePath: string, cwd: string, wshcmxConfig: WshcmxConfiguration, tsConfig: CompilerOptions) {
  const inputFilePath = resolve(cwd, filePath);
  const content = readFileSync(inputFilePath, 'utf-8');
  const contentType = detectContentType(content, filePath);
  const outputFilePath = resolve(tsConfig.outDir!, relative(tsConfig.rootDir!, resolveExtname(filePath, contentType)));

  wshcmxConfig.postwatch?.('unlink', cwd, null, inputFilePath, outputFilePath);
  rmSync(outputFilePath);
  console.log(`✅ ${new Date().toLocaleTimeString()} File unlinked "${relative(cwd, inputFilePath)}"`);
}


const noopWatcher = { close: () => {} };