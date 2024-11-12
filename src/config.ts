import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import ts, { CompilerOptions } from 'typescript';

export type WshcmxConfiguration = {
  postwatch?: (
    action: 'add' | 'change' | 'unlink',
    cwd: string,
    code: string | null,
    absInputFilepath: string,
    absOutputFilepath: string
  ) => void;
}

export const wshcmxConfigFileName = 'wshcmx.config.js';
const tsConfigFileName = 'tsconfig.json';

export async function getWshcmxConfig(cwd: string) {
  const wshcmxConfigFilePath = join(cwd, wshcmxConfigFileName);

  if (!existsSync(wshcmxConfigFilePath)) {
    return {};
  }

  return (await import(wshcmxConfigFilePath)).default as WshcmxConfiguration;
}

export async function getTSConfig(cwd: string) {
  const tsConfigFilePath = join(cwd, tsConfigFileName);

  if (!existsSync(tsConfigFilePath)) {
    configError(cwd);
  }

  const configFile = ts.readJsonConfigFile(tsConfigFilePath, ts.sys.readFile);

  // Step 2: Convert JSON to TypeScript configuration
  const config = ts.parseJsonSourceFileConfigFileContent(
    configFile,
    ts.sys,
    dirname(tsConfigFilePath) // base path for resolving relative paths in tsconfig.json
  );
  
  if (config === undefined) {
    configError(cwd);
  }

  const { options } = config;

  return {
    ...options,
    rootDir: resolve(cwd, options.rootDir ?? 'src'),
    outDir: resolve(cwd, options.outDir ?? 'build'),
  } as CompilerOptions
}

function configError(cwd: string) {
  console.error(`There is no "${tsConfigFileName}" configuration at the path "${cwd}"`);
  console.error('Create a new one with:');
  console.warn('\tnpx tsc -init');
  process.exit(1);
}
