export enum OS {
  Linux = 0,
  Windows = 1,
  macOS = 2
}

export interface Document {
  TopElem: Document;
  Name: string;
}

export function submoduleFunction(document: Document) {
  return `Document name is ${document.Name}`;
}