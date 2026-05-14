import { value } from './submodule';

export namespace Module {
  export function method(a: number, b: number): string {
    return `Результат: ${a + b}`;
  }
}

export function readValue() {
  return value;
}
