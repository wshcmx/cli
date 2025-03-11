import ts from 'typescript';
import { logger } from './logger.js';

export function getTSConfig(cwd: string, project: string = 'tsconfig.json'): ts.ParsedCommandLine {
  const tsconfigPath = ts.findConfigFile(cwd, ts.sys.fileExists, project);

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
