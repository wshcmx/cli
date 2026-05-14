export enum ArgsFlags {
  INCLUDE_NON_TS_FILES = 'include-non-ts-files',
  RETAIN_IMPORTS_AS_COMMENTS = 'retain-imports-as-comments',
  RETAIN_NON_ASCII_CHARACTERS = 'retain-non-ascii-characters',
}

export class ArgsParser {
  #command: string = '';
  #argv: string[] = [];

  constructor() {
    this.#parse();
  }

  getArg(argName: string) {
    const argumentsList = process.argv.slice(2);

    for (let i = 0; i < argumentsList.length; i++) {
      const argument = argumentsList[i];

      if (!argument.startsWith(`--${argName}`)) {
        continue;
      }

      if (argument === `--${argName}`) {
        const nextArgument = argumentsList[i + 1];
        return nextArgument?.startsWith('--') ? undefined : nextArgument;
      }

      if (argument.startsWith(`--${argName}=`)) {
        return argument.slice(argName.length + 3);
      }
    }

    return undefined;
  }

  getCommand() {
    return this.#command;
  }

  has(argumentName: ArgsFlags) {
    return this.#argv.includes(argumentName);
  }

  #parse() {
    this.#command = process.argv.slice(2)[0];
    this.#argv = process.argv.slice(3).filter((x: string) => x.startsWith('--')).map((x: string) => x.slice(2));
  }
}

export const args = new ArgsParser();
