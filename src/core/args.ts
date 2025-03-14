export enum ArgsFlags {
  INCLUDE_NON_TS_FILES = 'include-non-ts-files',
  RETAIN_NON_ASCII_CHARACTERS = 'retain-non-ascii-characters',
}

class ArgsParser {
  #command: string = '';
  #argv: string[] = [];

  constructor() {
    this.#parse();
  }

  getArg(argName: string) {
    const args = process.argv.slice(2);

    for (let i = 0; i < args.length; i++) {
      const x = args[i];

      if (x.startsWith('--') && x.slice(2) === argName) {
        return args[i + 1];
      }
    }
  }

  getCommand() {
    return this.#command;
  }

  has(argumentName: ArgsFlags) {
    return this.#argv.includes(argumentName);
  }

  #parse() {
    this.#command = process.argv.slice(2)[0];
    this.#argv = process.argv.slice(3).filter(x => x.startsWith('--')).map(x => x.slice(2));
  }
}

export const args = new ArgsParser();