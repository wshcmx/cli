import { watch } from "chokidar";
import { CompilerOptions } from "typescript";
import { XConfiguration } from "./config.js";
import { relative, resolve } from "node:path";
import { pipe, resolveExtname, transpile } from "./compile.js";

const baseConfig = {
  ignoreInitial: true,
  ignored: [
    // Hidden directories like .git
    '**/.*/**',

    // Hidden files (e.g. logs or temp files)
    '**/.*',

    // 3rd party packages
    '**/{node_modules}/**',
  ],
  ignorePermissionErrors: true,
};

export default function(cwd: string, config: XConfiguration, tsConfig: CompilerOptions) {
  console.log(`Watching for changes in "${resolve(cwd, config.input)}"`);

  watch(config.input, { ...baseConfig, cwd })
    .on('add', filepath => add(filepath, cwd, config, tsConfig))
    .on('change', filepath => change(filepath, cwd, config, tsConfig))
    .on('unlink', filepath => unlink(filepath, cwd, config, tsConfig))
}

async function add(filepath: string, cwd: string, config: XConfiguration, tsConfig: CompilerOptions) {
  const absInputFilepath = resolve(cwd, filepath);
  const absOutputFilepath = resolveOutputFilepath(cwd, config, filepath);

  const code = await transpile(absInputFilepath, tsConfig);
  pipe(absOutputFilepath, code);

  if (typeof config.postwatch === 'function') {
    config.postwatch({
      action: 'change',
      cwd,
      code,
      absInputFilepath,
      absOutputFilepath
    });
  }

  console.log(`✅ ${new Date().toLocaleTimeString()} File added "${relative(cwd, absInputFilepath)}"`);
}

async function change(filepath: string, cwd: string, config: XConfiguration, tsConfig: CompilerOptions) {
  const absInputFilepath = resolve(cwd, filepath);
  const absOutputFilepath = resolveOutputFilepath(cwd, config, filepath);

  const code = await transpile(absInputFilepath, tsConfig);
  pipe(absOutputFilepath, code);

  if (typeof config.postwatch === 'function') {
    config.postwatch({
      action: 'change',
      cwd,
      code,
      absInputFilepath,
      absOutputFilepath
    });
  }

  console.log(`✅ ${new Date().toLocaleTimeString()} File changed "${relative(cwd, absInputFilepath)}"`);
}

async function unlink(filepath: string, cwd: string, config: XConfiguration, tsConfig: CompilerOptions) {
  const absInputFilepath = resolve(cwd, filepath);
  const absOutputFilepath = resolveOutputFilepath(cwd, config, filepath);

  if (typeof config.postwatch === 'function') {
    config.postwatch({
      action: 'change',
      cwd,
      code: null,
      absInputFilepath,
      absOutputFilepath
    });
  }

  console.log(`✅ ${new Date().toLocaleTimeString()} File unlinked "${relative(cwd, absInputFilepath)}"`);
}

function resolveOutputFilepath(cwd: string, config: XConfiguration, filepath: string) {
  return resolveExtname(resolve(cwd, config.output, relative(resolve(cwd, config.input), filepath)));
}