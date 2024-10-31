import { watch } from 'chokidar';
import { CompilerOptions } from 'typescript';
import { relative, resolve } from 'node:path';
import { pipe, resolveOutputFilepath, transpile } from './compile.js';

export default function(cwd: string, tsConfig: CompilerOptions) {
  console.log(`🔎 Watching for changes in "${tsConfig.rootDir}"`);

  watch(tsConfig.rootDir!, {
    cwd,
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
  })
    .on('add', filepath => add(filepath, cwd, tsConfig))
    .on('change', filepath => change(filepath, cwd, tsConfig))
    .on('unlink', filepath => unlink(filepath, cwd, tsConfig))
}

async function add(filepath: string, cwd: string, tsConfig: CompilerOptions) {
  const absInputFilepath = resolve(cwd, filepath);
  const absOutputFilepath = resolveOutputFilepath(tsConfig.rootDir!, filepath, tsConfig.outDir!);

  const code = await transpile(absInputFilepath, tsConfig);
  pipe(absOutputFilepath, code);

  // if (typeof config.postwatch === 'function') {
  //   config.postwatch({
  //     action: 'change',
  //     cwd,
  //     code,
  //     absInputFilepath,
  //     absOutputFilepath
  //   });
  // }

  console.log(`✅ ${new Date().toLocaleTimeString()} File added "${relative(cwd, absInputFilepath)}"`);
}

async function change(filepath: string, cwd: string, tsConfig: CompilerOptions) {
  const absInputFilepath = resolve(cwd, filepath);
  const absOutputFilepath = resolveOutputFilepath(tsConfig.rootDir!, filepath, tsConfig.outDir!);

  const code = await transpile(absInputFilepath, tsConfig);
  pipe(absOutputFilepath, code);

  // if (typeof config.postwatch === 'function') {
  //   config.postwatch({
  //     action: 'change',
  //     cwd,
  //     code,
  //     absInputFilepath,
  //     absOutputFilepath
  //   });
  // }

  console.log(`✅ ${new Date().toLocaleTimeString()} File changed "${relative(cwd, absInputFilepath)}"`);
}

async function unlink(filepath: string, cwd: string, tsConfig: CompilerOptions) {
  const absInputFilepath = resolve(cwd, filepath);
  const absOutputFilepath = resolveOutputFilepath(tsConfig.rootDir!, filepath, tsConfig.outDir!);

  // if (typeof config.postwatch === 'function') {
  //   config.postwatch({
  //     action: 'change',
  //     cwd,
  //     code: null,
  //     absInputFilepath,
  //     absOutputFilepath
  //   });
  // }

  console.log(`✅ ${new Date().toLocaleTimeString()} File unlinked "${relative(cwd, absInputFilepath)}"`);
}
