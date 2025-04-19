export enum ArgsFlags {
  INCLUDE_NON_TS_FILES = 'include-non-ts-files',
  PROJECT = 'project',
  RETAIN_IMPORTS_AS_COMMENTS = 'retain-imports-as-comments',
  RETAIN_NON_ASCII_CHARACTERS = 'retain-non-ascii-characters',
}

class ArgsParser {
  command: string = '';
  private args: Map<string, string> = new Map();

  constructor() {
    this.parse();
  }

  get(name: ArgsFlags) {
    return this.args.get(name);
  }

  has(name: ArgsFlags) {
    return this.args.get(name) !== undefined;
  }

  private parse() {
    this.command = process.argv.slice(2)[0];
    const args = process.argv.slice(3);

    for (let i = 0; i < args.length; i++) {
      if (!args[i].startsWith('--')) {
        continue;
      }

      if (!args[i + 1]?.startsWith('--')) {
        this.args.set(args[i].slice(2), args[i + 1]);
      } else {
        this.args.set(args[i].slice(2), '');
      }
    }
  }
}

export const args = new ArgsParser();