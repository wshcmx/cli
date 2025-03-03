import { styleText } from 'node:util';

import { commands } from './index.js';

export function help() {
  console.log(styleText('yellow', '\n@wshcmx/cli plugin - CLI для работы с WebSoft HCM'));
  console.log(`
Команды для вызова:
\t${Array.from(commands).map(x => `"${styleText('greenBright', x[0])}" - ${x[1].description}`).join('\n\t')}
`);
}