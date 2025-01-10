import { commands } from './index.js';

export function help() {
  console.log(`\n@wshcmx/cli plugin - cli to work with WebSoft HCM easily!

Available cli commands:
\t${Array.from(commands).map(x => `"${x[0]}" - ${x[1].description}`).join('\n\t')}
`);
}