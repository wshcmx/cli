export enum OS {
  Linux = 0,
  Windows = 1,
  macOS = 2
}

export interface Document {
  TopElem: Document;
  Name: string;
}

export function callableFunction(argumentWithDefaultValue = 0) {
  return `Argument value is ${argumentWithDefaultValue}`;
}

export namespace Module {
  export function method(a: number, b: number): string {
    return `Результат: ${a + b}`;
  }
}
