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
export let tsConfigFilePath: string;

export async function getWshcmxConfig(cwd: string) {
  const wshcmxConfigFilePath = join(cwd, wshcmxConfigFileName);

  if (!existsSync(wshcmxConfigFilePath)) {
    return {};
  }

  return (await import(wshcmxConfigFilePath)).default as WshcmxConfiguration;
}

export async function getTSConfig(cwd: string) {
  const _tempConfigPath = ts.findConfigFile(
    cwd,
    ts.sys.fileExists,
    "tsconfig.json"
  );

  if (_tempConfigPath === undefined) {
    configError(cwd);
  }

  tsConfigFilePath = _tempConfigPath;

  if (!existsSync(tsConfigFilePath)) {
    configError(cwd);
  }

  const configFile = ts.readJsonConfigFile(tsConfigFilePath, ts.sys.readFile);

  const config = ts.parseJsonSourceFileConfigFileContent(
    configFile,
    ts.sys,
    dirname(tsConfigFilePath)
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

function configError(cwd: string): never {
  console.error(`There is no "${tsConfigFileName}" configuration at the path "${cwd}"`);
  console.error('Create a new one with:');
  console.warn('\tnpx tsc -init');
  process.exit(1);
}
