import { resolve } from 'node:path';
import { existsSync, writeFileSync } from 'node:fs';
import { wshcmxConfigFileName } from './config.js';

export default function(cwd: string) {
  const wshcmxConfigFilePath = resolve(cwd, wshcmxConfigFileName);

  if (existsSync(wshcmxConfigFilePath)) {
    console.error(`A '${wshcmxConfigFileName}' file is already defined at: '${cwd}'.`)
    process.exit(1);
  }

  writeFileSync(wshcmxConfigFilePath, `/**
 * This file contains the configuration for wshcmx.
 */
export default {
  /**
   * This is is a post-watch hook. It is executed after the watch command is finished on a file.
   * @param {string} action - The action that was performed. This can be either 'add', 'change', or 'unlink'.
   * @param {string} cwd - The current working directory.
   * @param {string} code - The source code of the file.
   * @param {string} absInputFilepath - The absolute input file path.
   * @param {string} absOutputFilepath - The absolute output file path.
   */
  postwatch: (
    action,
    cwd,
    code,
    absInputFilepath,
    absOutputFilepath
  ) => {
    // Do something after the watch command is finished.
  }
}`);

  console.log(`Created a new '${wshcmxConfigFileName}' at: '${cwd}'`);
}