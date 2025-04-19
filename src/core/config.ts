import { existsSync, lstatSync } from 'node:fs';
import { parse } from 'node:path';

import ts from 'typescript';

import { logger } from './logger.js';

export function getTSConfig(cwd: string): ts.ParsedCommandLine {
  if (!existsSync(cwd)) {
    logger.error(`The project path "${cwd}" does not exist.`);
    process.exit(1);
  }

  let configName = 'tsconfig.json';
  let path = cwd;

  if (!lstatSync(cwd).isDirectory()) {
    const { base, dir } = parse(cwd);
    configName = base;
    path = dir;
  }

  const tsconfigPath = ts.findConfigFile(path, ts.sys.fileExists, configName);

  if (!tsconfigPath) {
    logger.error(`There is no any configuration files at "${cwd}". Execute npx tsc -init to create a new one.`);
    process.exit(1);
  }

  const { config, error } = ts.readConfigFile(tsconfigPath, ts.sys.readFile);

  if (error) {
    logger.error(error.messageText.toString());
    process.exit(1);
  }

  const configFileContent = ts.parseJsonConfigFileContent(config, ts.sys, './');

  if (configFileContent.errors.length > 0) {
    configFileContent.errors.forEach(x => {
      logger.error(x.messageText.toString());
    });

    process.exit(1);
  }

  return configFileContent;
}
