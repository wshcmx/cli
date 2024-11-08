import { resolve } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { wshcmxConfigFileName } from './config.js';

export default function(cwd: string) {
  const wshcmxConfigFilePath = resolve(cwd, wshcmxConfigFileName);

  if (existsSync(wshcmxConfigFilePath)) {
    console.error(`A '${wshcmxConfigFileName}' file is already defined at: '${cwd}'.`)
    process.exit(1);
  }

  const wshcmxTemplate = readFileSync(resolve(import.meta.dirname, 'wshcmx.config.template.js'), 'utf-8');
  writeFileSync(wshcmxConfigFilePath, wshcmxTemplate);
  console.log(`Created a new '${wshcmxConfigFileName}' at: '${cwd}'`);
}