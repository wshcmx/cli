import { parseArgs } from "node:util";

class ArgsParser {
  command: string = '';
  args: Record<string, any> = {} ;

  constructor() {
    const { values: args, positionals: [command] } = parseArgs({
      options: {
        help: { type: 'boolean', short: 'h', default: false },
        version: { type: 'boolean', short: 'v', default: false },
        project: { type: 'string', short: 'p', default: 'tsconfig.json' },
        'retain-non-ascii-characters': { type: 'boolean', default: false },
      },
      allowPositionals: true
    });
    this.command = command || '';
    this.args = args;
  }
}

export const { args, command } = new ArgsParser();
