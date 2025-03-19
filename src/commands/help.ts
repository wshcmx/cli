import { logger } from '../core/logger.js';
import { commands } from './index.js';

export function help() {
  logger.warning('\n@wshcmx/cli plugin - CLI для работы с WebSoft HCM');
  console.log(`
Команды для вызова:
\t${Array.from(commands).map(x => `"${logger.success(x[0])}" - ${x[1].description}`).join('\n\t')}
`);
}