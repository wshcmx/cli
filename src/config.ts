import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CompilerOptions } from "typescript";

export type XConfiguration = {
  input: string;
  output: string;
  clean?: boolean;
  postwatch?: CallableFunction;
}

export function getTSConfig(cwd: string) {
  const tsconfigPath = join(cwd, 'tsconfig.json');

  if (!existsSync(tsconfigPath)) {
    console.error('No tsconfig.json found');
    process.exit(1);
  }

  return JSON.parse(readFileSync(tsconfigPath, 'utf-8')).compilerOptions as CompilerOptions;
}

export async function getConfig(cwd: string) {
  const path = join(cwd, 'wshcmx.config.json');

  if (existsSync(path)) {
    return JSON.parse(readFileSync(path, 'utf-8')) as XConfiguration;
  }

  const jsPath = join(cwd, 'wshcmx.config.js');

  if (existsSync(jsPath)) {
    return (await import(jsPath)).default as XConfiguration;
  }

  console.error('No wshcmx config found');
  process.exit(1);
}