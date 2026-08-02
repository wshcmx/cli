#!/usr/bin/env node

import { parseArgs } from "node:util";

import { buildTypescriptFiles, watchTypescriptFiles } from './core/build.js';
import { getTSConfig } from './core/config.js';

export const { values: args, positionals: [command] } = parseArgs({
  options: {
    help: { type: 'boolean', short: 'h', default: false },
    version: { type: 'boolean', short: 'v', default: false },
    project: { type: 'string', short: 'p', default: 'tsconfig.json' },
  },
  allowPositionals: true
});

const CWD = process.cwd();

if (command === 'build') {
  console.log(`🔨 ${new Date().toLocaleTimeString()} Project building started`);
  const configuration = getTSConfig(CWD, args['project']);

  const result = buildTypescriptFiles(configuration);

  if (result?.emitSkipped) {
    console.error(`❌ ${new Date().toLocaleTimeString()} Project building failed`);
    process.exit(1);
  }

  console.log(`✅ ${new Date().toLocaleTimeString()} Project building finished`);
} else if (command === 'watch') {
  const configuration = getTSConfig(CWD, args['project']);
  watchTypescriptFiles(configuration);
} else {
    console.warn('\n@wshcmx/cli plugin - CLI для работы с WebSoft HCM');
    console.log(`
  Команды для вызова:
  build - сборка проекта

  `);
}