import { watch } from 'chokidar';
import { CompilerOptions } from 'typescript';
import { relative, resolve } from 'node:path';
import { transpile } from './compile.js';
import { WshcmxConfiguration } from './config.js';
import { readFileSync, rmSync } from 'node:fs';
import { detectContentType, resolveExtname } from './util.js';

export default function(cwd: string, wshcmxConfig: WshcmxConfiguration, tsConfig: CompilerOptions) {
  console.log(`🔎 Watching for changes in "${tsConfig.rootDir}"`);

  watch(tsConfig.rootDir!, {
    cwd,
    ignoreInitial: true,
    ignored: [
      // Hidden directories like .git
      '**/.*/**',
  
      // Hidden files (e.g. logs or temp files)
      '**/.*',
  
      // 3rd party packages
      '**/{node_modules}/**',
    ],
    ignorePermissionErrors: true,
  })
    .on('add', filePath => add(filePath, cwd, wshcmxConfig, tsConfig))
    .on('change', filePath => change(filePath, cwd, wshcmxConfig, tsConfig))
    .on('unlink', filePath => unlink(filePath, cwd, wshcmxConfig, tsConfig))
}

async function add(filePath: string, cwd: string, wshcmxConfig: WshcmxConfiguration, tsConfig: CompilerOptions) {
  const [ code, inputFilePath, outputFilePath ] = transpile(resolve(cwd, filePath), tsConfig);
  wshcmxConfig.postwatch?.('add', cwd, code, inputFilePath, outputFilePath);
  console.log(`✅ ${new Date().toLocaleTimeString()} File added "${relative(cwd, outputFilePath)}"`);
}

async function change(filePath: string, cwd: string, wshcmxConfig: WshcmxConfiguration, tsConfig: CompilerOptions) {
  const [ code, inputFilePath, outputFilePath ] = transpile(resolve(cwd, filePath), tsConfig);
  console.log(inputFilePath, outputFilePath);
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
