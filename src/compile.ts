import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import ts, { CompilerOptions } from 'typescript';

const reservedExtensions = ['.ts', '.tsx', '.js', '.jsx'];

export function pretransform(code: string) {
  function visitor(node: ts.Node) {
    if (ts.isExportDeclaration(node) || ts.isImportDeclaration(node)) {
      return ts.factory.createNotEmittedStatement(node);
    }

    if (ts.isTemplateExpression(node)) {
      const expressions = [ts.factory.createStringLiteral(node.head.text)];

      node.templateSpans.forEach(span => {
        expressions.push(ts.factory.createStringLiteral(span.expression.getText()));
        expressions.push(ts.factory.createStringLiteral(span.literal.text));
      });
  
      let concatenated: ts.Expression = expressions[0];
  
      for (let i = 1; i < expressions.length; i++) {
        concatenated = ts.factory.createBinaryExpression(
          concatenated,
          ts.SyntaxKind.PlusToken,
          expressions[i]
        );
      }

      return concatenated;
    }

    if (ts.isEnumDeclaration(node)) {
      const members = node.members.map((member, index) => {
        const name = member.name;
        const initializer = member.initializer || ts.factory.createNumericLiteral(index);
        return ts.factory.createPropertyAssignment(name, initializer);
      });

      const objectLiteral = ts.factory.createObjectLiteralExpression(members, true);
      const variableStatement = ts.factory.createVariableStatement(
        [],
        [ts.factory.createVariableDeclaration(node.name, undefined, undefined, objectLiteral)]
      );

      return variableStatement;
    }

    return ts.visitEachChild(node, visitor, undefined);
  }

  const sourceFile = ts.createSourceFile('', code, ts.ScriptTarget.ES5, true);
  const result = ts.transform(sourceFile, [() => (rootNode: ts.Node) => ts.visitNode(rootNode, visitor)]);
  const printer = ts.createPrinter();
  return printer.printFile(result.transformed[0].getSourceFile());
}

export async function transpile(path: string, compilerOptions: CompilerOptions) {
  return [
    pretransform,
    (code: string) => ts.transpile(code, compilerOptions)
  ].reduce((acc, fn) => fn(acc), readFileSync(path, 'utf-8'));
}

export function resolveExtname(file: string) {
  const ext = extname(file);

  if (reservedExtensions.includes(ext)) {
    return resolve(dirname(file), `${basename(file, ext)}.js`);
  }

  return file;
}

export function pipe(filepath: string, content: string) {
  const dir = dirname(filepath);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(filepath, content);
}