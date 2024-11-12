import { resolve } from 'node:path';
import { readdirSync, rmSync, statSync } from 'node:fs';
import { CompilerOptions } from 'typescript';
import { WshcmxConfiguration } from './config.js';
import { transpile } from './compile.js';

export default function(_cwd: string, _config: WshcmxConfiguration, compilerOptions: CompilerOptions) {
  console.log(`🧹 Cleaning "${compilerOptions.outDir!}"`);
  rmSync(compilerOptions.outDir!, { recursive: true, force: true });

  console.log(`🔎 Building "${compilerOptions.rootDir}"`);

  readdirSync(compilerOptions.rootDir!, { recursive: true })
    .map(x => resolve(compilerOptions.rootDir!, x.toString()))
    .filter(x => statSync(x).isFile())
    .forEach(x => transpile(x, compilerOptions));

  console.log(`✅ ${new Date().toLocaleTimeString()} Build done`);
}
