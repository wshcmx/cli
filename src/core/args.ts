export enum ArgsFlags {
  INCLUDE_NON_TS_FILES = 'include-non-ts-files',
  RETAIN_IMPORTS_AS_COMMENTS = 'retain-imports-as-comments',
  RETAIN_NON_ASCII_CHARACTERS = 'retain-non-ascii-characters',
}

class ArgsParser {
  #command: string = '';
  #argv: string[] = [];

  constructor() {
    this.#parse();
  }

  getArg(argName: string) {
    return process.argv.slice(2).find(x => x.startsWith('--') && x.slice(2) === argName);
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