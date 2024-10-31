import { CompilerOptions } from "typescript";
import { XConfiguration } from "./config.js";
import { relative, resolve } from "node:path";
import { pipe, transpile } from "./compile.js";
import { readdirSync, rmSync, statSync } from "node:fs";

export default function(cwd: string, config: XConfiguration, tsConfig: CompilerOptions) {
  console.log(`Building "${config.input}"`);
  const outputDirectoryPath = resolve(cwd, config.output);

  if (config.clean) {
    console.log(`Cleaning "${outputDirectoryPath}"`);
    rmSync(outputDirectoryPath, { recursive: true, force: true });
  }

  const inputDirectoryPath = resolve(cwd, config.input);
  readdirSync(inputDirectoryPath, { recursive: true })
    .map(x => resolve(inputDirectoryPath, x.toString()))
    .filter(x => statSync(x).isFile())
    .forEach(async (filepath) => {
      pipe(
        resolve(cwd, config.output, relative(resolve(cwd, config.input), filepath)),
        await transpile(resolve(cwd, filepath), tsConfig)
      );
    });

  console.log(`✅ ${new Date().toLocaleTimeString()} Build done`);
}
