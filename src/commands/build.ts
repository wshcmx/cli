import { getTSConfig } from './config.js';
import { compile } from '../compile.js';

export function build(cwd: string) {
  console.log(`🔨 Building started`);
  const configuration = getTSConfig(cwd);
  compile(configuration);
}
