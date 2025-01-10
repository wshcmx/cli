import { existsSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

export type WshcmxConfiguration = {
  postwatch?: (
    action: 'add' | 'change' | 'unlink',
    cwd: string,
    code: string | null,
    absInputFilepath: string,
    absOutputFilepath: string
  ) => void;
}

export const PLUGIN_CONFIG_FILE = 'wshcmx.config.js';

export async function getWshcmxConfig(cwd: string) {
  const wshcmxConfigFilePath = join(cwd, PLUGIN_CONFIG_FILE);

  if (!existsSync(wshcmxConfigFilePath)) {
    return {};
  }

  return (await import(wshcmxConfigFilePath)).default as WshcmxConfiguration;
}

export function getTSConfig(cwd: string): ts.ParsedCommandLine {
  const tsconfigPath = join(cwd, "tsconfig.json");

  if (!existsSync(tsconfigPath)) {
    console.error('There is no any configuration files. Execute npx tsc -init to create a new one.');
    process.exit(1);
  }

  const { config, error } = ts.readConfigFile(join(cwd, "tsconfig.json"), ts.sys.readFile);

  if (error) {
    console.error(error.messageText);
    process.exit(1);
  }

  const configFileContent = ts.parseJsonConfigFileContent(config, ts.sys, "./");

  if (configFileContent.errors.length > 0) {
    configFileContent.errors.forEach(x => {
      console.error(x.messageText);
    });

    process.exit(1);
  }

  return configFileContent;
}
