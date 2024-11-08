import { relative, resolve } from 'node:path';
import { readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { CompilerOptions } from 'typescript';
import { WshcmxConfiguration } from './config.js';
import { transpile } from './compile.js';
import { detectContentType, resolveExtname, writeFile } from './util.js';

export default function(cwd: string, _: WshcmxConfiguration, tsConfig: CompilerOptions) {
  console.log(`🧹 Cleaning "${tsConfig.outDir!}"`);
  rmSync(tsConfig.outDir!, { recursive: true, force: true });

  console.log(`🔎 Building "${tsConfig.rootDir}"`);

  readdirSync(tsConfig.rootDir!, { recursive: true })
    .map(x => resolve(tsConfig.rootDir!, x.toString()))
    .filter(x => statSync(x).isFile())
    .forEach(async filePath => {
      const inputFilePath = resolve(tsConfig.rootDir!, filePath);
      const content = readFileSync(inputFilePath, 'utf-8');
      const contentType = detectContentType(content, filePath);
      const outputFilePath = resolve(tsConfig.outDir!, relative(tsConfig.rootDir!, resolveExtname(filePath, contentType)));
      const code = await transpile(filePath, content, contentType, tsConfig);

      writeFile(
        outputFilePath,
        code
      );
    });

  console.log(`✅ ${new Date().toLocaleTimeString()} Build done`);
}
