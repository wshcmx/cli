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

  const progressBarSize = Math.min(process.stdout.columns, 30);
  const totalFiles = files.length;
  console.log("🔎 Found files", totalFiles);

  files.forEach((x, i) => {
    transpile(x, compilerOptions);
    const currentFileIndex = i + 1;
    const percent = (currentFileIndex / totalFiles) * 100;
    const completedPercents = Math.floor(percent / (100 / progressBarSize));
    const progress = `Build file(s) progress: [${'='.repeat(completedPercents)}=>${' '.repeat(progressBarSize - completedPercents)}] ${percent.toFixed(2)}%`;
    process.stdout.write(`\r✅ ${progress}`);
  });

  process.stdout.write('\n');
  console.log(`✅ ${new Date().toLocaleTimeString()} Build done`);
}
