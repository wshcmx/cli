import { resolve } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { PLUGIN_CONFIG_FILE } from './config.js';

export function init(cwd: string) {
  const pluginConfigFilePath = resolve(cwd, PLUGIN_CONFIG_FILE);

  if (existsSync(pluginConfigFilePath)) {
    console.error(`'${PLUGIN_CONFIG_FILE}' file is already defined at: '${cwd}'.`)
    return;
  }

  const pluginConfigFileTemplate = readFileSync(resolve(import.meta.dirname, '..', 'wshcmx.config.template.js'), 'utf-8');
  writeFileSync(pluginConfigFilePath, pluginConfigFileTemplate);
  console.log(`Plugin configuration '${PLUGIN_CONFIG_FILE}' has been succesfully created at '${cwd}'`);
}