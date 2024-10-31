import { resolve } from 'node:path';
import { pipe, resolveOutputFilepath, transpile } from './compile.js';
import { readdirSync, rmSync, statSync } from 'node:fs';
import { CompilerOptions } from 'typescript';

export default function(cwd: string, tsConfig: CompilerOptions) {
  console.log(`🧹 Cleaning "${tsConfig.outDir!}"`);
  rmSync(tsConfig.outDir!, { recursive: true, force: true });

  console.log(`🔎 Building "${tsConfig.rootDir}"`);

  readdirSync(tsConfig.rootDir!, { recursive: true })
    .map(x => resolve(tsConfig.rootDir!, x.toString()))
    .filter(x => statSync(x).isFile())
    .forEach(async x => {
      pipe(
        resolveOutputFilepath(tsConfig.rootDir!, x, tsConfig.outDir!),
        await transpile(resolve(cwd, x), tsConfig)
      );
  });

  console.log(`✅ ${new Date().toLocaleTimeString()} Build done`);
}
