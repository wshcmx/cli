import { styleText } from 'node:util';

import { commands } from './index.js';

export function help() {
  console.log(styleText('yellow', '\n@wshcmx/cli plugin - cli to work with WebSoft HCM easily!'));
  console.log(`
Available cli commands:
\t${Array.from(commands).map(x => `"${styleText('greenBright', x[0])}" - ${x[1].description}`).join('\n\t')}
`);
}