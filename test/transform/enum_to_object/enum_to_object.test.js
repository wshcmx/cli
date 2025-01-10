import test, { suite } from 'node:test';
import { readFileSync } from 'node:fs';
// import { enumToObject } from '../../../src/transformers/enum_to_object.js';

// import ts from "typescript";
import { resolve } from 'node:path';
import { transform } from '../../../dist/compile.js';

suite('Suite of snapshot enum_to_object tests', () => {
  // function visitor(node) {
  //   enumToObject(node);
  //   return ts.visitEachChild(node, visitor, undefined);
  // }

  test('Enum simple', (t) => {
    const filePath = resolve(import.meta.dirname, 'enum_to_object_sample.ts');
    const code = readFileSync(filePath, 'utf8');

    // const sourceFile = ts.createSourceFile('', code, ts.ScriptTarget.ES5, true);
    // const result = ts.transform(sourceFile, [() => (rootNode) => ts.visitNode(rootNode, visitor)]);
    // const printer = ts.createPrinter();
    // const transformed = printer.printFile(result.transformed[0].getSourceFile());
    // const transpiled = ts.transpile(transformed, { noEmit: true });

    const transformed = transform(filePath, code, { noEmit: true });
    // const printer = ts.createPrinter();
    // const transformed = printer.printFile(result.transformed[0].getSourceFile());
    // console.log(transformed)
    t.assert.snapshot(transformed, { serializers: [v => v] });
  });
});
