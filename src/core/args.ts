export enum ArgsFlags {
    INCLUDE_NON_TS_FILES = 'include-non-ts-files'
}

class ArgsParser {
    #command: string = '';
    #argv: string[] = [];

    constructor() {
        this.#parse();
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