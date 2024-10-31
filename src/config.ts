import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import ts, { CompilerOptions } from 'typescript';

export const wshcmxConfigFileName = 'wshcmx.config.js';
const tsConfigFileName = 'tsconfig.json';

export async function getTSConfig(cwd: string) {
  const tsConfigFilePath = join(cwd, tsConfigFileName);

  if (!existsSync(tsConfigFilePath)) {
    configError(cwd);
  }

  const { config } = ts.readConfigFile(tsConfigFilePath, ts.sys.readFile);

  if (config === undefined) {
    configError(cwd);
  }

  const { compilerOptions } = config.compilerOptions;
  return {
    ...compilerOptions,
    rootDir: resolve(cwd, config.compilerOptions.rootDir ?? 'src'),
    outDir: resolve(cwd, config.compilerOptions.outDir ?? 'build'),
  } as CompilerOptions
}

function configError(cwd: string) {
  console.error(`There is no "${tsConfigFileName}" configuration at the path "${cwd}"`);
  console.error('Create a new one with:');
  console.warn('\tnpx tsc -init');
  process.exit(1);
}
