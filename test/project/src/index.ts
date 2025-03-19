import { Document, submoduleFunction } from './submodule';

export function callableFunction(argumentWithDefaultValue = 0) {
  return `Argument value is ${argumentWithDefaultValue}`;
}

export namespace Module {
  export function method(a: number, b: number): string {
    return `Результат: ${a + b}`;
  }
}

submoduleFunction({ Name: 'Document' } as Document);