import util from 'node:util';

class Logger {
  #styleText: Function = (_color: string, message: string) => message;

  constructor() {
    const nodeVersionArray = process.versions.node.split('.');

    if (
      Number(nodeVersionArray[0]) > 21 ||
      (Number(nodeVersionArray[0]) === 21 && Number(nodeVersionArray[1]) > 7)
    ) {
      this.#styleText = util.styleText;
    }
  }

  error(message: string) {
    console.error(this.#styleText('red', message));
  }

  success(message: string) {
    console.log(this.#styleText('greenBright', message));
  }

  warning(message: string) {
    console.warn(this.#styleText('yellow', message));
  }
}

export const logger = new Logger();