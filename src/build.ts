import { resolve } from 'node:path';
import { readdirSync, rmSync, statSync } from 'node:fs';
import { CompilerOptions } from 'typescript';
import { WshcmxConfiguration } from './config.js';
import { transpile } from './compile.js';

export default function(_cwd: string, _config: WshcmxConfiguration, compilerOptions: CompilerOptions) {
  console.log(`🧹 Cleaning "${compilerOptions.outDir!}"`);
  rmSync(compilerOptions.outDir!, { recursive: true, force: true });

  console.log(`🛠️ Building "${compilerOptions.rootDir}"`);

  const files = readdirSync(compilerOptions.rootDir!, { recursive: true })
    .map(x => resolve(compilerOptions.rootDir!, x.toString()))
    .filter(x => statSync(x).isFile());

  const filesLength = files.length;
  console.log("🔎 Found files", filesLength);

  files.forEach((x, i) => {
    transpile(x, compilerOptions);
    process.stdout.write(`\r✅ Build successfully ${i + 1}/${filesLength} file(s)`);
  });

  process.stdout.write('\n');
  console.log(`✅ ${new Date().toLocaleTimeString()} Build done`);
}
